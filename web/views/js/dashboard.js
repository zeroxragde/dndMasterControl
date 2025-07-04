// --- Variables específicas para el Dashboard ---
const audio = document.getElementById('audioPlayer');
const nombreCancion = document.getElementById('nombreCancion');
let canciones = [];
let indiceCancion = 0;

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
document.addEventListener("DOMContentLoaded", () => {
  inicializarUI();
});

// --- Función de Inicialización del Dashboard ---
function inicializarUI() {

  inicializarComponentes();
  // 2. Renderiza la lista de criaturas
  const tbodyCriaturas = document.getElementById('listaCriaturasBody');
  if (tbodyCriaturas) {
    renderizarCriaturas(criaturasData, tbodyCriaturas);
  }
}

/*function inicializarTodosLosModales() {
  // Lista de configuraciones para todos los modales de la app
  const configs = [
    { id: 'listaPanel', triggerId: 'btnLista', movable: true },
    { id: 'modalSubida', triggerId: 'abrirSubida', movable: true },
    { id: 'modalEditor', triggerId: 'btnOpenEditor',  movable: true , width: '1000px'}
  ];

  // Instanciamos cada modal
  configs.forEach(config => new Modal(config));

  // Listener de Cierre Global (la solución definitiva)
  document.body.addEventListener('click', function(event) {
    const closeButton = event.target.closest('.modal-close-btn, .editor-close-btn');
    if (closeButton) {
      const modalToClose = event.target.closest('.modal-panel, .editor-modal');
      if (modalToClose) {
        modalToClose.style.display = 'none';
      }
    }
  });
}*/

/**
 * Crea las instancias de las clases Modal y Tabs para la página.
 */
function inicializarComponentes() {
  // Configuración para todos los modales.

  const modalConfigs = [
    { id: 'listaPanel', triggerId: 'btnLista', closeClassName: 'modal-close-btn', movable: true },
    { id: 'modalSubida', triggerId: 'abrirSubida', closeClassName: 'modal-close-btn', movable: true },
    { id: 'modalEditor', triggerId: 'btnOpenEditor', closeClassName: 'editor-close-btn', movable: true, width: '1500px' }
  ];
  modalConfigs.forEach(config => new Modal(config));

  // Configuración para todos los sistemas de pestañas.
  const tabConfigs = ['creature-editor-container'];
  tabConfigs.forEach(id => new Tabs(id));
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