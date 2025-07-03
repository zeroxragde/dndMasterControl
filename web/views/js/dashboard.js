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
inicializarTodosLosModales();

/*
  // 1. Inicializa los modales (usando funciones de base.js)
  registrarToggle('btnLista','listaPanel');
  registrarToggle('abrirSubida', 'modalSubida', true);
  registrarToggle('cerrarSubida', 'modalSubida', false);

  registrarToggle('btnOpenEditor', 'modalEditor', true);
 // registrarToggle('btnCloseEditor', 'modalEditor', false);
  hacerModalMovible('modalEditor', '.modal-header');

  hacerModalMovible('listaPanel', '.modal-header');
  hacerModalMovible('modalSubida', '.modal-header');
*/
  // 2. Renderiza la lista de criaturas
  const tbodyCriaturas = document.getElementById('listaCriaturasBody');
  if (tbodyCriaturas) {
    renderizarCriaturas(criaturasData, tbodyCriaturas);
  }
}
/**
 * Función que inicializa todos los modales de la página.
 * Se asegura de que los listeners se configuren una sola vez.
 */
function inicializarTodosLosModales() {
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