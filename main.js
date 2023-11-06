const path = require('path');
const { app, BrowserWindow } = require('electron');

const isMac = process.platform === 'darwin';

// does not seem to work
const isDev = process.env.NODE_ENV !== 'production';

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    title: 'Image resizer',
    width: isDev ? 1000 : 500,
    height: 600
  });

  // open dev tools if is in dev
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
};

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});
