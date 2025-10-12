// map.js - Script para manejar el canvas del mapa en la vista del dashboard
const { ipcRenderer } = require('electron');

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById('mapa-canvas-display');
  const frame = document.getElementById('mapa-frame');
  if (!canvas || !frame) return;
  
  const ctx = canvas.getContext('2d');
  const imageCache = {}; // Caché para optimizar la carga de imágenes

  // --- Variables de estado globales ---
  let currentMapState = null; // Estado actual del mapa
  let creatureToken = null;   // Imagen especial de criatura

  // --- Configuración de tamaño base del canvas ---
  canvas.width = 1920;
  canvas.height = 1080;

  // === VARIABLES PARA ZOOM Y PANEO ===
  let scale = 1;             // Nivel actual de zoom
  let minScale = 0.3;        // Zoom mínimo
  let maxScale = 3;          // Zoom máximo
  let isPanning = false;
  let startX, startY, scrollLeft, scrollTop;

  // === ZOOM CON RUEDA DEL RATÓN ===
  frame.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const delta = e.deltaY < 0 ? 1 : -1;
    const newScale = Math.min(maxScale, Math.max(minScale, scale + delta * zoomIntensity));
    if (newScale === scale) return;

    // Mantiene el punto de zoom centrado en el cursor
    const rect = frame.getBoundingClientRect();
    const mouseX = e.clientX - rect.left + frame.scrollLeft;
    const mouseY = e.clientY - rect.top + frame.scrollTop;
    const zoomRatio = newScale / scale;

    frame.scrollLeft = (mouseX * zoomRatio) - (e.clientX - rect.left);
    frame.scrollTop = (mouseY * zoomRatio) - (e.clientY - rect.top);

    scale = newScale;
    canvas.style.transform = `scale(${scale})`;
  });

  // === PANEO (MOVER CON CLICK IZQUIERDO) ===
  frame.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isPanning = true;
    frame.style.cursor = 'grabbing';
    startX = e.pageX - frame.offsetLeft;
    startY = e.pageY - frame.offsetTop;
    scrollLeft = frame.scrollLeft;
    scrollTop = frame.scrollTop;
  });

  frame.addEventListener('mouseleave', () => {
    isPanning = false;
    frame.style.cursor = 'grab';
  });

  frame.addEventListener('mouseup', () => {
    isPanning = false;
    frame.style.cursor = 'grab';
  });

  frame.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    e.preventDefault();
    const x = e.pageX - frame.offsetLeft;
    const y = e.pageY - frame.offsetTop;
    const walkX = (x - startX);
    const walkY = (y - startY);
    frame.scrollLeft = scrollLeft - walkX;
    frame.scrollTop = scrollTop - walkY;
  });

  // === DIBUJADO UNIFICADO ===
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja fondo
    if (currentMapState && currentMapState.backgroundSrc) {
      const bg = imageCache['background'];
      if (bg && bg.complete) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    }

    // Dibuja tokens
    if (currentMapState && currentMapState.layers && currentMapState.layerOrder) {
      currentMapState.layerOrder.forEach(layerName => {
        if (currentMapState.layers[layerName]) {
          currentMapState.layers[layerName].forEach(tokenData => {
            const img = imageCache[tokenData.src];
            if (img && img.complete) {
              ctx.drawImage(img, tokenData.x, tokenData.y, tokenData.width, tokenData.height);
            }
          });
        }
      });
    }

    // Dibuja criatura
    if (creatureToken && creatureToken.complete) {
      const w = creatureToken.width;
      const h = creatureToken.height;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(creatureToken, x, y, w, h);
    }
  }

  // === ANIMACIÓN DE MARCADOR DE CLIC ===
  function showClickMarker(coords) {
    const startTime = performance.now();
    const duration = 1500;
    const baseVisibleDuration = 1000;
    const maxRadius = 80;
    const baseRadius = 10;

    function drawBackgroundAndTokens() {
      if (imageCache['background'] && imageCache['background'].complete)
        ctx.drawImage(imageCache['background'], 0, 0, canvas.width, canvas.height);

      if (currentMapState && currentMapState.layers && currentMapState.layerOrder) {
        currentMapState.layerOrder.forEach(layerName => {
          if (currentMapState.layers[layerName]) {
            currentMapState.layers[layerName].forEach(tokenData => {
              if (imageCache[tokenData.src] && imageCache[tokenData.src].complete) {
                ctx.drawImage(imageCache[tokenData.src], tokenData.x, tokenData.y, tokenData.width, tokenData.height);
              }
            });
          }
        });
      }

      if (creatureToken && creatureToken.complete) {
        const w = creatureToken.width;
        const h = creatureToken.height;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        ctx.drawImage(creatureToken, x, y, w, h);
      }
    }

    function animate(time) {
      const elapsed = time - startTime;
      if (elapsed > duration) {
        drawBackgroundAndTokens();
        return;
      }

      const progress = elapsed / duration;
      const radius = baseRadius + progress * (maxRadius - baseRadius);
      const opacity = 0.6 * (1 - progress);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackgroundAndTokens();

      ctx.beginPath();
      ctx.arc(coords.x, coords.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 0, 0, ${opacity.toFixed(2)})`;
      ctx.fill();

      if (elapsed < baseVisibleDuration) {
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // === IPC: CLIC DEL DM ===
  ipcRenderer.on('canvas-click', (event, coords) => {
    console.log('Clic recibido en mapa:', coords);

    // Centra el frame en el punto clicado (ajustado al zoom actual)
    const scaledX = coords.x * scale;
    const scaledY = coords.y * scale;
    frame.scrollLeft = scaledX - frame.clientWidth / 2;
    frame.scrollTop = scaledY - frame.clientHeight / 2;

    // Muestra marcador visual
    showClickMarker(coords);
  });

  // === IPC: RENDERIZAR MAPA ===
  ipcRenderer.on('render-map-state', (event, mapState) => {
    if (!mapState) return;
    currentMapState = mapState;

    const promises = [];

    // Fondo
    if (mapState.backgroundSrc && !imageCache['background']) {
      promises.push(new Promise(resolve => {
        const fondo = new Image();
        fondo.src = mapState.backgroundSrc;
        fondo.onload = () => { imageCache['background'] = fondo; resolve(); };
        fondo.onerror = resolve;
      }));
    }

    // Tokens
    if (mapState.layers && mapState.layerOrder) {
      mapState.layerOrder.forEach(layerName => {
        if (mapState.layers[layerName]) {
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

    Promise.all(promises).then(draw);
  });

  // === IPC: MOSTRAR IMAGEN DE CRIATURA ===
  ipcRenderer.on('display-creature-image', (event, imgSrc) => {
    const img = new Image();
    img.src = imgSrc;
    img.width = 200;
    img.height = 200;
    img.onload = () => {
      creatureToken = img;
      draw();
    };
  });

  // === IPC: OCULTAR IMAGEN DE CRIATURA ===
  ipcRenderer.on('clear-creature-image', () => {
    creatureToken = null;
    draw();
  });
});
