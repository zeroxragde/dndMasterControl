const { BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const { guardarConfig } = require('./configManager');

let mapaWindow = null;
let dashboardWindow = null;

function registrarEventosIPC() {
  ipcMain.on('configuracion-inicial', (event, datos) => {
    guardarConfig(datos);

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
      mapaWindow = null;
    });
  });
}

module.exports = { registrarEventosIPC };
