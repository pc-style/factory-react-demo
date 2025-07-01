const { app, BrowserWindow } = require('electron');
const path = require('path');

const PORT = 5173;

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Factory Demo',
    // Use the official 128×128 Factory icon from tutorial assets
    icon: path.join(__dirname, '../assets/128x128.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL(`http://localhost:${PORT}`);
}

app.whenReady().then(createWindow);
