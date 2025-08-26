const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
// Local helpers for indexing/searching documents
const docIndex = require('./docIndex');

const PORT = 5174;
// Absolute path to the local documents directory
const DOCS_DIR = path.join(__dirname, '../documents');

function createWindow () {
  const win = new BrowserWindow({
    width: 900,      // Reduced for a more compact demo window
    height: 600,     // Reduced height for better focus
    title: 'Factory Demo',
    // Use the official 128×128 Factory icon from tutorial assets
    icon: path.join(__dirname, '../assets/128x128.png'),
    // Ensure the window is given focus when created
    focus: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadURL(`http://localhost:${PORT}`);

  // Explicitly focus the window after it finishes loading to bring it
  // to the foreground on application start.
  win.focus();
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create a window when the dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Create window when Electron is ready
app.whenReady().then(createWindow);

/**
 * IPC handlers for Documents API
 */

ipcMain.handle('docs:meta', async () => {
  return docIndex.getMeta();
});

ipcMain.handle('docs:list', async (_event, filter) => {
  return docIndex.listDocs(filter || {});
});

ipcMain.handle('docs:search', async (_event, params) => {
  return docIndex.searchDocs(params || {});
});

ipcMain.handle('docs:open', async (_event, absPath) => {
  try {
    if (typeof absPath !== 'string') {
      return false;
    }
    const resolved = path.resolve(absPath);
    // Security: ensure file resides within the configured documents directory
    if (!resolved.startsWith(DOCS_DIR)) {
      console.warn('Attempt to open file outside documents dir:', resolved);
      return false;
    }
    await shell.openPath(resolved);
    return true;
  } catch (error) {
    console.error('Failed to open document:', error);
    return false;
  }
});
