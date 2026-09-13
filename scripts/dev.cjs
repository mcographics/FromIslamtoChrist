const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const viteEntry = path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
const electronBinary = require('electron');

const renderer = spawn(process.execPath, [viteEntry, '--host', '127.0.0.1'], {
  stdio: 'inherit',
  shell: false,
});

let desktop;
let stopped = false;

function stop(exitCode = 0) {
  if (stopped) return;
  stopped = true;
  if (desktop && !desktop.killed) desktop.kill();
  if (renderer && !renderer.killed) renderer.kill();
  process.exit(exitCode);
}

function waitForRenderer(attempt = 0) {
  const request = http.get('http://127.0.0.1:5173', (response) => {
    response.resume();
    if (response.statusCode && response.statusCode < 500) {
      const desktopEnvironment = { ...process.env };
      delete desktopEnvironment.ELECTRON_RUN_AS_NODE;
      desktopEnvironment.VITE_DEV_SERVER_URL = 'http://127.0.0.1:5173';
      desktop = spawn(electronBinary, ['.'], {
        stdio: 'inherit',
        shell: false,
        env: desktopEnvironment,
      });
      desktop.on('exit', (code) => stop(code || 0));
      return;
    }
    retry(attempt);
  });

  request.on('error', () => retry(attempt));
}

function retry(attempt) {
  if (attempt >= 80) {
    console.error('Vite did not become ready within 20 seconds.');
    stop(1);
    return;
  }
  setTimeout(() => waitForRenderer(attempt + 1), 250);
}

renderer.on('exit', (code) => {
  if (!desktop) stop(code || 0);
});

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

waitForRenderer();
