const { app, BrowserWindow, screen, ipcMain, protocol, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Habilita la recarga en vivo durante el desarrollo
require('electron-reload')(__dirname, {
  electron: require('path').join(__dirname, '..', 'node_modules', '.bin', 'electron.cmd')
});

// --- Variables Globales ---
let mapaWindow = null;
let dashboardWindow = null;
const configPath = path.join(__dirname, '..', 'config.json');

// --- Función para crear la ventana de login ---
function createLoginWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // Habilitamos la carga de recursos locales para el protocolo personalizado
      webSecurity: false 
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
}

// ===================================================================
// --- LÓGICA DE COMUNICACIÓN (IPC Listeners) ---
// ===================================================================

// Escucha la configuración inicial desde la ventana de login
ipcMain.on('configuracion-inicial', (event, datos) => {
  fs.writeFileSync(configPath, JSON.stringify(datos, null, 2));

  const displays = screen.getAllDisplays();
  const target = displays[datos.monitor] || displays[0];

  mapaWindow = new BrowserWindow({
    x: target.bounds.x,
    y: target.bounds.y,
    fullscreen: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false, webSecurity: false }
  });
  mapaWindow.webContents.openDevTools();
  mapaWindow.loadFile(path.join(__dirname, '../views/mapa.html'));

  dashboardWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true, contextIsolation: false, webSecurity: false }
  });
  dashboardWindow.maximize();
  dashboardWindow.webContents.openDevTools();
  dashboardWindow.loadFile(path.join(__dirname, '../views/dashboard.html'));

  dashboardWindow.webContents.once('did-finish-load', () => {
    dashboardWindow.webContents.send('mapa-resolucion', { 
      width: target.bounds.width, 
      height: target.bounds.height 
    });
  });

  dashboardWindow.on('closed', () => {
    if (mapaWindow) mapaWindow.close();
  });
});
// --- IPC Listener para replicar las instrucciones de dibujo ---
ipcMain.on('map-draw-command', (event, command) => {
  // Si la ventana del mapa existe, le reenviamos el comando
  if (mapaWindow) {
    mapaWindow.webContents.send('execute-draw-command', command);
  }
});
// Escucha la petición de la configuración desde el dashboard
ipcMain.handle('get-user-config', async () => {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    return null;
  } catch (error) {
    console.error("Error al leer config.json:", error);
    return null;
  }
});

// Escucha la petición para abrir el diálogo de imagen
ipcMain.on('abrir-dialogo-imagen', (event, categoria) => {
  dialog.showOpenDialog(dashboardWindow, {
    title: 'Seleccionar Imagen',
    filters: [{ name: 'Imágenes', extensions: ['jpg', 'png', 'jpeg', 'gif'] }],
    properties: ['openFile']
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const username = config.dm;
        if (!username) throw new Error("Nombre de DM no encontrado en la configuración.");

        const originalNombre = path.basename(filePath);
        const extension = path.extname(filePath).toLowerCase();
        const uuid = uuidv4();
        
        const userFolder = path.join(app.getPath('userData'), 'assets', username, 'imgMapas');
        const jsonPath = path.join(app.getPath('userData'), 'assets', 'system', `${username}_imagenes_mapas.json`);
        const destinoPath = path.join(userFolder, `${uuid}${extension}`);

        fs.mkdirSync(userFolder, { recursive: true });
        fs.mkdirSync(path.dirname(jsonPath), { recursive: true });

        fs.copyFileSync(filePath, destinoPath);

        let jsonData = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) : [];
        const nuevoRegistro = {
          nombre: originalNombre,
          uuid: uuid,
          extension: extension.replace('.', ''),
          categoria: categoria
        };
        jsonData.push(nuevoRegistro);
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

        event.sender.send('imagen-cargada-exito', nuevoRegistro);
      } catch (error) {
        console.error('Error al guardar la imagen:', error);
        event.sender.send('imagen-cargada-error', 'No se pudo guardar la imagen.');
      }
    }
  }).catch(err => console.error('Error en el diálogo:', err));
});
// --- IPC Listener para actuar como relé del estado del mapa ---
ipcMain.on('update-map-state', (event, tokens) => {
  // Si la ventana del mapa existe, le enviamos los datos de los tokens
  if (mapaWindow) {
    mapaWindow.webContents.send('render-map-state', tokens);
  }
});
// Escucha la petición de la lista de assets
ipcMain.handle('get-asset-list', async () => {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const username = config.dm;
    if (!username) return [];

  //  const jsonPath = path.join(app.getPath('userData'), 'assets', 'system', `${username}_imagenes_mapas.json`);
    const jsonPath = path.join(app.getAppPath(), 'assets', 'system', `${username}_imagenes_mapas.json`);
       
    if (fs.existsSync(jsonPath)) {
      const assetData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      return assetData.map(asset => {
       // const relativePath = `${username}/imgMapas/${asset.uuid}.${asset.extension}`;
        const relativePath = `${username}/imgMapas/${asset.uuid}.${asset.extension}`;
      //  return { ...asset, url: `asset://${relativePath}` };
 
      // Para cada asset, leemos el archivo de imagen y lo convertimos a un Data URL
          return assetData.map(asset => {
            const imagePath = path.join(app.getAppPath(), 'assets', username, 'imgMapas', `${asset.uuid}.${asset.extension}`);
            if (fs.existsSync(imagePath)) {
              const imageBuffer = fs.readFileSync(imagePath);
              const imageBase64 = imageBuffer.toString('base64');
              // Creamos una URL que contiene los datos de la imagen directamente
              const dataUrl = `data:image/${asset.extension};base64,${imageBase64}`;
              return { ...asset, url: dataUrl };
            }
            return { ...asset, url: '' }; // Devuelve una URL vacía si la imagen no se encuentra
          });

      });
    }
    return [];
  } catch (error) {
    console.error("Error al leer la lista de assets:", error);
    return [];
  }
});

// ===================================================================
// --- CICLO DE VIDA DE LA APLICACIÓN ---
// ===================================================================

// Esta función se asegura de que todo esté listo antes de crear la ventana
async function handleAppReady() {
  // Registramos nuestro protocolo personalizado 'asset://' para poder mostrar imágenes locales
  protocol.registerFileProtocol('asset', (request, callback) => {
    const url = request.url.substr(8); 
    const fullPath = path.join(app.getPath('userData'), 'assets', url);
    callback({ path: path.normalize(fullPath) });
  });

  // Ahora creamos la ventana de login inicial
  createLoginWindow();
}

app.whenReady().then(handleAppReady);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createLoginWindow();
  }
});