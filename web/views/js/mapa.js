// En tu nuevo archivo js/mapa.js

const { ipcRenderer } = require('electron');

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('mapa-canvas-display');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let backgroundImage = null;

    // Escuchamos la resolución inicial para darle tamaño al canvas
    ipcRenderer.on('mapa-resolucion', (event, resolucion) => {
        canvas.width = resolucion.width;
        canvas.height = resolucion.height;

        // Cargamos la misma imagen de fondo que en el editor
        const fondo = new Image();
        fondo.src = '../../assets/img/fondoStab.png';
        fondo.onload = () => {
            backgroundImage = fondo;
            // Dibujamos el fondo inicial
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        };
    });

    // Escuchamos las actualizaciones del estado del mapa
    ipcRenderer.on('render-map-state', (event, tokens) => {
        // Limpiamos el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Redibujamos el fondo
        if (backgroundImage) {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        }

        // 2. Dibujamos cada token recibido





// Dentro de tu archivo mapa.js

// Escuchamos las actualizaciones del estado del mapa
ipcRenderer.on('render-map-state', (event, tokens) => {
    // Limpiamos el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Redibujamos el fondo
    if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // 2. Dibujamos cada token recibido
    if (tokens && tokens.length > 0) {
    tokens.forEach(tokenData => {
    // Comprobamos que el token tenga una URL válida
    if (tokenData && tokenData.src) {
        const tempImage = new Image();
        tempImage.src = tokenData.src; // Usamos la URL recibida
        
        // Dibujamos la imagen cuando esté lista
        tempImage.onload = () => {
            ctx.drawImage(tempImage, tokenData.x, tokenData.y, tokenData.width, tokenData.height);
        }
    }
});
    }
    });





    });
});