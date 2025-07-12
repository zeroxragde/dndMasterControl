
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
let  stabsCreature;
let criaturasData = [
  
];
let litsViewCreaturas;

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
  stabsCreature = new Tabs({ id: 'creature-detail-view', orientation: 'vertical' });

  modalConfigs.forEach(config => new Modal(config));
  new Tabs({ id: 'web-container', orientation: 'horizontal' });
  // Creamos la instancia de la nueva clase ListView
  litsViewCreaturas=new ListView({
    containerId: 'creature-list-container',
    data: criaturasData,
    // Le decimos qué columnas crear y de dónde sacar los datos
    columns: [
      { header: 'Nombre', key: 'nombre' },
      { header: 'CR',     key: 'cr' }
    ],
      // Pásale a la función los datos completos del elemento de esa fila".
    onRowClick: (criaturaItem) => {
         console.log("Clic en criatura:", criaturaItem);
        if (criaturaItem) {
            mostrarDetallesCriatura(criaturaItem.fullData);
        }
    }
  });
  console.log("ListView de criaturas inicializado con datos:", criaturasData);
  inicializarOpcionesEspeciales();
  inicializarMapaEditor();
  //inicializarBotonAbrirCrea();
  inicializarClickEnImagenDetalle();
  actualizarArrayDeCriaturas();
  inicializarBotonImportarCrea();
  inicializarBotonRefreshCrea();
  inicializarBotonToggleLayer(mapCanvas);
}
function inicializarBotonToggleLayer(mapCanvas) {
  const btn = document.getElementById('btn_toggle_layer');
  const icon = document.getElementById('icon_toggle_layer');
  if (btn && icon) {
    btn.addEventListener('click', () => {
      mapCanvas.toggleActiveLayer();
      // Alterna entre "ojo abierto" y "ojo tachado"
      //icon.classList.toggle('fa-eye');
      //icon.classList.toggle('fa-eye-slash');
    });
  }
}
function inicializarBotonRefreshCrea() {
  const btn = document.getElementById('btn_refresh_crea');
  if (btn) {
    btn.addEventListener('click', async () => {
      await actualizarArrayDeCriaturas();
    });
  }
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
 * Añade el evento de clic al botón para importar archivos .crea.
 */
function inicializarBotonImportarCrea() {
  const boton = document.getElementById('btn_import_crea');
  if (boton) {
      boton.title = "Importar archivo .crea";
      boton.addEventListener('click', async () => {
          const resultado = await ipcRenderer.invoke('import-creature-file');
          
          if (resultado.success) {
              alert('¡Criatura importada con éxito!');
              // Después de importar, vuelve a llenar el array para incluir el nuevo archivo.
              actualizarArrayDeCriaturas();
          }
      });
  }
}
/**
 * Rellena el select de categorías del gestor de recursos.
 */
function poblarFiltroDeCategoriasMapaEditor() {
  const selector = document.getElementById('asset-category-select');
  const selectorFilter = document.getElementById('asset-category-filter');
  if (!selector || !selectorFilter) return;

  const categorias = [
      "personaje",
      "imagen",
      "tile",
      "mapa"
  ];
    
  selectorFilter.add(new Option("Todas", -1));
  var id = 0;
  categorias.forEach(cat => {
      // Crea una nueva opción para cada select (NO reuses objetos Option)
      const opcionSelector = new Option(cat.charAt(0).toUpperCase() + cat.slice(1), id);
      const opcionFilter = new Option(cat.charAt(0).toUpperCase() + cat.slice(1), id);
      selector.add(opcionSelector);
      selectorFilter.add(opcionFilter);
      id++; // Incrementa el ID para la siguiente categoría
   
  });

  // Selecciona la primera opción ("Todas")
  selectorFilter.selectedIndex = 0; 
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
                const categoriaTexto = (typeof asset.categoria === 'object' && asset.categoria !== null) 
                ? asset.categoria.categoria // 2. Si es un objeto, usamos su propiedad 'categoria'.
                : asset.categoria;  
            // --- HTML COMPLETO DE LA TARJETA ---
            console.log("Añadiendo asset:", nombreSinExtension, asset.categoria);
            // Añadimos de nuevo los <span> para el nombre y la categoría
            card.innerHTML = `
                <input type="checkbox" id="check-${asset.uuid}" class="asset-checkbox">
                <label for="check-${asset.uuid}" class="asset-image-label">
                    <img src="${asset.url}" class="asset-thumbnail" alt="${nombreSinExtension}" draggable="true">
                </label>
                <span class="asset-name">${nombreSinExtension}</span>
                <span class="asset-category">${categoriaTexto || 'N/A'}</span>
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
 * Configura la carga de assets, la visualización de la lista,
 * la eliminación y el filtrado por categoría de forma correcta y robusta.
 */
function inicializarCargadorDeAssetsMapaEditor() {
  const botonCargar = document.getElementById('btn-load-image');
  const botonBorrar = document.getElementById('btn-delete-asset');
  const selectCategoria = document.getElementById('asset-category-select');
  const filtroCategoria = document.getElementById('asset-category-filter');
  const assetListContainer = document.getElementById('asset-list');

  if (!botonCargar || !botonBorrar || !filtroCategoria) return;

  let todosLosAssets = []; // Un caché para guardar la lista completa de assets

  /**
   * Dibuja la lista de assets en la cuadrícula, aplicando el filtro actual.
   */
  const renderizarLista = () => {
      const filtroActual = filtroCategoria.value;
      assetListContainer.innerHTML = ''; 

      const assetsFiltrados = (filtroActual && filtroActual !== "")
          ? todosLosAssets.filter(asset => {
              let categoriaDelAsset = asset.categoria;
              if (typeof categoriaDelAsset === 'object' && categoriaDelAsset !== null) {
                  categoriaDelAsset = categoriaDelAsset.categoria;
              }
              return (categoriaDelAsset || '').toString() === filtroActual;
          })
          : todosLosAssets;

      if (!assetsFiltrados || assetsFiltrados.length === 0) {
          assetListContainer.innerHTML = '<p class="empty-list-message">No hay imágenes en esta categoría.</p>';
          return;
      }

      const gridContainer = document.createElement('div');
      gridContainer.className = 'asset-grid';

      assetsFiltrados.forEach(asset => {
          if (!asset || !asset.url) return;
          console.log("Assest cat  :", asset.categoria);
          const card = document.createElement('div');
          card.className = 'asset-card';
          card.dataset.uuid = asset.uuid;
          const nombreSinExtension = (asset.nombre || '').includes('.') ? asset.nombre.split('.').slice(0, -1).join('') : (asset.nombre || '');
          
          card.innerHTML = `
              <input type="checkbox" id="check-${asset.uuid}" class="asset-checkbox">
              <label for="check-${asset.uuid}" class="asset-image-label">
                  <img src="${asset.url}" class="asset-thumbnail" alt="${nombreSinExtension}" draggable="true">
              </label>
              <span class="asset-name">${nombreSinExtension}</span>
              <span class="asset-category">${asset.categoria || 'N/A'}</span>
          `;
          
          const img = card.querySelector('.asset-thumbnail');
          img.addEventListener('dragstart', (event) => {
              event.dataTransfer.setData('text/plain', asset.url);
          });
          
          gridContainer.appendChild(card);
      });
      assetListContainer.appendChild(gridContainer);
  };
  
  /**
   * Pide la lista completa de assets al proceso principal y la renderiza.
   */
  const actualizarListaCompleta = async () => {
      try {
          const assetsRecibidos = await ipcRenderer.invoke('get-asset-list');
          todosLosAssets = assetsRecibidos.flat();
          console.log("Lista de assets recibida:", todosLosAssets);
          renderizarLista();
      } catch (error) {
          console.error("Error al obtener la lista de assets:", error);
      }
  };
  
  // --- LÓGICA DE EVENTOS ---
  // Carga de imagen al seleccionar una categoría
  selectCategoria.addEventListener('change', renderizarLista);

  botonCargar.addEventListener('click', () => {
      const categoriaSeleccionada = selectCategoria.value;
      if (!categoriaSeleccionada || categoriaSeleccionada === "") {
          alert('Por favor, selecciona una categoría específica para la nueva imagen.');
          return;
      }
      ipcRenderer.send('abrir-dialogo-imagen', { categoria: categoriaSeleccionada });
  });

  // --- LÓGICA DEL BOTÓN DE BORRAR (RESTAURADA) ---
  botonBorrar.addEventListener('click', () => {
      const uuidsParaBorrar = [];
      const checkboxesMarcados = assetListContainer.querySelectorAll('.asset-checkbox:checked');
      if (checkboxesMarcados.length === 0) return alert('No has seleccionado ninguna imagen para eliminar.');
      if (confirm(`¿Seguro que quieres eliminar ${checkboxesMarcados.length} imagen(es)?`)) {
          checkboxesMarcados.forEach(cb => uuidsParaBorrar.push(cb.closest('.asset-card').dataset.uuid));
          ipcRenderer.send('delete-assets', uuidsParaBorrar);
      }
  });

  ipcRenderer.on('imagen-cargada-exito', () => actualizarListaCompleta());
  
  ipcRenderer.on('assets-deleted-success', () => {
      actualizarListaCompleta();
      if (mapCanvas) mapCanvas.clearMap();
  });
  
  // --- CARGA INICIAL ---
  filtroCategoria.value = ""; 
  actualizarListaCompleta();
}


/**
 * Llama al handler del backend para obtener la lista de criaturas
 * y la asigna directamente a la variable global 'criaturasData'.
 */
async function actualizarArrayDeCriaturas() {
  // 1. Llama al handler y espera la respuesta.
  const datosRecibidos = await ipcRenderer.invoke('load-creatures-from-app-folder');
  // 2. Asigna el resultado directamente al array.
  criaturasData = datosRecibidos;
  litsViewCreaturas.updateData(criaturasData);
  
  console.log("Actualizando el array de criaturas...",criaturasData);
}


/**
 * Función de ayuda para cambiar programáticamente a una pestaña específica.
 * @param {string} tabId El ID del panel de la pestaña a activar (ej: 'web-tab-creaturas').
 */
function activarPestana(tabId) {
  // 1. Oculta todas las pestañas y paneles
  document.querySelectorAll('.web-tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.web-tab-content').forEach(panel => panel.classList.remove('active'));

  // 2. Encuentra el botón y el panel correctos
  const botonActivar = document.querySelector(`.web-tab-button[aria-controls="${tabId}"]`);
  const panelActivar = document.getElementById(tabId);

  // 3. Los activa
  if (botonActivar) {
    botonActivar.classList.add('active');
    botonActivar.ariaSelected = "true";
  }
  if (panelActivar) {
    panelActivar.classList.add('active');
  }
}

/**
 * Rellena la vista de detalles de la criatura con los datos de un objeto.
 * @param {Creatura} criatura - El objeto con los datos de la criatura importada.
 */
function mostrarDetallesCriatura(datosCriaturaJSON) {
  // --- ¡CAMBIO CLAVE! ---
  // Antes de hacer nada, nos aseguramos de que la pestaña de criaturas esté visible.
  activarPestana('creature-detail-view');
  console.log("Detalles de la ed:", datosCriaturaJSON);
    // 1. Crea una nueva instancia de la clase Creatura.
    const criatura = new Creatura();

    // 2. Copia todas las propiedades del objeto JSON a nuestra nueva instancia de Creatura.
    // Object.assign() es una forma rápida y eficiente de hacer este mapeo.
    Object.assign(criatura, datosCriaturaJSON);

  // Ahora, el resto del código funcionará porque los elementos son visibles.
  console.log("Mostrando detalles de la criatura:", criatura);
  
  // Panel General
   // Usa las nuevas propiedades con la primera letra en mayúscula
   document.getElementById('detail-nombre').textContent = criatura.Nombre || 'Sin nombre';
   document.getElementById('detail-sublinea').textContent = `${criatura.Tamanio || ''} ${criatura.Tipo || ''}, ${criatura.Alineamiento || 'sin alineamiento'}`;
   document.getElementById('detail-ac').textContent = criatura.ClaseArmadura || '10';
   document.getElementById('detail-hp').textContent = `${criatura.PuntosGolpe || '0'} (${criatura.DadosGolpe || ''})`;
   document.getElementById('detail-velocidad').textContent = `${criatura.VelocidadCaminar || 30} pies`;
 
   // Puntuaciones de Característica
   document.getElementById('detail-fue').textContent = `${criatura.Fuerza || 10} (+${criatura.BonificadorFuerza || 0})`;
   document.getElementById('detail-des').textContent = `${criatura.Destreza || 10} (+${criatura.BonificadorDestreza || 0})`;
   document.getElementById('detail-con').textContent = `${criatura.Constitucion || 10} (+${criatura.BonificadorConstitucion || 0})`;
   document.getElementById('detail-int').textContent = `${criatura.Inteligencia || 10} (+${criatura.BonificadorInteligencia || 0})`;
   document.getElementById('detail-sab').textContent = `${criatura.Sabiduria || 10} (+${criatura.BonificadorSabiduria || 0})`;
   document.getElementById('detail-car').textContent = `${criatura.Carisma || 10} (+${criatura.BonificadorCarisma || 0})`;
 
   // Pie de la vista
   document.getElementById('detail-cr').textContent = criatura.CR+"/"+criatura.XP || '0';
   document.getElementById('detail-notas').value = criatura.Notas || '';
   
   const imagenDetalle = document.getElementById('detail-imagen');
   if (criatura.Imagen) {
     imagenDetalle.src = "data:image/png;base64,"+criatura.Imagen;
     imagenDetalle.style.display = 'block';
   } else {
     imagenDetalle.src = '';
     imagenDetalle.style.display = 'block';
   }

 
   // =====  PANEL DE HABILIDADES =====
    
    // Formatea y muestra las tiradas de salvación
    document.getElementById('detail-salvacion').textContent = criatura.Salvacion.join(', ') || 'Ninguna';

    // Formatea y muestra las habilidades (ej: "Sigilo +5, Percepción +7")
    const habilidadesStr = Object.entries(criatura.Habilidades)
        .map(([habilidad, valor]) => `${habilidad} ${valor}`)
        .join(', ');
    document.getElementById('detail-habilidades').textContent = habilidadesStr || 'Ninguna';

    // Formatea y muestra las inmunidades
    document.getElementById('detail-inmunidades-dano').textContent = criatura.InmunidadesDano.join(', ') || 'Ninguna';
    document.getElementById('detail-inmunidades-condicion').textContent = criatura.InmunidadesCondicion.join(', ') || 'Ninguna';

    // Formatea y muestra los sentidos
    document.getElementById('detail-sentidos').textContent = criatura.Sentidos.join(', ') || 'Ninguno';
    // FN DEL PANEL DE HABILIDADES

    // ===== PESTAÑA DE ACCIONES =====

    const contenedorAcciones = document.getElementById('detail-acciones-lista');
    const contenedorBonus = document.getElementById('detail-acciones-adicionales-lista');

    // Si los contenedores no existen, detenemos la función para evitar más errores.
    if (!contenedorAcciones || !contenedorBonus) return;
    // Limpiamos cualquier contenido que hubiera antes
    contenedorAcciones.innerHTML = '';
    contenedorBonus.innerHTML = '';

    // Función de ayuda para no repetir código
    const crearTarjetaDeAccion = (accion) => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'action-card';

        const nombre = document.createElement('strong');
        nombre.textContent = `${accion.Nombre}.`; // El nombre de la acción en cursiva

        const desc = document.createElement('p');
        desc.textContent = accion.Descripcion; // La descripción

        tarjeta.appendChild(nombre);
        tarjeta.appendChild(desc);
        return tarjeta;
    };

    // 1. Rellenar las Acciones normales
    if (criatura.Acciones && criatura.Acciones.length > 0) {
        criatura.Acciones.forEach(accion => {
            contenedorAcciones.appendChild(crearTarjetaDeAccion(accion));
        });
    } else {
        contenedorAcciones.innerHTML = '<p>Esta criatura no tiene acciones especiales.</p>';
    }

    // 2. Rellenar las Acciones Bonus
    if (criatura.AccionesAdicionales && criatura.AccionesAdicionales.length > 0) {
        criatura.AccionesAdicionales.forEach(accion => {
            contenedorBonus.appendChild(crearTarjetaDeAccion(accion));
        });
    } else {
        contenedorBonus.innerHTML = '<p>Esta criatura no tiene acciones adicionales.</p>';
    }
    //fn PESTAÑA DE ACCIONES

    // ===== AÑADE ESTE NUEVO BLOQUE PARA LAS PESTAÑAS RESTANTES =====

        // --- Función de ayuda genérica ---
        const rellenarPanel = (idContenedor, listaItems, mensajeVacio) => {
          const contenedor = document.getElementById(idContenedor);
          if (!contenedor) return;

          contenedor.innerHTML = ''; // Limpiar contenido anterior

          if (listaItems && listaItems.length > 0) {
              listaItems.forEach(item => {
                  const tarjeta = document.createElement('div');
                  tarjeta.className = 'action-card';

                  let nombreHtml = `<strong>${item.Nombre || item.nombre}.</strong>`;
                  // Caso especial para el costo de las acciones legendarias
                  if (item.CostoAccion) {
                      const costo = item.CostoAccion > 1 ? ` (Cuesta ${item.CostoAccion} Acciones)` : '';
                      nombreHtml = `<strong>${item.Nombre || item.nombre}.${costo}</strong>`;
                  }
                  
                  tarjeta.innerHTML = `${nombreHtml}<p>${item.Descripcion || item.descripcion}</p>`;
                  contenedor.appendChild(tarjeta);
              });
          } else {
              contenedor.innerHTML = `<p>${mensajeVacio}</p>`;
          }
      };

      // --- Rellenar cada panel usando la función de ayuda ---

      // 1. Acciones Legendarias
      rellenarPanel('detail-legendarias-lista', criatura.AccionesLegendarias, 'Esta criatura no tiene acciones legendarias.');

      // 2. Acciones de Guarida
      rellenarPanel('detail-guarida-lista', criatura.AccionesGuarida, 'Esta criatura no tiene acciones de guarida.');

      // 3. Acciones Míticas
      rellenarPanel('detail-miticas-lista', criatura.AccionesMiticas, 'Esta criatura no tiene acciones míticas.');

      // 4. Efectos Regionales
      rellenarPanel('detail-regional-lista', criatura.EfectosRegionales, 'No hay efectos regionales asociados a esta criatura.');

      // 5. Hechizos
      rellenarPanel('detail-hechizos-lista', criatura.HechizosOEspeciales, 'Esta criatura no tiene hechizos.');


////////////////////////////////////////////////////////////////////////////
    // Formatea y muestra los idiomas
    const idiomasStr = Object.entries(criatura.Idiomas)
        .map(([idioma, tipo]) => `${idioma} (${tipo})`)
        .join(', ');
    document.getElementById('detail-idiomas').textContent = idiomasStr || 'Ninguno';


   const detailView = document.getElementById('creature-detail-view');
   if (detailView) {
      detailView.style.display = 'block';
   }
    stabsCreature.activateTab(0);
}
/**
 * Añade el event listener a la imagen de la criatura en el panel de detalles.
 */
function inicializarClickEnImagenDetalle() {
  const imagenDetalle = document.getElementById('detail-imagen');
  if (imagenDetalle) {
    // Usamos un atributo para rastrear si la imagen está en el mapa.
    imagenDetalle.dataset.enMapa = 'false';

    imagenDetalle.addEventListener('click', () => {
      // Si la imagen no tiene una fuente válida, no hacemos nada.
      if (!imagenDetalle.src || !imagenDetalle.src.startsWith('data:image')) {
        return;
      }

      if (imagenDetalle.dataset.enMapa === 'false') {
        // --- Si no está en el mapa, la enviamos ---
        console.log('Enviando imagen al mapa...');
        // Enviamos la URL completa de la imagen (en base64) al proceso principal.
        ipcRenderer.send('show-creature-on-map', imagenDetalle.src);
        imagenDetalle.dataset.enMapa = 'true';
        // (Opcional) Añadimos un borde para indicar que está activa.
        imagenDetalle.style.border = '3px solid #00bcd4';

      } else {
        // --- Si ya está en el mapa, la quitamos ---
        console.log('Quitando imagen del mapa...');
        ipcRenderer.send('hide-creature-on-map');
        imagenDetalle.dataset.enMapa = 'false';
        // (Opcional) Quitamos el borde.
        imagenDetalle.style.border = '1px solid #58180D';
      }
    });
  }
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