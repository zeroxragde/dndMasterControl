const { app, BrowserWindow, screen, ipcMain, protocol, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Habilita la recarga en vivo durante el desarrollo
/*require('electron-reload')(__dirname, {
  electron: require('path').join(__dirname, '..', 'node_modules', '.bin', 'electron.cmd')
});*/
if (!app.isPackaged) {                     // <-- true en desarrollo, false en un build
  try {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
  } catch (err) {
    console.warn('No puedo cargar electron-reload en producción.');
  }
}

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
  //mapaWindow.webContents.openDevTools();
  mapaWindow.loadFile(path.join(__dirname, '../views/mapa.html'));

  dashboardWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true, contextIsolation: false, webSecurity: false }
  });
  dashboardWindow.maximize();
  if (!app.isPackaged) dashboardWindow.webContents.openDevTools();
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
        
        const userFolder = path.join(app.getAppPath(), 'assets', username, 'imgMapas');
        const jsonPath = path.join(app.getAppPath(), 'assets', 'system', `${username}_imagenes_mapas.json`);
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

// Escucha la petición de la lista de assets
ipcMain.handle('get-asset-list', async () => {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const username = config.dm;
    if (!username) return [];

    const jsonPath = path.join(app.getAppPath(), 'assets', 'system', `${username}_imagenes_mapas.json`);
    if (fs.existsSync(jsonPath)) {
      const assetData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      
      return assetData.map(asset => {
        const imagePath = path.join(app.getAppPath(), 'assets', username, 'imgMapas', `${asset.uuid}.${asset.extension}`);
        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          const imageBase64 = imageBuffer.toString('base64');
          const dataUrl = `data:image/${asset.extension};base64,${imageBase64}`;
          return { ...asset, url: dataUrl };
        }
        return { ...asset, url: '' };
      });
    }
    return [];
  } catch (error) {
    return [];
  }
});

// --- Lógica para eliminar assets ---
ipcMain.on('delete-assets', (event, uuidsParaBorrar) => {
  if (!uuidsParaBorrar || uuidsParaBorrar.length === 0) {
    return; // No hacer nada si no se envían IDs
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const username = config.dm;
    if (!username) throw new Error("Nombre de DM no encontrado.");

    const jsonPath = path.join(app.getAppPath(), 'assets', 'system', `${username}_imagenes_mapas.json`);
    
    if (fs.existsSync(jsonPath)) {
      let assets = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      // Filtramos para encontrar los assets que se van a borrar
      const assetsAEliminar = assets.filter(asset => uuidsParaBorrar.includes(asset.uuid));
      // Y nos quedamos con los que NO se van a borrar
      const assetsQueQuedan = assets.filter(asset => !uuidsParaBorrar.includes(asset.uuid));

      // 1. Borramos los archivos físicos del disco duro
      assetsAEliminar.forEach(asset => {
        const imagePath = path.join(app.getAppPath(), 'assets', username, 'imgMapas', `${asset.uuid}.${asset.extension}`);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Comando para borrar el archivo
          console.log(`Archivo eliminado: ${imagePath}`);
        }
      });

      // 2. Sobrescribimos el archivo JSON con la lista actualizada (sin los borrados)
      fs.writeFileSync(jsonPath, JSON.stringify(assetsQueQuedan, null, 2));

      // 3. Enviamos una señal de éxito de vuelta al dashboard
      event.sender.send('assets-deleted-success');
    }
  } catch (error) {
    console.error('Error al eliminar assets:', error);
  }
});
// --- Lógica para guardar el estado del mapa ---
ipcMain.on('save-map-dialog', (event, mapState) => {
  // Abre el diálogo para que el usuario elija dónde guardar el archivo
  dialog.showSaveDialog(dashboardWindow, {
    title: 'Guardar Mapa',
    defaultPath: 'mi-mapa.json', // Nombre de archivo sugerido
    filters: [
      { name: 'Archivos de Mapa JSON', extensions: ['json'] }
    ]
  }).then(result => {
    // Si el usuario no cancela y elige una ruta
    if (!result.canceled && result.filePath) {
      try {
        // Convierte el estado del mapa a un string JSON y lo guarda en el archivo
        const jsonData = JSON.stringify(mapState, null, 2);
        fs.writeFileSync(result.filePath, jsonData);
        console.log(`Mapa guardado con éxito en: ${result.filePath}`);
        
        // (Opcional) Envía una notificación de éxito de vuelta al dashboard
        event.sender.send('map-saved-success', '¡Mapa guardado!');
      } catch (error) {
        console.error('Error al guardar el archivo del mapa:', error);
      }
    }
  }).catch(err => {
    console.error('Error en el diálogo de guardado:', err);
  });
});
// Escucha la actualización del estado del mapa desde el dashboard
ipcMain.on('update-map-state', (event, mapState) => {
  if (mapaWindow) {
    mapaWindow.webContents.send('render-map-state', mapState);
  }
});
// --- Lógica para cargar un mapa desde un archivo ---
ipcMain.handle('load-map-dialog', async (event) => {
  // Abre el diálogo para que el usuario elija un archivo JSON
  const result = await dialog.showOpenDialog(dashboardWindow, {
    title: 'Cargar Mapa',
    filters: [
      { name: 'Archivos de Mapa JSON', extensions: ['json'] }
    ],
    properties: ['openFile']
  });

  // Si el usuario no cancela y elige un archivo
  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const filePath = result.filePaths[0];
      // Lee el contenido del archivo JSON
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      // Lo convierte a un objeto y lo devuelve al dashboard
      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Error al cargar o parsear el archivo del mapa:', error);
      return null; // Devuelve null si hay un error
    }
  }
  return null; // Devuelve null si el usuario cancela
});
////////////////CREATURAS
// --- Lógica para importar una criatura desde un archivo .crea ---
ipcMain.handle('import-creature', async (event) => {
  const result = await dialog.showOpenDialog(dashboardWindow, {
    title: 'Importar Creatura',
    filters: [{ name: 'Archivos de Creatura', extensions: ['crea', 'json'] }],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const filePath = result.filePaths[0];
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      // Devolvemos el contenido del archivo parseado como JSON
      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Error al leer o parsear el archivo de la criatura:', error);
      dialog.showErrorBox('Error de Importación', 'El archivo seleccionado no es un JSON válido o está corrupto.');
      return null;
    }
  }
  return null; // El usuario canceló el diálogo
});


// CARGA INICIAL: Lee todos los archivos .crea del directorio del usuario.
ipcMain.handle('load-creatures-from-app-folder', async () => {
  
  // --- Lógica para obtener la ruta de la carpeta (ahora dentro del handler) ---
  let folderPath = null;
  try {
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const username = config.dm;
        if (username) {
            const userFolderPath = path.join(app.getAppPath(), 'assets', 'system', `${username}_creaturas`);
            // Crea el directorio si no existe
            if (!fs.existsSync(userFolderPath)) {
                fs.mkdirSync(userFolderPath, { recursive: true });
            }
            folderPath = userFolderPath;
        }
    }
  } catch (error) {
    console.error("Error obteniendo la carpeta de criaturas:", error);
    return []; // Devuelve un array vacío si hay un error
  }
  // --- Fin de la lógica de la carpeta ---

  if (!folderPath) return []; // Si no se pudo determinar la carpeta, no continuamos

  const creatureFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.crea'));
  const creaturesData = [];

  for (const file of creatureFiles) {
    try {
      const filePath = path.join(folderPath, file);
      const data = fs.readFileSync(filePath, 'utf-8');
      const creature = JSON.parse(data);
      // Guardamos los datos para la lista y el objeto completo para después.
      creaturesData.push({ 
          nombre: creature.Nombre, 
          cr: creature.CR, 
          fullData: creature 
        });
    } catch (e) {
      console.error(`Error al leer o parsear el archivo de criatura ${file}:`, e);
    }
  }
  return creaturesData;
});
// IMPORTAR: Busca un archivo .crea en el disco y lo copia a la carpeta de la app.
ipcMain.handle('import-creature-file', async () => {
  // Función auxiliar interna para obtener la ruta y mantener el código limpio.
  const getCreatureFolderPath = () => {
      try {
          if (!fs.existsSync(configPath)) return null;
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          const username = config.dm;
          if (!username) return null;
          const folderPath = path.join(app.getAppPath(), 'assets', 'system', `${username}_creaturas`);
          if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
          return folderPath;
      } catch (error) { 
          console.error("Error obteniendo la carpeta de criaturas al importar:", error);
          return null; 
      }
  };
  
  const folderPath = getCreatureFolderPath();
  if (!folderPath) {
      dialog.showErrorBox('Error', 'No se ha podido determinar la carpeta de destino del usuario.');
      return { success: false };
  }

  const result = await dialog.showOpenDialog(dashboardWindow, {
      title: 'Importar archivo .crea',
      filters: [{ name: 'Archivos de Creatura', extensions: ['crea'] }],
      properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) {
      return { success: false };
  }

  const sourcePath = result.filePaths[0];
  const fileName = path.basename(sourcePath);
  const destPath = path.join(folderPath, fileName);

  try {
      fs.copyFileSync(sourcePath, destPath);
      return { success: true };
  } catch (error) {
      console.error("Error al copiar el archivo de criatura:", error);
      dialog.showErrorBox('Error de Importación', `No se pudo copiar el archivo.\n${error.message}`);
      return { success: false };
  }
});

// Escucha la orden para mostrar la imagen y la reenvía a la ventana del mapa.
ipcMain.on('show-creature-on-map', (event, imgSrc) => {
  if (mapaWindow) {
    mapaWindow.webContents.send('display-creature-image', imgSrc);
  }
});

// Escucha la orden para ocultar la imagen y la reenvía a la ventana del mapa.
ipcMain.on('hide-creature-on-map', (event) => {
  if (mapaWindow) {
    mapaWindow.webContents.send('clear-creature-image');
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
    const fullPath = path.join(app.getAppPath(), 'assets', url);
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