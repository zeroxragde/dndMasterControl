const { ipcRenderer } = require('electron');

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('mapa-canvas-display');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const imageCache = {}; // Usamos un caché para optimizar la carga de imágenes

    // Le damos tamaño al canvas cuando recibimos la resolución
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Escucha el estado completo del mapa y lo redibuja
    ipcRenderer.on('render-map-state', (event, mapState) => {
        if (!mapState) return;
        
        // Función para dibujar todo una vez que las imágenes estén listas
        const drawAll = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Dibuja el fondo
            if (imageCache['background'] && imageCache['background'].complete) {
                ctx.drawImage(imageCache['background'], 0, 0, canvas.width, canvas.height);
            }

            // 2. Dibuja los tokens de cada capa en orden
            if (mapState.layers && mapState.layerOrder) {
                mapState.layerOrder.forEach(layerName => {
                    mapState.layers[layerName].forEach(tokenData => {
                        if (imageCache[tokenData.src] && imageCache[tokenData.src].complete) {
                            ctx.drawImage(imageCache[tokenData.src], tokenData.x, tokenData.y, tokenData.width, tokenData.height);
                        }
                    });
                });
            }
        };

        // --- LÓGICA DE PRECARGA DE IMÁGENES ---
        const promises = []; // Un array para todas las promesas de carga

        // Precarga del fondo
        if (mapState.backgroundSrc) {
            promises.push(new Promise(resolve => {
                const fondo = new Image();
                fondo.src = mapState.backgroundSrc;
                fondo.onload = () => {
                    imageCache['background'] = fondo;
                    resolve();
                };
                fondo.onerror = resolve; // Si falla, continuamos sin fondo
            }));
        }

        // Precarga de los tokens
        if (mapState.layers && mapState.layerOrder) {
            mapState.layerOrder.forEach(layerName => {
                mapState.layers[layerName].forEach(tokenData => {
                    if (tokenData.src && !imageCache[tokenData.src]) {
                        promises.push(new Promise(resolve => {
                            const img = new Image();
                            img.src = tokenData.src;
                            img.onload = () => {
                                imageCache[tokenData.src] = img;
                                resolve();
                            };
                            img.onerror = resolve; // Si una imagen falla, no detenemos todo
                        }));
                    }
                });
            });
        }
        
        // Cuando TODAS las imágenes se hayan cargado, dibujamos todo de una vez.
        Promise.all(promises).then(drawAll);
    });
});