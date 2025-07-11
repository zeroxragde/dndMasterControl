const { ipcRenderer } = require('electron');

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('mapa-canvas-display');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const imageCache = {}; // Caché para optimizar la carga de imágenes

    // --- Variables de estado globales para el canvas ---
    let currentMapState = null; // Guardará el estado del mapa (fondo, tokens, etc.)
    let creatureToken = null;   // Guardará la imagen especial de la criatura

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /**
     * Función de dibujado unificada.
     * Limpia el canvas y redibuja todo el estado actual: el mapa y la criatura.
     */
    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Dibuja el mapa base (fondo y tokens) si existe
        if (currentMapState) {
            // Dibuja el fondo
            if (imageCache['background'] && imageCache['background'].complete) {
                ctx.drawImage(imageCache['background'], 0, 0, canvas.width, canvas.height);
            }
            // Dibuja los tokens de las capas
            if (currentMapState.layers && currentMapState.layerOrder) {
                currentMapState.layerOrder.forEach(layerName => {
                    if(currentMapState.layers[layerName]) {
                        currentMapState.layers[layerName].forEach(tokenData => {
                            if (imageCache[tokenData.src] && imageCache[tokenData.src].complete) {
                                ctx.drawImage(imageCache[tokenData.src], tokenData.x, tokenData.y, tokenData.width, tokenData.height);
                            }
                        });
                    }
                });
            }
        }

        // 2. Dibuja la imagen de la criatura encima de todo, si existe
        if (creatureToken && creatureToken.complete) {
            // La centramos en el canvas. Ajusta el tamaño si es necesario.
            const w = creatureToken.width;
            const h = creatureToken.height;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            ctx.drawImage(creatureToken, x, y, w, h);
        }
    }

    // --- Listeners de IPC ---

    // Escucha el estado completo del mapa para dibujarlo.
    ipcRenderer.on('render-map-state', (event, mapState) => {
        if (!mapState) return;
        currentMapState = mapState; // Actualizamos el estado del mapa.
        
        const promises = [];

        // Precarga del fondo
        if (mapState.backgroundSrc && !imageCache['background']) {
            promises.push(new Promise(resolve => {
                const fondo = new Image();
                fondo.src = mapState.backgroundSrc;
                fondo.onload = () => { imageCache['background'] = fondo; resolve(); };
                fondo.onerror = resolve;
            }));
        }

        // Precarga de los tokens
        if (mapState.layers && mapState.layerOrder) {
            mapState.layerOrder.forEach(layerName => {
                if(mapState.layers[layerName]) {
                    mapState.layers[layerName].forEach(tokenData => {
                        if (tokenData.src && !imageCache[tokenData.src]) {
                            promises.push(new Promise(resolve => {
                                const img = new Image();
                                img.src = tokenData.src;
                                img.onload = () => { imageCache[tokenData.src] = img; resolve(); };
                                img.onerror = resolve;
                            }));
                        }
                    });
                }
            });
        }
        
        // Cuando todas las imágenes nuevas se hayan cargado, llamamos a la función de dibujado.
        Promise.all(promises).then(draw);
    });

    // Escucha la orden para MOSTRAR la imagen de la criatura.
    ipcRenderer.on('display-creature-image', (event, imgSrc) => {
        const img = new Image();
        img.src = imgSrc;
        img.width = 200; // Ajusta el tamaño según sea necesario
        img.height = 200; // Ajusta el tamaño según sea necesario
        img.onload = () => {
            creatureToken = img; // La guardamos en nuestra variable especial.
            draw(); // Redibujamos todo el canvas.
        };
    });

    // Escucha la orden para OCULTAR la imagen de la criatura.
    ipcRenderer.on('clear-creature-image', (event) => {
        creatureToken = null; // Simplemente borramos la referencia.
        draw(); // Redibujamos el canvas sin la imagen.
    });
});