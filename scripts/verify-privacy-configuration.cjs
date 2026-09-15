const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const backupRulesPath = path.join(root, 'android', 'app', 'src', 'main', 'res', 'xml', 'backup_rules.xml');
const extractionRulesPath = path.join(root, 'android', 'app', 'src', 'main', 'res', 'xml', 'data_extraction_rules.xml');
const appPath = path.join(root, 'src', 'App.jsx');
const translationServicePath = path.join(root, 'src', 'services', 'automatic-translation.js');
const mainActivityPath = path.join(root, 'android', 'app', 'src', 'main', 'java', 'com', 'mcographics', 'fromdarknesstolight', 'MainActivity.java');
const privacyShieldPath = path.join(root, 'android', 'app', 'src', 'main', 'java', 'com', 'mcographics', 'fromdarknesstolight', 'PrivacyShieldPlugin.java');
const neutralSplashStylePath = path.join(root, 'android', 'app', 'src', 'main', 'res', 'values', 'styles.xml');
const neutralSplashIconPath = path.join(root, 'android', 'app', 'src', 'main', 'res', 'drawable', 'neutral_splash_icon.xml');
const electronMainPath = path.join(root, 'electron', 'main.cjs');
const electronPreloadPath = path.join(root, 'electron', 'preload.cjs');
const electronSplashPath = path.join(root, 'electron', 'splash.html');

function read(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing privacy configuration file: ${path.relative(root, filePath)}`);
  return fs.readFileSync(filePath, 'utf8');
}

function requireText(source, pattern, description) {
  if (!pattern.test(source)) throw new Error(`Privacy configuration is incomplete: ${description}`);
}

const manifest = read(manifestPath);
const backupRules = read(backupRulesPath);
const extractionRules = read(extractionRulesPath);
const app = read(appPath);
const translationService = read(translationServicePath);
const mainActivity = read(mainActivityPath);
const privacyShield = read(privacyShieldPath);
const neutralSplashStyle = read(neutralSplashStylePath);
const electronMain = read(electronMainPath);
const electronPreload = read(electronPreloadPath);
const electronSplash = read(electronSplashPath);
if (!fs.existsSync(neutralSplashIconPath)) throw new Error('Missing neutral Android splash icon.');

requireText(manifest, /android:allowBackup="false"/, 'Android backup must be disabled.');
requireText(manifest, /android:dataExtractionRules="@xml\/data_extraction_rules"/, 'Android 12+ extraction rules must be referenced.');
requireText(manifest, /android:fullBackupContent="@xml\/backup_rules"/, 'legacy backup rules must be referenced.');
requireText(backupRules, /<full-backup-content>/, 'legacy full-backup content root is missing.');
requireText(extractionRules, /<cloud-backup>[\s\S]*<\/cloud-backup>/, 'cloud-backup rules are missing.');
requireText(extractionRules, /<device-transfer>[\s\S]*<\/device-transfer>/, 'device-transfer rules are missing.');

for (const domain of ['root', 'file', 'database', 'sharedpref', 'external']) {
  requireText(backupRules, new RegExp(`<exclude domain="${domain}" path="\\."`), `legacy ${domain} data is not excluded.`);
  requireText(extractionRules, new RegExp(`<exclude domain="${domain}" path="\\."`), `Android 12+ ${domain} data is not excluded.`);
}

requireText(app, /excludes private study state from cloud backup and device-to-device transfer/, 'Settings must explain the Android backup boundary.');
requireText(app, /saved study state stays in local app storage and is excluded from Android cloud backup and device-to-device transfer/, 'Privacy notice must explain the Android backup boundary.');
requireText(app, /PRIVACY_LOCKOUT_THRESHOLD = 5/, 'PIN lockout must have a bounded failed-attempt threshold.');
requireText(app, /PRIVACY_LOCKOUT_MAX_MS = 5 \* 60 \* 1000/, 'PIN lockout must have a bounded maximum delay.');
requireText(app, /onFailedAttempt\?\.\(\)/, 'The PIN screen must report failed attempts to the app state.');
requireText(app, /Too many incorrect attempts/, 'The PIN screen must explain an active lockout.');
requireText(app, /this build creates no notifications and requests no notification permission/i, 'The privacy notice must document notification behavior.');
requireText(app, /copying a verse or using the system share surface can expose text/i, 'The privacy notice must document clipboard and sharing behavior.');
requireText(app, /It is not encrypted at rest in this prototype|it is not encrypted at rest in this prototype/, 'The privacy notice must document encryption-at-rest limits.');
requireText(app, /no remote analytics or crash-reporting service/, 'The privacy notice must document remote logging behavior.');
requireText(app, /fdl-offline-mode/, 'Offline-only mode must persist its local setting.');
requireText(app, /setAutomaticTranslationOffline\(offlineMode\)/, 'Offline-only mode must control automatic translation requests.');
requireText(app, /if \(offlineMode\) \{[\s\S]*?status: 'offline'/, 'Offline-only mode must stop update checks.');
requireText(app, /Offline-only mode/, 'Offline-only mode must be visible in the app UI.');
requireText(app, /pauses GitHub update checks and uncached online translation requests/, 'The privacy notice must explain the offline-only network boundary.');
requireText(app, /const shouldProtectWindow = !onboardingComplete \|\| discreetMode/, 'Renderer privacy state must protect the startup and Discreet Mode surfaces.');
requireText(app, /setPrivacyState/, 'Renderer privacy state must reach the desktop shell.');
requireText(app, /setStartupPrivacy/, 'Renderer privacy state must reach the Android shell.');
requireText(app, /applies Android <code>FLAG_SECURE<\/code> before the WebView starts/, 'The privacy notice must describe early Android screen protection.');
requireText(mainActivity, /shouldUseNeutralStartup\(this\)/, 'Android must choose the neutral launch theme from stored privacy state.');
requireText(mainActivity, /applyStoredPrivacy\(this\)/, 'Android must apply screen protection before the WebView and again on resume.');
requireText(privacyShield, /SharedPreferences/, 'Android startup privacy state must persist outside renderer storage.');
requireText(privacyShield, /FLAG_SECURE/, 'Android privacy protection must use FLAG_SECURE.');
requireText(privacyShield, /setStartupPrivacy/, 'Android must expose a startup privacy bridge.');
requireText(neutralSplashStyle, /AppTheme\.NoActionBarLaunchNeutral/, 'Android must provide a neutral splash theme.');
requireText(electronMain, /setContentProtection/, 'Electron must request desktop content protection.');
requireText(electronMain, /app:privacy-state/, 'Electron must receive renderer privacy state.');
requireText(electronMain, /loadFile\(path\.join\(__dirname, 'splash\.html'\), \{ query: \{ neutral:/, 'Electron splash must choose a neutral or branded startup before the renderer loads.');
requireText(electronPreload, /setPrivacyState/, 'Electron preload must expose the privacy-state bridge.');
requireText(electronSplash, /neutral-startup/, 'Electron splash must have a neutral startup presentation.');
requireText(electronSplash, /data-branded-src/, 'Electron splash must avoid loading the branded image during neutral startup.');
requireText(app, /clearAutomaticTranslationCache\(\)/, 'Private-data deletion must clear the automatic translation cache.');
requireText(app, /data-no-translate=\{translationKey !== 'en' \? 'true' : undefined\}/, 'Bible reader verses must use the Bible-specific translation path.');
requireText(app, /data-no-translate=\{translation\?\.id !== 'en' \? 'true' : undefined\}/, 'Bible audio verse choices must use the Bible-specific translation path.');
requireText(translationService, /let translationOfflineOnly = false/, 'Automatic translation must have an explicit offline-only state.');
requireText(translationService, /export function setAutomaticTranslationOffline\(enabled\)/, 'Automatic translation must expose its offline-only control.');
requireText(translationService, /if \(translationOfflineOnly\) return null/, 'Automatic translation must avoid uncached network requests while offline-only mode is enabled.');
requireText(translationService, /activeControllers\.forEach\(\(controller\) => controller\.abort\(\)\)/, 'Enabling offline-only mode must cancel active translation requests.');
requireText(translationService, /activeControllers\.add\(controller\)/, 'Translation requests must be tracked for offline cancellation.');

console.log('Privacy configuration verified: Android backup is disabled, local lockout and offline-only network boundaries are documented, and the in-app privacy limits are enforced by source checks.');
