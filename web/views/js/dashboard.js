
// --- Variables específicas para el Dashboard ---
// Al principio de tu archivo dashboard.js

// Al principio de tu archivo dashboard.js
import { Creatura } from './Modelos/creatura.js';
const { ipcRenderer } = require('electron');
const audio = document.getElementById('audioPlayer');
const nombreCancion = document.getElementById('nombreCancion');
let canciones = [];
let indiceCancion = 0;
// --- Variable Global para la Configuración ---
// La guardaremos aquí para usarla en toda la aplicación.
let userConfig = {};
// Al principio de dashboard.js
// Al principio de dashboard.js
let mapCanvas = null;
let fondoMapa = new Image();

const criaturasData = [
  { nombre: "Sothrax, el Devorador", cr: 2 },
  { nombre: "Guardian", cr: 1 },
  { nombre: "Tempestus (Elemental)", cr: 2 },
  { nombre: "Arpías", cr: 2 },
  { nombre: "Sombras Errantes", cr: 2 },
  { nombre: "Espectros de la Cripta", cr: 3 },
];

// --- Evento Principal ---
// Espera a que todo el HTML esté cargado para empezar
document.addEventListener("DOMContentLoaded", async () => {
   // Usamos async/await para esperar la configuración antes de continuar
   try {
      userConfig = await ipcRenderer.invoke('get-user-config');
      if (!userConfig) {
        console.error("No se pudo cargar la configuración del usuario.");
        // Aquí podrías mostrar un error o redirigir al login
        return;
      }
      // --- ¡AQUÍ ESTÁ LA LÍNEA QUE NECESITAS! ---
      // 1. Buscamos el elemento del título por su ID.
      const tituloDashboard = document.getElementById('tituloDashboard');
      // 2. Si existe, actualizamos su contenido.
      if (tituloDashboard) {
        tituloDashboard.innerHTML = `Tablero del DM <b>${userConfig.dm}</b>`;
      }
    } catch (error) {
      console.error("Error al invocar get-user-config:", error);
    }
    // Una vez que tenemos la configuración, inicializamos todos los componentes
    console.log(`Configuración cargada para el DM: ${userConfig.dm}`);

    inicializarUI();
});

// --- Función de Inicialización del Dashboard ---
function inicializarUI() {
  inicializarComponentes();
  const tbodyCriaturas = document.getElementById('listaCriaturasBody');
  poblarDropdownsEditor();
}


/**
 * Crea las instancias de las clases Modal y Tabs para la página.
 */
function inicializarComponentes() {
  // Configuración para todos los modales.
  const modalConfigs = [
    { id: 'listaPanel', triggerId: 'btnLista', closeClassName: 'modal-close-btn', movable: true,width: '20%', },
    { id: 'modalSubida', triggerId: 'abrirSubida', closeClassName: 'modal-close-btn', movable: true,width: '40%',height: '300px' },
    {
       id: 'modalEditor', 
      triggerId: 'btnOpenEditor', 
      closeClassName: 'editor-close-btn',
      movable: true, 
      width: '100%',
      height: '70vh',
      onOpen: () => {
        new Tabs({ id: 'creature-editor-container', orientation: 'vertical', title: 'EDITOR DE CRIATURA' });
      }
    }
  ];
  modalConfigs.forEach(config => new Modal(config));
  new Tabs({ id: 'web-container', orientation: 'horizontal' });
  // Creamos la instancia de la nueva clase ListView
  new ListView({
    containerId: 'creature-list-container',
    data: criaturasData,
    // Le decimos qué columnas crear y de dónde sacar los datos
    columns: [
      { header: 'Nombre', key: 'nombre' },
      { header: 'CR',     key: 'cr' }
    ]
  });
  inicializarOpcionesEspeciales();
  inicializarMapaEditor();


}


/**
 * Inicializa el editor de mapas: espera la resolución, ajusta el tamaño del canvas,
 * dibuja el fondo y activa la funcionalidad de arrastrar y soltar.
 */
function inicializarMapaEditor() {
  mapCanvas = new MapCanvas('map-canvas');
  // --- LÓGICA DE CAPAS ---
  const newLayerInput = document.getElementById('new-layer-name');
  const addLayerButton = document.getElementById('btn-add-layer');
  const layerSelector = document.getElementById('layer-selector');
 
   // --- LÓGICA DEL BOTÓN "NUEVO MAPA" ---
    const newMapButton = document.getElementById('btn-new-map');
    if (newMapButton) {
        newMapButton.addEventListener('click', () => {
            // Pide confirmación al usuario para evitar borrados accidentales
            if (confirm('¿Estás seguro de que quieres borrar el mapa actual? Esta acción no se puede deshacer.')) {
                if (mapCanvas) {
                    mapCanvas.clearMap(); // Llama al nuevo método de la clase
                }
            }
        });
    }
 
  // Función para actualizar el menú desplegable de capas
 /*function actualizarDropdownCapas() {
    if (!layerSelector || !mapCanvas) return;
    
    layerSelector.innerHTML = ''; // Limpiamos el select
    // Añadimos cada capa del objeto mapCanvas.layers
    mapCanvas.layerOrder.forEach(layerName => {
        const option = new Option(layerName, layerName);
        layerSelector.add(option);
    });
    // Nos aseguramos de que el valor seleccionado coincida con la capa activa
    layerSelector.value = mapCanvas.activeLayer;
 }*/

 // Función para actualizar el menú desplegable de capas
 function actualizarDropdownCapas() {
  if (!layerSelector || !mapCanvas) return;
  
  const capaActivaGuardada = layerSelector.value;
  layerSelector.innerHTML = ''; // Limpiamos el select
  
  mapCanvas.layerOrder.forEach(layerName => {
      const option = new Option(layerName, layerName);
      layerSelector.add(option);
  });
  
  // Nos aseguramos de que el valor seleccionado se mantenga
  layerSelector.value = capaActivaGuardada || mapCanvas.activeLayer;
}

  // Evento para el botón de "Añadir Capa"
  addLayerButton.addEventListener('click', () => {
    const layerName = newLayerInput.value.trim();
    if (layerName) {
        // Llamamos al método de la clase para añadir la capa
        if (mapCanvas.addLayer(layerName)) {
            newLayerInput.value = ''; // Limpiamos el input
            actualizarDropdownCapas(); // Actualizamos el menú
        }
    }
  });
  // Evento para el menú desplegable
  layerSelector.addEventListener('change', () => {
    // Llamamos al método de la clase para cambiar la capa activa
    mapCanvas.setActiveLayer(layerSelector.value);
  });
  actualizarDropdownCapas();

  ipcRenderer.on('mapa-resolucion', (event, resolucion) => {
      mapCanvas.setSize(resolucion.width, resolucion.height);
      
      fondoMapa.src = '../assets/img/fondoStab.png';
      fondoMapa.onload = () => {
          // Le pasamos la imagen de fondo a nuestra clase
          mapCanvas.setBackground(fondoMapa);
      };
  });
    // --- ¡AQUÍ ESTÁ LA NUEVA LÓGICA! ---
    const refreshButton = document.getElementById('btn-refresh-map');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            // Simplemente llamamos a draw(), que ya se encarga de enviar la actualización
            console.log("Actualizando el mapa ed...");
            if (mapCanvas) {
                mapCanvas.updateMap();
            }
        });
    }
  // La lógica de 'drop' se mantiene igual
  const viewport = document.getElementById('map-viewport');
  if(viewport) {
      viewport.addEventListener('dragover', (e) => e.preventDefault());
      viewport.addEventListener('drop', (e) => {
          e.preventDefault();
          const imageUrl = e.dataTransfer.getData('text/plain');
          const rect = mapCanvas.canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          mapCanvas.addToken(imageUrl, x, y);
      });
  }


  // --- El resto de tus inicializaciones para el editor de mapas ---
  
// Dentro de la función inicializarMapaEditor en dashboard.js
const loadMapButton = document.getElementById('btn-load-map');
if (loadMapButton) {
    loadMapButton.addEventListener('click', async () => {
        if (mapCanvas) {
            // 1. Pedimos al proceso principal que nos devuelva los datos del archivo JSON
            const mapState = await ipcRenderer.invoke('load-map-dialog');

            // 2. Si el usuario seleccionó un archivo válido, cargamos el estado
            if (mapState) {
                mapCanvas.loadMapState(mapState);
                actualizarDropdownCapas();
            }
        }
    });
}
const saveMapButton = document.getElementById('btn-save-map');
if (saveMapButton) {
    saveMapButton.addEventListener('click', () => {
        if (mapCanvas) {
            // 1. Obtenemos el estado actual del mapa usando el nuevo método
            const mapState = mapCanvas.getMapState();

            // 2. Enviamos los datos al proceso principal para que abra el diálogo y los guarde
            ipcRenderer.send('save-map-dialog', mapState);
        }
    });
}

// (Opcional) Escucha la confirmación de guardado para mostrar una alerta
ipcRenderer.on('map-saved-success', (event, message) => {
    alert(message);
});
  inicializarCargadorDeAssetsMapaEditor();
  poblarFiltroDeCategoriasMapaEditor();
  actualizarYRenderizarAssetList();
}



/**
 * Rellena el select de categorías del gestor de recursos.
 */
function poblarFiltroDeCategoriasMapaEditor() {
  const selector = document.getElementById('asset-category-select');
  if (!selector) return;

  const categorias = [
      "personaje",
      "imagen",
      "tile",
      "mapa"
  ];

  // Añadimos cada categoría del array
  categorias.forEach(cat => {
      const opcion = new Option(cat.charAt(0).toUpperCase() + cat.slice(1), cat);
      selector.add(opcion);
  });
}


/**
 * Pide la lista de assets, la renderiza como una cuadrícula de tarjetas
 * y hace que las imágenes sean arrastrables.
 */
async function actualizarYRenderizarAssetList() {
    const assetListContainer = document.getElementById('asset-list');
    if (!assetListContainer) return;

    try {
        const assetsRecibidos = await ipcRenderer.invoke('get-asset-list');
        const assets = assetsRecibidos.flat();
        
        assetListContainer.innerHTML = '';

        if (!assets || assets.length === 0) {
            assetListContainer.innerHTML = '<p class="empty-list-message">No hay imágenes.</p>';
            return;
        }

        const gridContainer = document.createElement('div');
        gridContainer.className = 'asset-grid';

        assets.forEach(asset => {
            if (!asset || !asset.url) return;

            const card = document.createElement('div');
            card.className = 'asset-card';
            card.dataset.uuid = asset.uuid;

            // Obtenemos el nombre sin la extensión
            const nombreSinExtension = asset.nombre.includes('.')
                ? asset.nombre.split('.').slice(0, -1).join('')
                : asset.nombre;

            // --- HTML COMPLETO DE LA TARJETA ---
            // Añadimos de nuevo los <span> para el nombre y la categoría
            card.innerHTML = `
                <input type="checkbox" id="check-${asset.uuid}" class="asset-checkbox">
                <label for="check-${asset.uuid}" class="asset-image-label">
                    <img src="${asset.url}" class="asset-thumbnail" alt="${nombreSinExtension}" draggable="true">
                </label>
                <span class="asset-name">${nombreSinExtension}</span>
                <span class="asset-category">${asset.categoria || 'N/A'}</span>
            `;

            // Hacemos la imagen arrastrable
            const img = card.querySelector('.asset-thumbnail');
            img.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('text/plain', asset.url);
            });

            gridContainer.appendChild(card);
        });

        assetListContainer.appendChild(gridContainer);

    } catch (error) {
        console.error("Error al renderizar la lista de assets:", error);
    }
}

/**
 * Configura el botón para cargar imágenes y la respuesta del proceso principal.
 */
function inicializarCargadorDeAssetsMapaEditor() {
  const botonCargar = document.getElementById('btn-load-image');
  const botonBorrar = document.getElementById('btn-delete-asset'); // El ID de tu botón de borrar 
  const filtroCategoria = document.getElementById('asset-category-select');
  const assetList = document.getElementById('asset-list');

  if (!botonCargar || !botonBorrar) return;


    // --- ¡NUEVA LÓGICA PARA EL BOTÓN DE BORRAR! ---
  botonBorrar.addEventListener('click', () => {
      const uuidsParaBorrar = [];
      // Busca todos los checkboxes que estén marcados dentro de la lista
      const checkboxesMarcados = assetList.querySelectorAll('.asset-checkbox:checked');

      if (checkboxesMarcados.length === 0) {
          alert('No 11has seleccionado ninguna imagen para eliminar.');
          return;
      }

      if (confirm(`¿Estás seguro de que quieres eliminar ${checkboxesMarcados.length} imagen(es)? Esta acción no se puede deshacer.`)) {
          checkboxesMarcados.forEach(checkbox => {
              // Obtenemos el uuid de la tarjeta padre del checkbox
              uuidsParaBorrar.push(checkbox.closest('.asset-card').dataset.uuid);
          });
          
          // Enviamos la lista de UUIDs a borrar al proceso principal
          ipcRenderer.send('delete-assets', uuidsParaBorrar);
      }
  });

  // Cuando se hace clic en el botón...
  botonCargar.addEventListener('click', () => {
      const categoriaSeleccionada = filtroCategoria.value;
      if (!categoriaSeleccionada) {
          alert('Por favor, selecciona una categoría antes de subir una imagen.');
          return;
      }

      // Aquí necesitarás una forma de obtener el nombre de usuario actual.
      // Por ahora, usaremos un valor de ejemplo.
      const username = userConfig.dm; 

      // ...enviamos un mensaje al proceso principal para que abra el diálogo.
      ipcRenderer.send('abrir-dialogo-imagen', { categoria: categoriaSeleccionada, username: username });
  });

  // Escuchamos la respuesta de éxito del proceso principal
  ipcRenderer.on('imagen-cargada-exito', (event, nuevoRegistro) => {
      console.log('Imagen cargada con éxito:', nuevoRegistro);
      // Aquí puedes añadir el código para mostrar la nueva imagen en la lista de assets.
      actualizarYRenderizarAssetList();
      alert(`¡Imagen "${nuevoRegistro.nombre}" cargada con éxito!`);
  });

  // Cuando los assets se borran con éxito, refrescamos la lista y el mapa
  ipcRenderer.on('assets-deleted-success', () => {
      console.log("Assets eliminados. Refrescando lista y reseteando mapa...");
      actualizarYRenderizarAssetList(); // Actualizamos la lista de assets
      if (mapCanvas) {
          mapCanvas.clearMap(); // Reseteamos el canvas del mapa
      }
  });
  // Escuchamos si hubo un error
  ipcRenderer.on('imagen-cargada-error', (event, mensajeError) => {
      console.error(mensajeError);
      alert(`Error: ${mensajeError}`);
  });
}

/**
 * Configura los checkboxes de la pestaña "Datos 3" para mostrar/ocultar las etiquetas de información.
 */
function inicializarOpcionesEspeciales() {
  const container = document.getElementById('special-creature-options');
  if (!container || container.dataset.initialized) return;

  container.addEventListener('change', (event) => {
    // Se asegura que el evento venga de un checkbox
    if (event.target.type === 'checkbox') {
      const labelId = event.target.dataset.targetLabel;
      const labelToShow = document.getElementById(labelId);
      if (labelToShow) {
        // Muestra la etiqueta si el checkbox está marcado, la oculta si no lo está.
        labelToShow.style.display = event.target.checked ? 'block' : 'none';
      }
    }
  });

  container.dataset.initialized = 'true';
}
/**
 * Rellena todos los menús desplegables del editor de criaturas.
 */
function poblarDropdownsEditor() {
  // Un objeto que contiene todos los arrays de opciones para los menús.
  const datosDelJuego = {
    tamaños: ["Diminuto", "Pequeño", "Mediano", "Grande", "Enorme", "Gargantuesco"],
    tipos: ["Aberración", "Bestia", "Celestial", "Constructo", "Dragón", "Elemental", "Feérico", "Engendro", "Gigante", "Humanoide", "Monstruosidad", "Limo", "Planta", "No muerto", "Otro"],
    alineamientos: ["Legal Bueno", "Neutral Bueno", "Caótico Bueno", "Legal Neutral", "Neutral", "Caótico Neutral", "Legal Malvado", "Neutral Malvado", "Caótico Malvado"],
    armaduras: ["Ninguna", "Armadura Natural", "Armadura de Mago", "Acolchada", "Cuero", "Cuero Tachonado", "Oculta", "Camisa de Malla", "Armadura de Escamas", "Coraza", "Media Armadura", "Armadura de Anillos", "Cota de Malla", "Armadura Laminada", "Armadura Completa", "Otra"],
    salvaciones: ["Fuerza", "Destreza", "Constitución", "Inteligencia", "Sabiduría", "Carisma"],
    habilidades: ["Acrobacias", "Trato con Animales", "Arcanos", "Atletismo", "Engaño", "Historia", "Perspicacia", "Intimidación", "Investigación", "Medicina", "Naturaleza", "Percepción", "Interpretación", "Persuasión", "Religión", "Juego de Manos", "Sigilo", "Supervivencia"],
    condiciones: ["Cegado", "Hechizado", "Ensordecido", "Agotamiento", "Aterrorizado", "Agarrado", "Incapacitado", "Invisible", "Paralizado", "Petrificado", "Envenenado", "Derribado", "Restringido", "Aturdido", "Inconsciente"],
    tiposDeDaño: ["Ácido", "Contundente", "Frío", "Fuego", "Fuerza", "Relámpago", "Necrótico", "Perforante", "Veneno", "Psíquico", "Radiante", "Cortante", "Trueno", "Ataques no mágicos", "Ataques no plateados", "Ataques no adamantinos", "Otro"],
    idiomas: ["Abisal", "Acuático", "Áurico", "Celestial", "Común", "Habla Profunda", "Dracónico", "Enano", "Élfico", "Gigante", "Goblin", "Gnómico", "Mediano", "Ígneo", "Infernal", "Orco", "Primordial", "Feérico", "Telúrico", "Subcomún", "Otro"],
    cr: ["0 (10 XP)", "1/8 (25 XP)", "1/4 (50 XP)", "1/2 (100 XP)", "1 (200 XP)", "2 (450 XP)", "3 (700 XP)", "4 (1,100 XP)", "5 (1,800 XP)", "6 (2,300 XP)", "7 (2,900 XP)", "8 (3,900 XP)", "9 (5,000 XP)", "10 (5,900 XP)", "11 (7,200 XP)", "12 (8,400 XP)", "13 (10,000 XP)", "14 (11,500 XP)", "15 (13,000 XP)", "16 (15,000 XP)", "17 (18,000 XP)", "18 (20,000 XP)", "19 (22,000 XP)", "20 (25,000 XP)", "21 (33,000 XP)", "22 (41,000 XP)", "23 (50,000 XP)", "24 (62,000 XP)", "25 (75,000 XP)", "26 (90,000 XP)", "27 (105,000 XP)", "28 (120,000 XP)", "29 (135,000 XP)", "30 (155,000 XP)"]
  };

  // Función ayudante para rellenar un <select> con opciones
  function rellenarSelect(idSelect, opciones, placeholder) {
    const select = document.getElementById(idSelect);
    if (!select) return; // Si no encuentra el select, no hace nada

    select.innerHTML = ''; // Limpia opciones anteriores
    if (placeholder) {
      select.add(new Option(placeholder, "")); // Añade un texto inicial si se especifica
    }
    opciones.forEach(opcion => {
      select.add(new Option(opcion, opcion.toLowerCase())); // Añade cada opción del array
    });
  }

  // Rellenamos cada menú desplegable
  rellenarSelect('editor-tamaño', datosDelJuego.tamaños, "Seleccionar Tamaño");
  rellenarSelect('editor-tipo', datosDelJuego.tipos, "Seleccionar Tipo");
  rellenarSelect('editor-alineamiento', datosDelJuego.alineamientos, "Seleccionar Alineamiento");
  rellenarSelect('editor-armadura', datosDelJuego.armaduras, "Seleccionar Armadura");
  rellenarSelect('select-salvaciones', datosDelJuego.salvaciones, "Tiradas de Salvación");
  rellenarSelect('select-habilidades', datosDelJuego.habilidades, "Habilidades");
  rellenarSelect('select-condiciones', datosDelJuego.tiposDeDaño, "Resistencias");
  rellenarSelect('editor-inmunidades-daño', datosDelJuego.tiposDeDaño, "Inmunidades al Daño");
  rellenarSelect('select-inmunidad-condicion', datosDelJuego.condiciones, "Inmunidades a Condición");

  rellenarSelect('select-tipos-daño', datosDelJuego.tiposDeDaño, "Seleccionar Tipo de Daño");

  rellenarSelect('select-inmunidad-condicion', datosDelJuego.condiciones, "Seleccionar Condición");

  rellenarSelect('editor-idiomas', datosDelJuego.idiomas, "Idiomas");
  rellenarSelect('editor-cr', datosDelJuego.cr, "Seleccionar CR");
}
/**
 * Dibuja la lista de criaturas en la tabla.
 * @param {Array<Object>} criaturas - El array con los datos de las criaturas.
 * @param {HTMLElement} tbody - El elemento <tbody> de la tabla.
 */
function renderizarCriaturas(criaturas, tbody) {
  tbody.innerHTML = ''; // Limpiamos la tabla

  criaturas.forEach((criatura, index) => {
    const fila = document.createElement('tr');

    const celdaNombre = document.createElement('td');
    celdaNombre.textContent = criatura.nombre;
    fila.appendChild(celdaNombre);

    const celdaCr = document.createElement('td');
    celdaCr.textContent = criatura.cr;
    fila.appendChild(celdaCr);

    fila.addEventListener('click', () => {
      const filaSeleccionada = tbody.querySelector('.selected');
      if (filaSeleccionada) {
        filaSeleccionada.classList.remove('selected');
      }
      fila.classList.add('selected');
    });

    if (index === 0) {
      fila.classList.add('selected');
    }
    
    tbody.appendChild(fila);
  });
}