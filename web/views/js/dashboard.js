
// --- Variables específicas para el Dashboard ---
// Al principio de tu archivo dashboard.js
import { Creatura } from './Clases/Modelos/creatura.js';

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
 /* if (tbodyCriaturas) {
    renderizarCriaturas(criaturasData, tbodyCriaturas);
  }*/
  poblarDropdownsEditor();
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
    { id: 'listaPanel', triggerId: 'btnLista', closeClassName: 'modal-close-btn', movable: true,width: '20%', },
    { id: 'modalSubida', triggerId: 'abrirSubida', closeClassName: 'modal-close-btn', movable: true,width: '40%',height: '300px' },
    {
       id: 'modalEditor', 
      triggerId: 'btnOpenEditor', 
      closeClassName: 'editor-close-btn',
      movable: true, 
      width: '100%',
      height: '760px',
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