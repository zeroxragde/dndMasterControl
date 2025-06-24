const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

ipcRenderer.on('monitores-disponibles', (event, monitores) => {
  const lista = document.getElementById('monitorList');
  monitores.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.text = `Monitor ${i + 1} (${m.bounds.width}x${m.bounds.height})`;
    lista.appendChild(opt);
  });
});

ipcRenderer.on('config-existente', (event, config) => {
  document.getElementById('dmName').value = config.dm || '';
  const lista = document.getElementById('monitorList');
  if (config.monitor !== undefined && lista.options.length > config.monitor) {
    lista.selectedIndex = config.monitor;
  }
});

function enviarDatos() {
  const nombre = document.getElementById('dmName').value.trim();
  const monitor = parseInt(document.getElementById('monitorList').value);
  if (!nombre) {
    alert("Pon tu nombre, master");
    return;
  }
  ipcRenderer.send('configuracion-inicial', { dm: nombre, monitor });
  window.close();
}