const audio = document.getElementById('audioPlayer');
const nombre = document.getElementById('nombreCancion');
let canciones = [];
let indice = 0;

document.addEventListener("DOMContentLoaded", () => {
  inicializarUI();
});

function inicializarUI() {
  // Botones de modales
  registrarToggle('btnLista', 
    'listaPanel');
  registrarToggle('abrirSubida', 'modalSubida', true);
  registrarToggle('cerrarSubida', 'modalSubida', false);

  // Drag modal
  hacerModalMovible('listaPanel', '.modal-header');
  hacerModalMovible('modalSubida', '.modal-header');

  // Eventos audio
  audio.addEventListener('ended', siguienteCancion);
}

function registrarToggle(botonId, modalId, mostrar = null) {
  const boton = document.getElementById(botonId);
  if (boton) {
    boton.addEventListener('click', () => {
      toggleModal(modalId, mostrar);
    });
  }
}

function toggleModal(id, mostrar = null) {
  const el = document.getElementById(id);
  if (!el) return;

  const visible = el.style.display === 'block' || el.style.display === 'flex';
  const nuevoEstado = mostrar !== null ? mostrar : !visible;
  el.style.display = nuevoEstado ? 'flex' : 'none';
}

function hacerModalMovible(modalId, headerSelector = '.modal-header') {
  const modal = document.getElementById(modalId);
  const header = modal.querySelector(headerSelector);
  if (!modal || !header) return;

  let offsetX = 0, offsetY = 0, isDragging = false;

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = modal.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    modal.style.position = "absolute";
    modal.style.zIndex = 999;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      modal.style.left = `${e.clientX - offsetX}px`;
      modal.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

function filtrarCanciones() {
  const input = document.getElementById('buscadorCanciones');
  const filtro = input.value.toLowerCase();
  const items = document.querySelectorAll('#listaCanciones li');

  items.forEach(item => {
    const texto = item.textContent || item.innerText;
    item.style.display = texto.toLowerCase().includes(filtro) ? '' : 'none';
  });
}

function mostrarTab(id, event) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

// 🎵 Reproductor
function cargarCancion() {
  if (!canciones.length) return;
  audio.src = canciones[indice];
  nombre.textContent = `🎵 ${canciones[indice].split(/[/\\\\]/).pop()}`;
}

function anteriorCancion() {
  if (!canciones.length) return;
  indice = (indice - 1 + canciones.length) % canciones.length;
  cargarCancion();
  audio.play();
}

function siguienteCancion() {
  if (!canciones.length) return;
  indice = (indice + 1) % canciones.length;
  cargarCancion();
  audio.play();
}

function togglePlay() {
  if (!audio.src) return;
  audio.paused ? audio.play() : audio.pause();
}

function ajustarVolumen(valor) {
  audio.volume = parseFloat(valor);
}
