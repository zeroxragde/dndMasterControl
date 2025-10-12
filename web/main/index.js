const { app, BrowserWindow, screen, ipcMain, protocol, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 
const mammoth = require('mammoth'); // Para convertir docx a HTML, instalar con npm install mammoth


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
const userFolderGlobal = path.join(app.getAppPath(), 'assets', 'system');
const configPath = path.join(__dirname, '..', 'config.json');

function userDocsFolder(){
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const username = config.dm;
   return path.join(userFolderGlobal, username+'_docs');
}

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
  // 🔄 Atajos de teclado F5 y Ctrl+R para recargar
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' || (input.key === 'r' && input.control)) {
      win.reload();
      event.preventDefault();
    }
  });
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
 
 // if (!app.isPackaged) mapaWindow.webContents.openDevTools();
  mapaWindow.loadFile(path.join(__dirname, '../views/mapa.html'));

  dashboardWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true, contextIsolation: false, webSecurity: false }
  });
    // 🔄 Atajos de teclado F5 y Ctrl+R para recargar
  dashboardWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' || (input.key === 'r' && input.control)) {
      dashboardWindow.reload();
      event.preventDefault();
    }
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

ipcMain.on('guardar-sprite', (event, data) => {
  try {
    const { imagen, nombreBase, categoria } = data; // categoria opcional si la envías

    // Extraer base64 sin el encabezado data:image/png;base64,
    const base64Data = imagen.replace(/^data:image\/png;base64,/, '');

    // Leer config para obtener username (dm)
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const username = config.dm;
    if (!username) throw new Error("Nombre de DM no encontrado en la configuración.");

    // Carpetas y paths
    const userFolder = path.join(app.getAppPath(), 'assets', username, 'imgMapas');
    const jsonPath = path.join(app.getAppPath(), 'assets', 'system', `${username}_imagenes_mapas.json`);
    fs.mkdirSync(userFolder, { recursive: true });
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });

    // Generar nombre con UUID o incremental
    // Aquí uso UUID para evitar colisiones
    const uuid = uuidv4();
    const filename = `${uuid}.png`;
    const destinoPath = path.join(userFolder, filename);

    // Guardar archivo PNG
    fs.writeFileSync(destinoPath, base64Data, 'base64');

    // Leer JSON existente o iniciar arreglo
    let jsonData = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) : [];

    // Agregar registro
    const nuevoRegistro = {
      nombre: filename, // nombre con sufijo
      uuid: uuid,
      extension: 'png',
      categoria: { categoria: categoria || 'sin categoria' }
    };
    jsonData.push(nuevoRegistro);

    // Guardar JSON actualizado
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

    // Enviar éxito y registro al renderer
    event.sender.send('guardar-sprite-respuesta', { success: true, registro: nuevoRegistro });

  } catch (error) {
    console.error('Error al guardar sprite:', error);
    event.sender.send('guardar-sprite-respuesta', { success: false, error: error.message });
  }
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
// --- Lógica para leer hechizos desde un archivo JSON ---
ipcMain.handle('leer-hechizos-json', async (event) => {
  const jsonPath = path.join(app.getAppPath(), 'assets',  `hechizos.json`);
  const contenido = fs.readFileSync(jsonPath, 'utf-8');
  return JSON.parse(contenido);
});
// --- Lógica para manejar clics en el canvas del mapa ---
ipcMain.on('canvas-click', (event, coords) => {
  if (mapaWindow) {
    mapaWindow.webContents.send('canvas-click', coords);
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
//tab players
ipcMain.on('save-players-data', (event, { data }) => {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const username = config.dm;
  var filePath = path.join(userFolderGlobal, username+'_players_data.json');

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Error guardando datos:', err);
      event.reply('save-players-data-reply', { success: false, error: err.message });
      return;
    }
    event.reply('save-players-data-reply', { success: true });
  });
});
// Método para cargar datos de jugadores
ipcMain.handle('load-players-data', async (event) => {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const username = config.dm;
    const filePath = path.join(userFolderGlobal, username + '_players_data.json');

    if (!fs.existsSync(filePath)) {
      // Si no existe el archivo, regresar estructura vacía
      return { iniciativa: [], runas: [] };
    }

    const dataRaw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(dataRaw);
    return data;
  } catch (error) {
    console.error('Error cargando datos de jugadores:', error);
    return { iniciativa: [], runas: [] };
  }
});
///////////////DOCUMENTOS DE USUARIO
// --- Lógica para manejar documentos de usuario ---
ipcMain.handle('get-doc-list', async (event, username) => {
  const folder = userDocsFolder(username);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  return fs.readdirSync(folder).filter(f => f.endsWith('.docx'));
});

ipcMain.handle('load-doc-content', async (event, username, filename) => {
  const filePath = path.join(userDocsFolder(username), filename);
  if (!fs.existsSync(filePath)) return null;

  const data = fs.readFileSync(filePath);
  try {

    const result = await mammoth.convertToHtml({ buffer: data });
    return result.value;
  } catch (error) {
    console.error('Error convirtiendo docx:', error);
    return null;
  }
});

ipcMain.handle('save-doc-file', async (event, username, file) => {
  const folder = userDocsFolder(username);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  const savePath = path.join(folder, file.name);
  fs.writeFileSync(savePath, file.data, 'binary');
  return true;
});





////////////////CREATURAS
ipcMain.handle('delete-creature-file', async (event, filePath) => {
  try {
    // Ajusta esta ruta a donde guardas tus .crea
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, message: 'Archivo no encontrado.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
});
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
     
      // Siempre clona el JSON en una instancia del modelo
     /* const crea = new Creatura();
      Object.assign(crea, raw);

      creaturesData.push({ 
        nombre: crea.Nombre, 
        cr: crea.CR, 
        fullData: crea 
      });*/

      creaturesData.push({ 
          nombre: creature.Nombre, 
          cr: creature.CR, 
          filepath: filePath,
          fullData: creature,
          campania: creature.Campania || "",
        });
    } catch (e) {
      console.error(`Error al leer o parsear el archivo de criatura ${file}:`, e);
    }
  }
  return creaturesData;
});
// --- Lógica para leer una plantilla HTML ---
  // --- IPC: Cargar contenido HTML de una plantilla ---
  ipcMain.handle('get-html-template', async (event, relativePath) => {
    try {
      // Ruta base donde están tus vistas
      const templatePath = path.join(app.getAppPath(), 'views', relativePath);

      if (!fs.existsSync(templatePath)) {
        throw new Error(`No se encontró el archivo: ${templatePath}`);
      }

      // Leer el contenido del archivo HTML
      const htmlContent = fs.readFileSync(templatePath, 'utf-8');

      // Devolver solo el texto HTML
      return htmlContent;

    } catch (error) {
      console.error('Error al leer la plantilla HTML:', error);
      return null;
    }
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