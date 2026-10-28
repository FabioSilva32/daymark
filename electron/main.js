const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;

function isServerRunning(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
  });
}

function startNextServer() {
  const isWin = process.platform === 'win32';
  const npmCmd = isWin ? 'npm.cmd' : 'npm';
  serverProcess = spawn(npmCmd, ['run', 'start', '--', '-p', '3001'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'ignore',
    shell: true,
  });
}

function waitForServer(url, timeoutMs = 25000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const check = () => {
      const req = http.get(url, (res) => {
        resolve(true);
      });
      req.on('error', () => {
        if (Date.now() - startTime > timeoutMs) {
          resolve(false);
        } else {
          setTimeout(check, 400);
        }
      });
    };
    check();
  });
}

async function createWindow() {
  const targetUrl = process.env.DAYMARK_DESKTOP_URL || 'http://localhost:3001';
  const running = await isServerRunning(targetUrl);
  if (!running && !process.env.DAYMARK_DESKTOP_URL) {
    startNextServer();
  }

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#000000',
    title: 'Daymark — Personal Command Centre',
    icon:
      process.platform === 'win32'
        ? path.join(__dirname, '../public/daymark.ico')
        : path.join(__dirname, '../public/icon-512.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  await waitForServer(targetUrl);
  mainWindow.loadURL(targetUrl);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http') && !url.includes('localhost:3001')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t']);
      } else {
        serverProcess.kill();
      }
    } catch (e) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
