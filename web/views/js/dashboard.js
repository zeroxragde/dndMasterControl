

  const audio = document.getElementById('audioPlayer');
  const nombre = document.getElementById('nombreCancion');
  let canciones = [];
  let indice = 0;

document.addEventListener("DOMContentLoaded", () => {



  document.getElementById('btnLista').addEventListener('click', () => {
    const panel = document.getElementById('listaPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  });

  audio.addEventListener('ended', siguienteCancion);
});

function filtrarCanciones() {
  const input = document.getElementById('buscadorCanciones');
  const filtro = input.value.toLowerCase();
  const lista = document.getElementById('listaCanciones');
  const items = lista.getElementsByTagName('li');

  for (let i = 0; i < items.length; i++) {
    const texto = items[i].textContent || items[i].innerText;
    items[i].style.display = texto.toLowerCase().includes(filtro) ? '' : 'none';
  }
}
function mostrarTab(id, event) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
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


