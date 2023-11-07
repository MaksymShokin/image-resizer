const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

const isMac = process.platform === 'darwin';

const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    title: 'Image resizer',
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // open dev tools if is in dev
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
};

const createAboutWindow = () => {
  const aboutWindow = new BrowserWindow({
    title: 'About Image Resizer',
    width: 300,
    height: 300
  });

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
};

// Menu template
const menu = [
  // {
  //   label: 'File',
  //   submenu: [
  //     {
  //       label: 'Quit',
  //       click: app.quit,
  //       accelerator: 'CmdOrCtrl+W'
  //     }
  //   ]
  // },

  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: createAboutWindow
            }
          ]
        }
      ]
    : []),
  { role: 'fileMenu' },
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: createAboutWindow
            }
          ]
        }
      ]
    : [])
];

// app is ready
app.whenReady().then(() => {
  createMainWindow();

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // remove main window memory on close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

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

// respond to ipcRenderer resize
ipcMain.on('image:resize', (event, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer');
  resizeImage(options);
});

async function resizeImage({ height, width, dest, imagePath }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imagePath), {
      width: Number(width),
      height: Number(height)
    });
    const fileName = path.basename(imagePath);

    // check if destination folder exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    fs.writeFileSync(path.join(dest, fileName), newPath);

    // send message to renderer
    mainWindow.webContents.send('image:done');

    // open des folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}
