
// --- Variables específicas para el Dashboard ---
// Al principio de tu archivo dashboard.js

// Al principio de tu archivo dashboard.js
import { Creatura } from './Modelos/creatura.js';
const { ipcRenderer } = require('electron');
const audio = document.getElementById('audioPlayer');
const nombreCancion = document.getElementById('nombreCancion');
 const categorias_assets = [
      "personaje",
      "imagen",
      "tile",
      "mapa"
];
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
let  editorModal;
let criaturasData = [
  
];
let litsViewCreaturas;
let spriteModal;
let editCrea=null;


const initiativeList = document.getElementById('initiative-list');
const addCharBtn = document.getElementById('add-char-btn');
const newCharInput = document.getElementById('new-char-name');
let characters = [];

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
}

/**
 * Crea las instancias de las clases Modal y Tabs para la página.
 */
function inicializarComponentes() {
  

  
  new Tabs({ id: 'web-container', orientation: 'horizontal' });
  // Configuración para todos los modales.
  const modalConfigs = [
    { id: 'listaPanel', triggerId: 'btnLista', closeClassName: 'modal-close-btn', movable: true,width: '20%', },
    { id: 'modalSubida', triggerId: 'abrirSubida', closeClassName: 'modal-close-btn', movable: true,width: '40%',height: '300px' }
  ];
  // Creamos una instancia de Tabs para la view de criaturas
  stabsCreature = new Tabs({ id: 'creature-detail-view', orientation: 'vertical' });
  editorModal = new Modal(    {
      id: 'modalEditor', 
      triggerId: 'btnOpenEditor', 
      closeClassName: 'editor-close-btn',
      movable: true, 
      width: '85%',
      height: '76vh',
      onOpen: () => {

        iniciarModalEditor();

        var title = 'NUEVA CRIATURA';
        
        if (editCrea) {
          title = 'EDITOR DE CRIATURA';
        }else{
          editCrea = new Creatura();
        }
        new Tabs({ id: 'creature-editor-container', orientation: 'vertical', title: title });
        if (editCrea) {
          // Llama a llenarModalEditor con un pequeño retardo para asegurar que el DOM está listo
          setTimeout(() => {
            llenarModalEditor();
          }, 100);
        }

      }
  });
  const btnDeleteCrea = document.getElementById('btn_delete_crea');

  btnDeleteCrea.addEventListener('click', async () => {
    const selectedCreatureFile = litsViewCreaturas.getSelectedItem(); // O el método equivalente que tengas
    if (!selectedCreatureFile) {
      alert('Selecciona una criatura para eliminar.');
      return;
    }
    if (!confirm('¿Seguro que quieres eliminar este archivo de criatura?')) return;

    // Envía el nombre o ruta al backend
    const resultado = await ipcRenderer.invoke('delete-creature-file', selectedCreatureFile.filepath);
    if (resultado && resultado.success) {
      alert('Archivo eliminado correctamente.');
      // Actualiza la lista
      await actualizarArrayDeCriaturas();
    } else {
      alert('No se pudo eliminar el archivo.');
    }
  });

  // --- Inicializamos el botón de edición de criaturas ---
  document.getElementById('btn_edit_crea').addEventListener('click', () => {
    // Obtenemos la criatura seleccionada del ListView (litsViewCreaturas)
    const seleccion = litsViewCreaturas.getSelectedItem(); // O el método equivalente que tengas

    if (!seleccion) {
      alert('Por favor, selecciona una criatura para editar.');
      return;
    }


    editCrea = seleccion.fullData;
    editorModal.open();

  });


  modalConfigs.forEach(config => new Modal(config));
 
  // Creamos la instancia de la nueva clase ListView
  litsViewCreaturas=new ListView({
    containerId: 'creature-list-container',
    data: criaturasData,
    // Le decimos qué columnas crear y de dónde sacar los datos
    columns: [
      { header: 'Nombre', key: 'nombre' },
      { header: 'CR',     key: 'cr' },
      { header: 'Campaña', key: 'campania' }
    ],
      // Pásale a la función los datos completos del elemento de esa fila".
    onRowClick: (criaturaItem) => {
         console.log("Clic en criatura:", criaturaItem);
        if (criaturaItem) {
            mostrarDetallesCriatura(criaturaItem.fullData);
        }
    }
  });
  var select = document.getElementById('asset-category-select');
  spriteModal = new SpriteSheetEditorModal({
    id: 'spritesheet-modal',
    triggerId: 'btn-open-spritesheet',
    movable: true,
    onCloseEditor: () => {
      console.log("Editor cerrado, actualizando lista de assets...");
       inicializarCargadorDeAssetsMapaEditor();
    },
    onOpenEditor: (t) => {
      const categoriaSeleccionada = select.value;
      if (!categoriaSeleccionada || categoriaSeleccionada === "") {
          alert('Por favor, selecciona una categoría específica para la nueva imagen.');
          return;
      }
      t.setCategoria(categoriaSeleccionada);
    }
  });

  

  inicializarMapaEditor();
  actualizarArrayDeCriaturas();
  inicializarBotonImportarCrea();
  inicializarBotonRefreshCrea();
  inicializarBotonToggleLayer(mapCanvas);
  inicializarDocs();
  renderInitiative();
  renderizarHechizos();
  ['fuerza', 'destreza', 'con', 'int', 'sab', 'car'].forEach(stat => {
    document.getElementById('input-' + stat).addEventListener('input', actualizarBonificador);
  });
}

// Helper para quitar tildes y pasar a minúsculas (normalización)
function normaliza(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina tildes
    .toLowerCase();
}
function calcularBonificador(valor) {
  valor = parseInt(valor, 10);
  if (isNaN(valor)) return '';
  let bonus = Math.floor((valor - 10) / 2);
  return (bonus >= 0 ? '+' : '') + bonus;
}

function iniciarModalEditor() {
  poblarDropdownsEditorCrea();
  inicializarClickEnImagenDetalleCreatura();
  inicializarOpcionesEspeciales();

document.getElementById('editor-nombre').addEventListener('input', function(e) {
  editCrea.Nombre = e.target.value;
});
document.getElementById('editor-tamaño').addEventListener('change', function(e) {
  editCrea.Tamanio = e.target.value;
});
document.getElementById('editor-tipo').addEventListener('change', function(e) {
  editCrea.Tipo = e.target.value;
});
document.getElementById('editor-alineamiento').addEventListener('change', function(e) {
  editCrea.Alineamiento = e.target.value;
});

const inputBonus = document.getElementById('editor-bonus');
const selectArmadura = document.getElementById('editor-armadura');
selectArmadura.addEventListener('change', function(e) {
  const selected = e.target.value;
  editCrea.DescripcionArmadura = selected;

  if (selected === "armadura natural" || selected === "otra") {
    inputBonus.style.display = '';
  } else {
    inputBonus.style.display = 'none';
    inputBonus.value = ''; // Limpiar si se oculta
  }
});
// Cuando cambie el bonus (si está visible)
inputBonus.addEventListener('input', function(e) {
  if (selectArmadura.value === "Armadura Natural" || selectArmadura.value === "Otra") {
    // Puedes guardar como número o string según tu modelo
    editCrea.ClaseArmadura = parseInt(e.target.value, 10) || 0;
  }
});

// Puedes hacer que cuando cambie CA (input), también actualice la Creatura
document.getElementById('editor-ac').addEventListener('input', function(e) {
  editCrea.ClaseArmadura = parseInt(e.target.value, 10) || 0;
});

// Elementos
const selectSalvacion = document.getElementById('select-salvaciones');
const btnAddSalvacion = document.querySelector('button[data-target-panel="editor-panel-salvaciones"]');
const panelSalvaciones = document.getElementById('editor-panel-salvaciones');

if (btnAddSalvacion) {
  btnAddSalvacion.addEventListener('click', function () {
    const valorSeleccionado = selectSalvacion.value;
    const textoSeleccionado = selectSalvacion.options[selectSalvacion.selectedIndex].text;

    // Evitar "Seleccionar..." o duplicados
    if (selectSalvacion.selectedIndex === 0 || !valorSeleccionado) return;
    if (!Array.isArray(editCrea.Salvacion)) editCrea.Salvacion = [];
    if (editCrea.Salvacion.includes(textoSeleccionado)) return;

    // Crear contenedor
    const contenedor = document.createElement('span');
    contenedor.className = 'salvacion-badge';
    contenedor.style.display = 'inline-flex';
    contenedor.style.alignItems = 'center';
    contenedor.style.margin = '2px 4px';
    contenedor.style.background = '#1d342b';
    contenedor.style.borderRadius = '5px';
    contenedor.style.padding = '2px 8px';

    // Label
    const lbl = document.createElement('span');
    lbl.textContent = textoSeleccionado;
    lbl.style.color = 'white';
    lbl.style.marginRight = '8px';

    // Botón eliminar (puedes reemplazar el "×" por un icono SVG si lo prefieres)
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = '×';
    btnEliminar.style.background = 'none';
    btnEliminar.style.border = 'none';
    btnEliminar.style.color = '#ffe6e6';
    btnEliminar.style.fontWeight = 'bold';
    btnEliminar.style.cursor = 'pointer';
    btnEliminar.style.fontSize = '16px';
    btnEliminar.style.padding = '0';

    btnEliminar.onclick = function () {
      // Elimina visualmente
      panelSalvaciones.removeChild(contenedor);
      // Elimina del objeto
      const idx = editCrea.Salvacion.indexOf(textoSeleccionado);
      if (idx > -1) editCrea.Salvacion.splice(idx, 1);
    };

    contenedor.appendChild(lbl);
    contenedor.appendChild(btnEliminar);
    panelSalvaciones.appendChild(contenedor);

    // Añade al objeto
    editCrea.Salvacion.push(textoSeleccionado);
  });
}



const selectHabilidades = document.getElementById('select-habilidades');
const panelHabilidades = document.getElementById('editor-panel-habilidades');

// Esta función agrega una habilidad y la muestra en el panel
function agregarHabilidad(tipo) {
  const habilidad = selectHabilidades.value;
  const texto = selectHabilidades.options[selectHabilidades.selectedIndex].text;

  // Evita "placeholder"
  if (!habilidad || habilidad === "habilidades") return;
  // Evita duplicados
  if (editCrea.Habilidades[habilidad] && editCrea.Habilidades[habilidad] === tipo) return;

  // Actualiza el objeto
  editCrea.Habilidades[habilidad] = tipo;

  // Crea el div visual
  const tag = document.createElement('span');
  tag.className = tipo === "experto" ? "skill-tag experto" : "skill-tag competente";
  tag.textContent = texto + (tipo === "experto" ? " (Experto)" : " (Competente)");

  // Botón para eliminar
  const removeBtn = document.createElement('button');
  removeBtn.textContent = "×";
  removeBtn.className = "remove-skill-btn";
  removeBtn.onclick = () => {
    delete editCrea.Habilidades[habilidad];
    panelHabilidades.removeChild(tag);
  };

  tag.appendChild(removeBtn);
  panelHabilidades.appendChild(tag);
}
// Listeners para los botones COMPETENTE y EXPERTO
document.getElementById('panel-habilidades-competente').addEventListener('click', function () {
  agregarHabilidad('competente');
});

document.getElementById('panel-habilidades-experto').addEventListener('click', function () {
  agregarHabilidad('experto');
});


}//fin 

function llenarModalEditor() {
  var creatura = editCrea || null;
  if (!creatura) return;

  document.getElementById('editor-nombre').value = creatura.Nombre || '';

  // TAMAÑO
  const selTam = document.getElementById('editor-tamaño');
  if (selTam) selTam.value = normaliza(creatura.Tamanio);

  // TIPO
  const selTipo = document.getElementById('editor-tipo');
  if (selTipo) selTipo.value = normaliza(creatura.Tipo);

  // ALINEAMIENTO
  const selAli = document.getElementById('editor-alineamiento');
  if (selAli) selAli.value = normaliza(creatura.Alineamiento);

  const selArm = document.getElementById('editor-armadura');
  const inputBonus = document.getElementById('editor-bonus');
  if (selArm) {
    // Asigna el valor normalizado (¡puedes quitar normaliza si tus valores no están en minúsculas!)
    selArm.value = creatura.DescripcionArmadura || '';
  
    // Si la armadura es especial, muestra el bonus y lo llena
    if (
      creatura.DescripcionArmadura === "Armadura Natural" ||
      creatura.DescripcionArmadura === "Otra"
    ) {
      inputBonus.style.display = '';
      inputBonus.value = creatura.ClaseArmadura || '';
    } else {
      inputBonus.style.display = 'none';
      inputBonus.value = '';
    }
  
    // Dispara el evento change para forzar que cualquier lógica asociada se aplique (por si tienes listeners adicionales)
    selArm.dispatchEvent(new Event('change'));
  }

  // ESCUDO (checkbox)
  const escudoChk = document.getElementById('editor-escudo');
  if (escudoChk) escudoChk.checked = !!creatura.Escudo;

  // PUNTOS DE GOLPE Y DADOS DE GOLPE
  document.getElementById('editor-hp-promedio').value = creatura.PuntosGolpe || '';
  document.getElementById('editor-hp-dados').value = creatura.DadosGolpe || '';

  // CLASE DE ARMADURA
  document.getElementById('editor-ac').value = creatura.ClaseArmadura || '';

  // VELOCIDADES
  document.getElementById('input-velocidad').value = creatura.VelocidadCaminar || '';
  document.getElementById('input-vel-cavado').value = creatura.VelocidadCavar || '';
  document.getElementById('input-vel-escalado').value = creatura.VelocidadEscalado || '';
  document.getElementById('input-vel-vuelo').value = creatura.VelocidadVolar || '';
  document.getElementById('input-vel-nado').value = creatura.VelocidadNadar || '';

  // CARACTERÍSTICAS
  document.getElementById('input-fuerza').value = creatura.Fuerza || '';
  document.getElementById('input-destreza').value = creatura.Destreza || '';
  document.getElementById('input-con').value = creatura.Constitucion || '';
  document.getElementById('input-int').value = creatura.Inteligencia || '';
  document.getElementById('input-sab').value = creatura.Sabiduria || '';
  document.getElementById('input-car').value = creatura.Carisma || '';
  // Llenar y actualizar bonificadores al mismo tiempo
  document.getElementById('bonus-fuerza').textContent      = calcularBonificador(creatura.Fuerza);
  document.getElementById('bonus-destreza').textContent    = calcularBonificador(creatura.Destreza);
  document.getElementById('bonus-con').textContent         = calcularBonificador(creatura.Constitucion);
  document.getElementById('bonus-int').textContent         = calcularBonificador(creatura.Inteligencia);
  document.getElementById('bonus-sab').textContent         = calcularBonificador(creatura.Sabiduria);
  document.getElementById('bonus-car').textContent         = calcularBonificador(creatura.Carisma);

  const panelSalvaciones = document.getElementById('panel-salvaciones');
  if (!panelSalvaciones) return;
  panelSalvaciones.innerHTML = ''; // Limpiar todo antes de renderizar

  // Asegúrate de que exista el array
  if (!Array.isArray(editCrea.Salvacion)) editCrea.Salvacion = [];

  editCrea.Salvacion.forEach(textoSeleccionado => {
    const contenedor = document.createElement('span');
    contenedor.className = 'salvacion-badge';
    contenedor.style.display = 'inline-flex';
    contenedor.style.alignItems = 'center';
    contenedor.style.margin = '2px 4px';
    contenedor.style.background = '#1d342b';
    contenedor.style.borderRadius = '5px';
    contenedor.style.padding = '2px 8px';

    // Label
    const lbl = document.createElement('span');
    lbl.textContent = textoSeleccionado;
    lbl.style.color = 'white';
    lbl.style.marginRight = '8px';

    // Botón eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = '×';
    btnEliminar.style.background = 'none';
    btnEliminar.style.border = 'none';
    btnEliminar.style.color = '#ffe6e6';
    btnEliminar.style.fontWeight = 'bold';
    btnEliminar.style.cursor = 'pointer';
    btnEliminar.style.fontSize = '16px';
    btnEliminar.style.padding = '0';

    btnEliminar.onclick = function () {
      panelSalvaciones.removeChild(contenedor);
      const idx = editCrea.Salvacion.indexOf(textoSeleccionado);
      if (idx > -1) editCrea.Salvacion.splice(idx, 1);
    };

    contenedor.appendChild(lbl);
    contenedor.appendChild(btnEliminar);
    panelSalvaciones.appendChild(contenedor);
  });









  // NOTAS
  document.getElementById('editor-notas').value = creatura.Notas || '';

  // CR
  const selCR = document.getElementById('editor-cr-tab2');
  if (selCR) selCR.value = creatura.CR || '';

  // IMAGEN
  const previewImg = document.getElementById('preview-imagen-criatura');
  if (previewImg) {
    if (creatura.Imagen) {
      previewImg.src = creatura.Imagen;
      previewImg.style.display = 'block';
    } else {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
  }

  // Para selects de habilidades, salvaciones, resistencias, etc, debes llenar los paneles si quieres mostrar la lista (como lo hacías antes)
  // Ejemplo para paneles:
  // document.getElementById('panel-salvaciones').innerHTML = ...
  // document.getElementById('panel-habilidades').innerHTML = ...
  // etc.
}

function actualizarBonificador(event) {
  const input = event.target;
  // El id del input será 'input-fuerza', 'input-destreza', etc.
  // El id del bonus será 'bonus-fuerza', 'bonus-destreza', etc.
  const stat = input.id.replace('input-', ''); // fuerza, destreza, ...
  const bonusSpan = document.getElementById('bonus-' + stat);
  const valor = parseInt(input.value, 10);

  let bonus = '';
  if (!isNaN(valor)) {
    bonus = Math.floor((valor - 10) / 2);
    bonus = (bonus >= 0 ? '+' : '') + bonus;
  }
  bonusSpan.textContent = bonus;
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
    
  selectorFilter.add(new Option("Todas", -1));
  var id = 0;
  categorias_assets.forEach(cat => {
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
            var realCatName = "";
            const idx = Number(asset?.categoria?.categoria);

            if (
              Array.isArray(categorias_assets) &&
              !isNaN(idx) &&
              categorias_assets[idx]
            ) {
              var cat = categorias_assets[idx];
              realCatName = cat.charAt(0).toUpperCase() + cat.slice(1);
            }

            console.log("Real cat name:", realCatName);

            card.innerHTML = `
                <input type="checkbox" id="check-${asset.uuid}" class="asset-checkbox">
                <label for="check-${asset.uuid}" class="asset-image-label">
                    <img src="${asset.url}" class="asset-thumbnail" alt="${nombreSinExtension}" draggable="true">
                </label>
                <span class="asset-name">${nombreSinExtension}</span>
                <span class="asset-category">${realCatName || 'N/A'}</span>
            `;
            // --- AÑADIMOS EL EVENTO DRAGSTART ---  

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

      const assetsFiltrados = (filtroActual && (filtroActual !== "") && (filtroActual !== "-1"))
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
          var realCatName = "";
          const idx = Number(asset?.categoria?.categoria);

          if (
            Array.isArray(categorias_assets) &&
            !isNaN(idx) &&
            categorias_assets[idx]
          ) {
            var cat = categorias_assets[idx];
            realCatName = cat.charAt(0).toUpperCase() + cat.slice(1);
          }

          card.innerHTML = `
              <input type="checkbox" id="check-${asset.uuid}" class="asset-checkbox">
              <label for="check-${asset.uuid}" class="asset-image-label">
                  <img src="${asset.url}" class="asset-thumbnail" alt="${nombreSinExtension}" draggable="true">
              </label>
              <span class="asset-name">${nombreSinExtension}</span>
              <span class="asset-category">${realCatName || 'N/A'}</span>
          `;
          
          const img = card.querySelector('.asset-thumbnail');
          img.addEventListener('dragstart', (event) => {
              event.dataTransfer.setData('text/plain', asset.url);
          });
          
          gridContainer.appendChild(card);
    });
      assetListContainer.appendChild(gridContainer);
  };//fin del renderizarLista
  
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
  filtroCategoria.addEventListener('change', renderizarLista);

  
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
function inicializarClickEnImagenDetalleCreatura() {
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
 function poblarDropdownsEditorCrea() {
  const datosDelJuego = {
    tamanos: [
      "Seleccionar Tamano",
      "Diminuto",
      "Pequeno",
      "Mediano",
      "Grande",
      "Enorme",
      "Gargantuesco"
    ],
    tipos: [
      "Seleccionar Tipo",
      "Aberracion",
      "Bestia",
      "Celestial",
      "Constructo",
      "Dragon",
      "Elemental",
      "Feerico",
      "Engendro",
      "Constructo",
      "Gigante",
      "Humanoide",
      "Monstruosidad",
      "Limo",
      "Sombra",
      "Planta",
      "No muerto",
      "Otro"
    ],
    armaduras: [
      "Seleccionar Armadura",
      "Ninguna",
      "Armadura Natural",
      "Armadura de Mago",
      "Acolchada",
      "Cuero",
      "Cuero Tachonado",
      "Oculta",
      "Camisa de Malla",
      "Armadura de Escamas",
      "Coraza",
      "Media Armadura",
      "Armadura de Anillos",
      "Cota de Malla",
      "Armadura Laminada",
      "Armadura Completa",
      "Otra"
    ],
    salvaciones: [
      "Tirada de Salvacion",
      "Fuerza",
      "Destreza",
      "Constitucion",
      "Inteligencia",
      "Sabiduria",
      "Carisma"
    ],
    habilidades: [
      "Habilidades",
      "Acrobacias",
      "Trato con Animales",
      "Arcanos",
      "Atletismo",
      "Engano",
      "Historia",
      "Perspicacia",
      "Intimidacion",
      "Investigacion",
      "Medicina",
      "Naturaleza",
      "Percepcion",
      "Interpretacion",
      "Persuasion",
      "Religion",
      "Juego de Manos",
      "Sigilo",
      "Supervivencia"
    ],
    condiciones: [
      "Seleccionar Estado",
      "Cegado",
      "Hechizado",
      "Ensordecido",
      "Agotamiento",
      "Aterrorizado",
      "Agarrado",
      "Incapacitado",
      "Invisible",
      "Paralizado",
      "Petrificado",
      "Envenenado",
      "Derribado",
      "Restringido",
      "Aturdido",
      "Inconsciente"
    ],
    tiposDeDano: [
      "Tipo de dano",
      "Acido",
      "Contundente",
      "Frio",
      "Fuego",
      "Fuerza",
      "Relampago",
      "Necrotico",
      "Perforante",
      "Veneno",
      "Psiquico",
      "Radiante",
      "Cortante",
      "Trueno",
      "Ataques no magicos",
      "Ataques no plateados",
      "Ataques no adamantinos",
      "Otro"
    ],
    idiomas: [
      "Todas",
      "Abisal",
      "Acuatico",
      "Aurico",
      "Celestial",
      "Comun",
      "Habla Profunda",
      "Draconico",
      "Enano",
      "Elfco",
      "Gigante",
      "Goblin",
      "Gnomico",
      "Mediano",
      "Igneo",
      "Infernal",
      "Orco",
      "Primordial",
      "Feerico",
      "Telurico",
      "Subcomun",
      "Otro"
    ],
    cr: [
      "Seleccionar CR",
      "CR Personalizado",
      "0 (10 XP)",
      "1/8 (25 XP)",
      "1/4 (50 XP)",
      "1/2 (100 XP)",
      "1 (200 XP)",
      "2 (450 XP)",
      "3 (700 XP)",
      "4 (1,100 XP)",
      "5 (1,800 XP)",
      "6 (2,300 XP)",
      "7 (2,900 XP)",
      "8 (3,900 XP)",
      "9 (5,000 XP)",
      "10 (5,900 XP)",
      "11 (7,200 XP)",
      "12 (8,400 XP)",
      "13 (10,000 XP)",
      "14 (11,500 XP)",
      "15 (13,000 XP)",
      "16 (15,000 XP)",
      "17 (18,000 XP)",
      "18 (20,000 XP)",
      "19 (22,000 XP)",
      "20 (25,000 XP)",
      "21 (33,000 XP)",
      "22 (41,000 XP)",
      "23 (50,000 XP)",
      "24 (62,000 XP)",
      "25 (75,000 XP)",
      "26 (90,000 XP)",
      "27 (105,000 XP)",
      "28 (120,000 XP)",
      "29 (135,000 XP)",
      "30 (155,000 XP)"
    ],
  alineamientos:[
      "Seleccionar Alineamiento",
      "Legal Bueno",
      "Neutral Bueno",
      "Caotico Bueno",
      "Legal Neutral",
      "Neutral",
      "Caotico Neutral",
      "Legal Malvado",
      "Neutral Malvado",
      "Caotico Malvado"
    ]
  };

function rellenarSelect(id, opciones) {
  const select = document.getElementById(id);
  if (!select) return;
  if (!Array.isArray(opciones)) {
    console.error("No se encontró el array de opciones para:", id, opciones);
    return;
  }
  select.innerHTML = '';
  opciones.forEach(opcion => {
    select.add(new Option(opcion, opcion.toLowerCase()));
  });
}
  // OJO con los nombres, revisa que coincidan exactamente con tu HTML:
  rellenarSelect('editor-tamaño', datosDelJuego.tamanos);           // <--- con ñ
  rellenarSelect('editor-tipo', datosDelJuego.tipos);
  rellenarSelect('editor-armadura', datosDelJuego.armaduras);
  rellenarSelect('select-salvaciones', datosDelJuego.salvaciones);
  rellenarSelect('select-habilidades', datosDelJuego.habilidades);
  rellenarSelect('select-tipos-daño', datosDelJuego.tiposDeDano);   // <--- con ñ
  rellenarSelect('select-tipos-dao', datosDelJuego.tiposDeDano);    // <--- sin ñ
  rellenarSelect('select-inmunidad-condicion', datosDelJuego.condiciones);
  rellenarSelect('select-idiomas', datosDelJuego.idiomas);
  rellenarSelect('editor-cr-tab2', datosDelJuego.cr);               // Pestaña 2 (CR)
  rellenarSelect('editor-alineamiento', datosDelJuego.alineamientos);

  // Si decides agregar alineamiento, crea el <select id="editor-alineamiento"></select> y entonces activa esta línea:
  // rellenarSelect('editor-alineamiento', datosDelJuego.alineamientos);

}


//FUncion

async function inicializarDocs() {
  // 1. Obtener los elementos del DOM
  const docListContainer = document.getElementById('doc-list');
  const docContentContainer = document.getElementById('doc-content');
  const btnUploadDoc = document.getElementById('btn-upload-doc');
  const btnRefreshList = document.getElementById('btn-refresh-list');
  let username = userConfig.dm; // Usuario actual

  // 2. Verificar que todos existen ANTES de seguir
  if (!docListContainer || !docContentContainer || !btnUploadDoc || !btnRefreshList) {
    console.error('[inicializarDocs] Faltan elementos en el HTML. Revisa que los IDs existan: "doc-list", "doc-content", "btn-upload-doc", "btn-refresh-list"');
    return;
  }

  // 3. Input oculto para seleccionar archivos
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.doc,.docx';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  // 4. Función para cargar la lista de documentos
  async function loadDocList() {
    if (!username) return;
    const docs = await ipcRenderer.invoke('get-doc-list', username);
    docListContainer.innerHTML = '';
    docContentContainer.innerHTML = '';
    if (!docs || docs.length === 0) {
      docListContainer.innerHTML = '<p style="color: white;">No hay documentos.</p>';
      return;
    }
    docs.forEach(doc => {
      const btn = document.createElement('button');
      btn.textContent = doc;
      btn.className = 'btn-doc-list-item';
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.marginBottom = '6px';
      btn.style.padding = '8px';
      btn.style.background = '#222b7b';
      btn.style.color = 'white';
      btn.style.border = 'none';
      btn.style.textAlign = 'left';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => openDoc(doc));
      docListContainer.appendChild(btn);
    });
  }

  // 5. Función para abrir y mostrar el contenido del documento
  async function openDoc(filename) {
    if (!username) return;
    const contentHtml = await ipcRenderer.invoke('load-doc-content', username, filename);
    if (contentHtml) {
      renderDocPages(contentHtml);
     // docContentContainer.innerHTML = contentHtml;
    } else {
      docContentContainer.innerHTML = '<p style="color: red;">Error al cargar documento.</p>';
    }
  }

  // 6. Divide el contenido HTML en páginas tipo Word
function renderDocPages(htmlContent) {
  docContentContainer.innerHTML = ''; // limpiar

  // Divide por los saltos de página (puede ser <hr>, <hr class="pageBreak"> o <hr ...>)
  // Ajusta el regex según cómo aparezcan los saltos de página en tu HTML
 // const pages = htmlContent.split(/(?=<h1[^>]*><a id="[^"]*"><\/a><strong>)/i);
  //const pages = htmlContent.split(/(?=<h[12][^>]*><a id="[^"]*"><\/a><strong>)/i);

 // pages.forEach(pageHtml => {
    const pageDiv = document.createElement('div');
   // pageDiv.className = 'doc-page';
    pageDiv.style.width = '794px';
    //pageDiv.style.minHeight = '1122px';
    pageDiv.style.margin = '20px auto';
    pageDiv.style.padding = '20px';
    pageDiv.style.background = 'white';
   // pageDiv.style.boxShadow = '0 0 8px rgba(0,0,0,0.1)';
    pageDiv.style.color = 'rgba(0, 0, 0)';
    pageDiv.style.overflow = 'auto';
    pageDiv.innerHTML = htmlContent;
    docContentContainer.appendChild(pageDiv);
 // });
}


  // 7. Eventos para subir y refrescar docs
  btnUploadDoc.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await ipcRenderer.invoke('save-doc-file', username, { name: file.name, data: buffer });
    await loadDocList();
    fileInput.value = '';
  });

  btnRefreshList.addEventListener('click', () => loadDocList());
const btnDeleteDoc = document.getElementById('btn-delete-doc');
let selectedDoc = null;

// Actualiza openDoc para recordar el doc seleccionado:
async function openDoc(filename) {
  if (!username) return;
  selectedDoc = filename;
  const contentHtml = await ipcRenderer.invoke('load-doc-content', username, filename);
  if (contentHtml) {
    renderDocPages(contentHtml);
   // docContentContainer.innerHTML = contentHtml;
  } else {
    docContentContainer.innerHTML = '<p style="color: red;">Error al cargar documento.</p>';
  }
}

// Lógica para borrar doc:
btnDeleteDoc.addEventListener('click', async () => {
  if (!selectedDoc) {
    alert('Selecciona un documento primero');
    return;
  }
  if (!confirm(`¿Seguro que quieres eliminar "${selectedDoc}"?`)) return;
  await ipcRenderer.invoke('delete-doc-file', username, selectedDoc);
  selectedDoc = null;
  await loadDocList();
});
  // 8. Cargar la lista al iniciar el tab
  loadDocList();
}

///////////////////////
// Función para renderizar la lista según el array characters

function renderInitiative() {
  // Obtener elementos
  const initiativeList = document.getElementById('initiative-list');
  const addCharBtn = document.getElementById('add-char-btn');
  const newCharInput = document.getElementById('new-char-name');

  // Variables internas
  let characters = [];

  // --- Funciones internas ---

  // Drag and drop handlers
  let dragSrcEl = null;

  function dragStart(e) {
    dragSrcEl = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.index);
  }

  function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget;
    if (target && target !== dragSrcEl) {
      const rect = target.getBoundingClientRect();
      const next = (e.clientY - rect.top) / rect.height > 0.5;
      initiativeList.insertBefore(dragSrcEl, next ? target.nextSibling : target);
    }
  }

  function drop(e) {
    e.stopPropagation();
    const draggedIndex = Number(e.dataTransfer.getData('text/plain'));
    const droppedIndex = Number(this.dataset.index);
    if (draggedIndex === droppedIndex) return;

    const draggedItem = characters[draggedIndex];
    characters.splice(draggedIndex, 1);
    characters.splice(droppedIndex, 0, draggedItem);
    renderList();
    savePlayersData();
  }

  function dragEnd() {
    this.classList.remove('dragging');
  }

  function savePlayersData() {
    const iniciativa = Array.from(document.querySelectorAll('#initiative-list .player-card')).map(card => card.dataset.name);
    const runas = []; // Completa según tu estructura actual
    ipcRenderer.send('save-players-data', { data: { iniciativa, runas } });
  }

  function renderList() {
    initiativeList.innerHTML = '';
    characters.forEach((char, idx) => {
      const li = document.createElement('li');
      li.classList.add('player-card');
      li.dataset.name = char.name;
      li.setAttribute('draggable', true);
      li.dataset.index = idx;
      li.textContent = char.name;

      // Botón para borrar
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.classList.add('remove-btn');
      removeBtn.title = 'Eliminar personaje';
      removeBtn.onclick = e => {
        e.stopPropagation();
        const indexToRemove = characters.findIndex(c => c.name === char.name);
        if (indexToRemove > -1) {
          characters.splice(indexToRemove, 1);
          renderList();
          savePlayersData();
        }
      };

      li.appendChild(removeBtn);

      // Drag and drop events
      li.addEventListener('dragstart', dragStart);
      li.addEventListener('dragover', dragOver);
      li.addEventListener('drop', drop);
      li.addEventListener('dragend', dragEnd);

      initiativeList.appendChild(li);
    });
  }

  // Añadir personaje
  function addCharHandler() {
    const name = newCharInput.value.trim();
    if (!name) return;
    characters.push({ name });
    newCharInput.value = '';
    renderList();
    savePlayersData();
    newCharInput.focus();
  }

  // Cargar jugadores
  async function loadPlayersData() {
    try {
      const data = await ipcRenderer.invoke('load-players-data');
      if (data && Array.isArray(data.iniciativa)) {
        characters = data.iniciativa.map(name => ({ name }));
      } else {
        characters = [];
      }
      renderList();
    } catch (err) {
      console.error('Error cargando datos de jugadores:', err);
      characters = [];
      renderList();
    }
  }

  // Limpiar listeners antes de agregar (evita duplicados)
  if (addCharBtn) {
    const newAddCharBtn = addCharBtn.cloneNode(true);
    addCharBtn.parentNode.replaceChild(newAddCharBtn, addCharBtn);
    newAddCharBtn.addEventListener('click', addCharHandler);
  }

  // Inicialización: cargar jugadores y renderizar
  loadPlayersData();
}

/////////
async function renderizarHechizos() {
  const spellList = document.getElementById('spell-list');
  const searchInput = document.getElementById('search-spell');
  const spellDetail = document.getElementById('spell-detail-container');
  let allSpells = [];

  async function cargarHechizos() {
    allSpells = Object.values(await ipcRenderer.invoke('leer-hechizos-json')).flat();
    renderSpellList();
  }

  // Renderizar la lista de hechizos
  function renderSpellList(filtro = '') {
    spellList.innerHTML = '';
    const listaFiltrada = allSpells.filter(spell =>
      spell.nombre.toLowerCase().includes(filtro.toLowerCase())
    );
    if (!listaFiltrada.length) {
      spellList.innerHTML = '<li style="color:#999;">No hay hechizos.</li>';
      spellDetail.innerHTML = '';
      return;
    }
    listaFiltrada.forEach(spell => {
      const li = document.createElement('li');
      li.className = 'spell-item';
      li.innerHTML = `
        <img src="${spell.icono}" style="width:28px;height:28px;margin-right:10px;vertical-align:middle;">
        <span>${spell.nombre}</span>
      `;
      li.onclick = () => renderSpellDetail(spell);
      spellList.appendChild(li);
    });
    // Selecciona el primero por default al buscar
    if (listaFiltrada.length) renderSpellDetail(listaFiltrada[0]);
  }

function renderSpellDetail(spell) {
  // Busca cada elemento por su ID
  const img = document.getElementById('spell-detail-img');
  const name = document.getElementById('spell-detail-name');
  const type = document.getElementById('spell-detail-type');
  const comps = document.getElementById('spell-detail-components');
  const time = document.getElementById('spell-detail-time');
  const range = document.getElementById('spell-detail-range');
  const duration = document.getElementById('spell-detail-duration');
  const action = document.getElementById('spell-detail-action');
  const save = document.getElementById('spell-detail-save');
  const attack = document.getElementById('spell-detail-attack');
  const desc = document.getElementById('spell-detail-desc');

  if (!img || !name || !type || !comps || !time || !range || !duration || !action || !save || !attack || !desc) {
    console.error('[renderSpellDetail] Faltan elementos en el HTML. Verifica los IDs.');
    return;
  }

  // Rellenar campos, usando dark colors en CSS, no aquí
  img.src = spell.icono || '';
  img.alt = spell.nombre || 'hechizo';
  name.textContent = spell.nombre || '';
  type.textContent = `Tipo: ${spell.tipo || '-'}`;
  comps.textContent = `Componentes: ${spell.componentes || '-'}`;
  time.textContent = `Tiempo: ${spell.tiempo || '-'}`;
  range.textContent = `Alcance: ${spell.alcance || '-'}`;
  duration.textContent = `Duración: ${spell.duracion || '-'}`;
  action.textContent = `Acción: ${spell.accion || '-'}`;
  save.textContent = `TS: ${spell.ts || '-'}`;
  attack.textContent = `Ataque: ${spell.ataque || '-'}`;
  desc.textContent = spell.descripcion || '-';
}

  // Evento búsqueda
  searchInput.addEventListener('input', e => {
    renderSpellList(e.target.value);
  });

  // Inicia todo
  await cargarHechizos();
}


