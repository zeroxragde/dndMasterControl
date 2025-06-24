const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mapaWindow = null;
let dashboardWindow = null;
const configPath = path.join(__dirname, '..', 'config.json');

function createMainWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, '../views/index.html'));

  win.webContents.once('did-finish-load', () => {
    const displays = screen.getAllDisplays();
    win.webContents.send('monitores-disponibles', displays);

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      win.webContents.send('config-existente', config);
    }
  });

  ipcMain.on('configuracion-inicial', (event, datos) => {
    fs.writeFileSync(configPath, JSON.stringify(datos, null, 2));

    const displays = screen.getAllDisplays();
    const target = displays[datos.monitor] || displays[0];

    mapaWindow = new BrowserWindow({
      x: target.bounds.x,
      y: target.bounds.y,
      fullscreen: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    mapaWindow.loadFile(path.join(__dirname, '../views/mapa.html'));

    dashboardWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    dashboardWindow.maximize();
    dashboardWindow.loadFile(path.join(__dirname, '../views/dashboard.html'));

    dashboardWindow.on('closed', () => {
      if (mapaWindow) mapaWindow.close();
    });
  });
}

app.whenReady().then(createMainWindow);