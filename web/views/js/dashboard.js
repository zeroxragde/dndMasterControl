const { dialog } = require('electron').remote;
const audio = document.getElementById('audioPlayer');
const nombre = document.getElementById('nombreCancion');
let canciones = [];
let indice = 0;
document.getElementById('btnLista').addEventListener('click', () => {
  const panel = document.getElementById('listaPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

function mostrarTab(id, event) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

function abrirLista() {
  dialog.showOpenDialog({
    title: 'Selecciona canciones',
    filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg'] }],
    properties: ['openFile', 'multiSelections']
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      canciones = result.filePaths;
      indice = 0;
      cargarCancion();
      audio.play();
    }
  });
}

function cargarCancion() {
  if (canciones.length === 0) return;
  audio.src = canciones[indice];
  nombre.textContent = `🎵 ${canciones[indice].split(/[/\\\\]/).pop()}`;
}

function anteriorCancion() {
  if (canciones.length === 0) return;
  indice = (indice - 1 + canciones.length) % canciones.length;
  cargarCancion();
  audio.play();
}

function siguienteCancion() {
  if (canciones.length === 0) return;
  indice = (indice + 1) % canciones.length;
  cargarCancion();
  audio.play();
}

function togglePlay() {
  if (!audio.src) return;
  if (audio.paused) audio.play();
  else audio.pause();
}

function ajustarVolumen(valor) {
  audio.volume = parseFloat(valor);
}

audio.addEventListener('ended', siguienteCancion);
