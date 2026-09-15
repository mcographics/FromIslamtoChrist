const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const fsSync = require('node:fs');
const fs = require('node:fs/promises');
const path = require('node:path');

const isDevelopment = Boolean(process.env.VITE_DEV_SERVER_URL);
const projectRoot = path.resolve(__dirname, '..');
const logoRoot = path.resolve(__dirname, '..', 'logo');
const appIconPath = path.join(logoRoot, 'icon.png');
const contentDatabasePath = path.join(projectRoot, isDevelopment ? 'public' : 'dist', 'data', 'from-darkness-to-light.db');
let mainWindow = null;
let splashWindow = null;
let lastUpdateStatus = { status: 'idle' };

function startupPrivacyPath() {
  return path.join(app.getPath('userData'), 'startup-privacy.json');
}

function readStartupPrivacy() {
  try {
    const stored = JSON.parse(fsSync.readFileSync(startupPrivacyPath(), 'utf8'));
    return {
      discreetMode: stored?.discreetMode !== false,
      onboardingComplete: stored?.onboardingComplete === true,
    };
  } catch {
    return { discreetMode: true, onboardingComplete: false };
  }
}

function applyWindowPrivacy(window, state, startupEntered = false) {
  if (!window || window.isDestroyed()) return;
  const discreetMode = state?.discreetMode !== false;
  const onboardingComplete = state?.onboardingComplete === true;
  const protectedWindow = !onboardingComplete || discreetMode;
  window.setContentProtection?.(protectedWindow);
  const neutralStartup = onboardingComplete && discreetMode && !startupEntered;
  window.setTitle(neutralStartup ? 'Private space' : 'From Islam to Christ');
}

ipcMain.handle('content:database', async () => {
  try {
    const database = await fs.readFile(contentDatabasePath);
    return new Uint8Array(database).buffer;
  } catch (error) {
    throw new Error(`Content database unavailable: ${error.message}`);
  }
});

ipcMain.handle('app:privacy-state', async (_event, value) => {
  const state = {
    discreetMode: value?.discreetMode !== false,
    onboardingComplete: value?.onboardingComplete === true,
  };
  await fs.mkdir(path.dirname(startupPrivacyPath()), { recursive: true });
  await fs.writeFile(startupPrivacyPath(), JSON.stringify(state), 'utf8');
  applyWindowPrivacy(mainWindow, state, value?.startupEntered === true);
  return { ok: true, protected: !state.onboardingComplete || state.discreetMode };
});

function publishUpdateStatus(status, details = {}) {
  lastUpdateStatus = { status, ...details };
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('update:status', lastUpdateStatus);
}

function setupAutoUpdater() {
  if (isDevelopment) {
    publishUpdateStatus('development', { message: 'Updates are checked from packaged builds.' });
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.on('checking-for-update', () => publishUpdateStatus('checking'));
  autoUpdater.on('update-available', (info) => publishUpdateStatus('available', { version: info.version, releaseName: info.releaseName || null }));
  autoUpdater.on('update-not-available', (info) => publishUpdateStatus('current', { version: info.version || app.getVersion() }));
  autoUpdater.on('download-progress', (progress) => publishUpdateStatus('downloading', { percent: Math.round(progress.percent), bytesPerSecond: progress.bytesPerSecond }));
  autoUpdater.on('update-downloaded', (info) => publishUpdateStatus('downloaded', { version: info.version, releaseName: info.releaseName || null }));
  autoUpdater.on('error', (error) => publishUpdateStatus('error', { message: error?.message || 'Update check failed.' }));

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((error) => publishUpdateStatus('error', { message: error?.message || 'Update check failed.' }));
  }, 2500);
}

ipcMain.handle('app:update-check', async () => {
  if (isDevelopment) return { status: 'development', message: 'Updates are checked from packaged builds.' };
  try {
    await autoUpdater.checkForUpdates();
    return lastUpdateStatus;
  } catch (error) {
    publishUpdateStatus('error', { message: error?.message || 'Update check failed.' });
    return lastUpdateStatus;
  }
});

ipcMain.handle('app:update-install', () => {
  if (isDevelopment) return { ok: false, message: 'Install updates from a packaged build.' };
  autoUpdater.quitAndInstall(false, true);
  return { ok: true };
});

ipcMain.handle('app:open-external', async (_event, value) => {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only web links can be opened.');
    await shell.openExternal(url.toString());
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error?.message || 'That link could not be opened.' };
  }
});

function createWindow() {
  const startupPrivacy = readStartupPrivacy();
  const window = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: '#10212d',
    icon: appIconPath,
    title: startupPrivacy.onboardingComplete && startupPrivacy.discreetMode ? 'Private space' : 'From Islam to Christ',
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  applyWindowPrivacy(window, startupPrivacy);
  window.on('page-title-updated', (event) => event.preventDefault());

  window.setMenuBarVisibility(false);

  window.once('ready-to-show', () => window.show());
  window.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    splashWindow = null;
  });
  mainWindow = window;
  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null;
  });

  if (isDevelopment) {
    window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

function createSplashWindow() {
  const startupPrivacy = readStartupPrivacy();
  const neutralStartup = startupPrivacy.onboardingComplete && startupPrivacy.discreetMode;
  splashWindow = new BrowserWindow({
    width: 520,
    height: 520,
    resizable: false,
    maximizable: false,
    minimizable: false,
    frame: false,
    show: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: '#10212d',
    icon: appIconPath,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'), { query: { neutral: neutralStartup ? '1' : '0' } });
}

app.whenReady().then(() => {
  createSplashWindow();
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
  if (process.platform !== 'darwin') app.quit();
});
