/**
 * Clase que gestiona el canvas del mapa, permitiendo añadir,
 * mover y cambiar el tamaño de los tokens desde las cuatro esquinas.
 */
const { ipcRenderer } = require('electron');
class MapCanvas {
    constructor(canvasId) {

      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      
      this.ctx = this.canvas.getContext('2d');
      this.backgroundImage = null;
      
      this.tokens = [];
      this.selectedToken = null;
      // --- LÓGICA DE CAPAS ---
      this.layers = {
        'base': [] // Todas las capas se guardan aquí, empezando con 'base'
      };
      this.layerOrder = ['base']; // El orden en que se dibujan las capas
      this.activeLayer = 'base';  // La capa donde se añaden nuevos tokens

      this.layerVisibility = {};
      this.layerOrder.forEach(layerName => {
        this.layerVisibility[layerName] = true;
      });


      this.selectedToken = null;
      this.isDragging = false;

      // Variables de estado
      this.isDragging = false;
      this.isResizing = false;
      this.resizeHandle = null;
      this.handleSize = 8;
      
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
  
      this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
      this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
      this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
      this.canvas.addEventListener('mouseleave', this._onMouseUp.bind(this));
      this.canvas.addEventListener('contextmenu', this._onRightClick.bind(this));
      this.canvas.addEventListener('click', this._onCanvasClick.bind(this));
    }
  
    // --- MÉTODOS PÚBLICOS ---
    setSize(width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.draw();
    }
  
    setBackground(image) {
      this.backgroundImage = image;
      this.draw();
    }
  
    addToken(imageUrl, x, y) {
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        const token = {
          img: image,
          x: x - 50,
          y: y - 50,
          width: 100,
          height: 100
        };
        //this.tokens.push(token);
        this.layers[this.activeLayer].push(token);
        this.draw();
      };
    }
    /**
     * Añade una nueva capa al sistema.
     * @param {string} layerName - El nombre de la nueva capa.
     */
    addLayer(layerName) {
      if (!layerName || this.layers[layerName]) {
        console.warn(`La capa "${layerName}" ya existe o el nombre es inválido.`);
        return false;
      }
      this.layers[layerName] = []; // Crea el array vacío para la nueva capa
      this.layerOrder.push(layerName); // La añade al final del orden de dibujado
      console.log(`Capa añadida: ${layerName}`);
      this.layerVisibility[layerName] = true; 
      return true;
    }
    /**
     * Carga un estado de mapa completo desde un objeto y lo redibuja.
     * @param {Object} mapState - El objeto de estado del mapa cargado desde un JSON.
     */
    loadMapState(mapState) {
      if (!mapState) return;

      console.log("Cargando estado del mapa...", mapState);

      // 1. Carga el fondo
      if (mapState.backgroundSrc) {
          const fondo = new Image();
          fondo.src = mapState.backgroundSrc;
          fondo.onload = () => {
              this.backgroundImage = fondo;
              this.draw(); // Dibuja el fondo
          };
      } else {
          this.backgroundImage = null;
      }

      // 2. Carga las capas y los tokens
      this.layers = {};
      this.layerOrder = mapState.layerOrder || ['base'];
      this.activeLayer = this.layerOrder[0] || 'base'; 

      this.layerOrder.forEach(layerName => {
          this.layers[layerName] = [];
          if (mapState.layers[layerName]) {
              mapState.layers[layerName].forEach(tokenData => {
                  const img = new Image();
                  img.src = tokenData.src;
                  // Añadimos el token sin esperar a que cargue, ya que la URL es un Data URL
                  this.layers[layerName].push({
                      img: img,
                      x: tokenData.x,
                      y: tokenData.y,
                      width: tokenData.width,
                      height: tokenData.height
                  });
              });
          }
      });

      // 3. Redibuja todo el canvas y fuerza la actualización del mapa del jugador
      this.draw();
      this.canvas.dispatchEvent(new Event('layersUpdated'));
    }
    /**
     * Recopila el estado actual del mapa y lo devuelve en un formato simple (JSON).
     */
    getMapState() {
      const serializableLayers = {};
      this.layerOrder.forEach(layerName => {
          serializableLayers[layerName] = this.layers[layerName].map(token => ({
              src: token.img.src,
              x: token.x,
              y: token.y,
              width: token.width,
              height: token.height
          }));
      });

      return {
          backgroundSrc: this.backgroundImage ? this.backgroundImage.src : null,
          layers: serializableLayers,
          layerOrder: this.layerOrder,
          width: this.canvas.width,
          height: this.canvas.height
      };
    }
    _onCanvasClick(event) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      // Envía la posición al proceso principal
      ipcRenderer.send('canvas-click', { x, y });
    }

    /**
     * Limpia por completo el mapa, eliminando todos los tokens y capas,
     * y dejando únicamente la capa "base" vacía.
    */
    clearMap() {
      console.log("Limpiando el mapa...");
      
      // Resetea las capas al estado inicial
      this.layers = {
        'base': []
      };
      this.layerOrder = ['base'];
      this.activeLayer = 'base';
      this.selectedToken = null;
      
      // Vuelve a dibujar el canvas, que ahora estará vacío (solo con el fondo)
      // Esto también enviará la actualización al mapa del jugador.
      this.draw();
    }
    /**
     * Establece cuál es la capa activa para añadir nuevos tokens.
     * @param {string} layerName - El nombre de la capa a activar.
     */
    setActiveLayer(layerName) {
      if (this.layers[layerName]) {
        this.activeLayer = layerName;
        console.log(`Capa activa cambiada a: ${this.activeLayer}`);
      }
    }

    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.backgroundImage) {
        this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
      }
      // Dibuja los tokens de cada capa en orden
      this.layerOrder.forEach(layerName => {
        if (!this.layerVisibility[layerName]) return;
        this.layers[layerName].forEach(token => {
          this.ctx.drawImage(token.img, token.x, token.y, token.width, token.height);
        });
      });
      if (this.selectedToken) {
        this.ctx.strokeStyle = '#00bcd4';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.selectedToken.x, this.selectedToken.y, this.selectedToken.width, this.selectedToken.height);
        this._drawResizeHandles(this.selectedToken);
      }
      // Convertimos los tokens a un formato simple antes de enviarlos.

        // Dibuja los tokens de cada capa en orden
        const serializableLayers = {};
        this.layerOrder.forEach(layerName => {
          serializableLayers[layerName] = []; // Prepara la capa en el objeto a enviar

          this.layers[layerName].forEach(token => {
             if (!this.layerVisibility[layerName]) return;
            // Dibuja en el canvas local
            this.ctx.drawImage(token.img, token.x, token.y, token.width, token.height);
            
            // Añade la versión simple del token para enviar
            serializableLayers[layerName].push({
              src: token.img.src,
              x: token.x,
              y: token.y,
              width: token.width,
              height: token.height
            });
          });
        });
        
    }
    updateMap(){
      console.log("Forzando actualización del mapa del jugador...");
    
      // 1. Prepara los datos para ser enviados
      const serializableState = {
        backgroundSrc: this.backgroundImage ? this.backgroundImage.src : null,
        layers: {},
        layerOrder: this.layerOrder
      };
  
      this.layerOrder.forEach(layerName => {
        if (!this.layerVisibility[layerName]) return;
        serializableState.layers[layerName] = this.layers[layerName].map(token => ({
          src: token.img.src,
          x: token.x,
          y: token.y,
          width: token.width,
          height: token.height
        }));
      });
  
      // 2. Envía el objeto de estado completo al proceso principal
      ipcRenderer.send('update-map-state', serializableState);
    
  
  }
    
  
    // --- MÉTODOS PRIVADOS ---
    _drawResizeHandles(token) {
      this.ctx.fillStyle = '#00bcd4';
      const s = this.handleSize;
      const { x, y, width, height } = token;
      this.ctx.fillRect(x - s / 2, y - s / 2, s, s);
      this.ctx.fillRect(x + width - s / 2, y - s / 2, s, s);
      this.ctx.fillRect(x + width - s / 2, y + height - s / 2, s, s);
      this.ctx.fillRect(x - s / 2, y + height - s / 2, s, s);
    }
  


  /**
   * (Privado) Calcula la posición del ratón dentro del canvas.
   *
   * --- CAMBIOS ---
   * 1. Se calcula un factor de escala (scaleX, scaleY) que compara
   * la resolución real del canvas (ej: 1920px) con su tamaño en la pantalla.
   * 2. La posición del ratón ahora se multiplica por ese factor de escala.
   *
   * --- ¿POR QUÉ? ---
   * Esto "traduce" las coordenadas del clic en la página a las coordenadas
   * exactas dentro del dibujo del canvas, asegurando que el ratón y los
   * manejadores de tamaño siempre estén perfectamente alineados.
   */
  _getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    return {
      mouseX: (e.clientX - rect.left) * scaleX,
      mouseY: (e.clientY - rect.top) * scaleY
    };
  }

  // --- ¡NUEVO MÉTODO PARA MANEJAR EL CLIC DERECHO! ---
  _onRightClick(e) {
    e.preventDefault(); // Evita que aparezca el menú contextual del navegador
    const { mouseX, mouseY } = this._getMousePos(e);

    // Iteramos sobre las capas para encontrar el token sobre el que se hizo clic
    for (const layerName of [...this.layerOrder].reverse()) {
      const layerTokens = this.layers[layerName];
      
      for (let i = layerTokens.length - 1; i >= 0; i--) {
        const token = layerTokens[i];
        if (mouseX > token.x && mouseX < token.x + token.width && mouseY > token.y && mouseY < token.y + token.height) {
          
          // Encontramos un token, pedimos confirmación para borrar
          if (confirm(`¿Seguro que quieres eliminar este token?`)) {
            layerTokens.splice(i, 1); // Lo eliminamos del array de su capa
            this.selectedToken = null; // Deseleccionamos por si era el token activo
            this.draw(); // Redibujamos el canvas para que desaparezca
          }
          return; // Salimos del bucle
        }
      }
    }
  }

    _getHandleAt(mouseX, mouseY, token) {
      const s = this.handleSize * 2; // Hacemos el área de clic un poco más grande
      const { x, y, width, height } = token;
      if (mouseX > x - s && mouseX < x + s && mouseY > y - s && mouseY < y + s) return 'top-left';
      if (mouseX > x + width - s && mouseX < x + width + s && mouseY > y - s && mouseY < y + s) return 'top-right';
      if (mouseX > x + width - s && mouseX < x + width + s && mouseY > y + height - s && mouseY < y + height + s) return 'bottom-right';
      if (mouseX > x - s && mouseX < x + s && mouseY > y + height - s && mouseY < y + height + s) return 'bottom-left';
      return null;
    }
  
    _onMouseDown(e) {
      const { mouseX, mouseY } = this._getMousePos(e);
      if (this.selectedToken) {
        this.resizeHandle = this._getHandleAt(mouseX, mouseY, this.selectedToken);
        if (this.resizeHandle) {
          this.isResizing = true;
          this.isDragging = false;
          return;
        }
      }
      this.selectedToken = null;

      // 2. Buscamos tokens para seleccionar **únicamente en la capa activa**.
      const activeLayerTokens = this.layers[this.activeLayer] || [];
          
      // Iteramos sobre los tokens de esa capa en orden inverso para seleccionar el de más arriba
      for (let i = activeLayerTokens.length - 1; i >= 0; i--) {
        const token = activeLayerTokens[i];
        if (mouseX > token.x && mouseX < token.x + token.width && mouseY > token.y && mouseY < token.y + token.height) {
          this.selectedToken = token;
          this.isDragging = true;
          this.dragOffsetX = mouseX - token.x;
          this.dragOffsetY = mouseY - token.y;
          
          // Movemos el token al final de su PROPIA capa para que se dibuje encima
          activeLayerTokens.splice(i, 1);
          activeLayerTokens.push(token);
          
          this.draw();
          return; // Salimos en cuanto encontramos el primer token
        }
      }

       // Iteramos sobre las capas en orden inverso (de la más alta a la más baja)
      this.draw();
    }
  
    _onMouseMove(e) {
      const { mouseX, mouseY } = this._getMousePos(e);
      if (this.isResizing && this.selectedToken) {
        const token = this.selectedToken;
        const originalX = token.x;
        const originalY = token.y;
        const originalWidth = token.width;
        const originalHeight = token.height;
        const minSize = this.handleSize * 2;
  
        // --- LÓGICA DE REDIMENSIONADO CORREGIDA Y COMPLETA ---
        if (this.resizeHandle === 'bottom-right') {
          token.width = Math.max(minSize, mouseX - originalX);
          token.height = Math.max(minSize, mouseY - originalY);
        } else if (this.resizeHandle === 'bottom-left') {
          token.width = Math.max(minSize, originalX + originalWidth - mouseX);
          token.x = mouseX;
          token.height = Math.max(minSize, mouseY - originalY);
        } else if (this.resizeHandle === 'top-right') {
          token.width = Math.max(minSize, mouseX - originalX);
          token.height = Math.max(minSize, originalY + originalHeight - mouseY);
          token.y = mouseY;
        } else if (this.resizeHandle === 'top-left') {
          token.width = Math.max(minSize, originalX + originalWidth - mouseX);
          token.height = Math.max(minSize, originalY + originalHeight - mouseY);
          token.x = mouseX;
          token.y = mouseY;
        }
      } else if (this.isDragging && this.selectedToken) {
        this.selectedToken.x = mouseX - this.dragOffsetX;
        this.selectedToken.y = mouseY - this.dragOffsetY;
      } else {
        let handleFound = null;
        if (this.selectedToken) {
          handleFound = this._getHandleAt(mouseX, mouseY, this.selectedToken);
        }
        if (handleFound === 'top-left' || handleFound === 'bottom-right') {
          this.canvas.style.cursor = 'nwse-resize';
        } else if (handleFound === 'top-right' || handleFound === 'bottom-left') {
          this.canvas.style.cursor = 'nesw-resize';
        } else {
          this.canvas.style.cursor = 'default';
        }
      }
      this.draw();
    }
  
    _onMouseUp(e) {
      this.isDragging = false;
      this.isResizing = false;
      this.resizeHandle = null;
      this.draw();
    }
    /**
     * Alterna la visibilidad de la capa activa y redibuja.
     */
    toggleActiveLayer() {
      const layer = this.activeLayer;
      this.layerVisibility[layer] = !this.layerVisibility[layer];
      this.draw();
    }

    /**
     * (Opcional) Cambia la capa activa.
     */
    setActiveLayer(layerName) {
      if (this.layers[layerName]) {
        this.activeLayer = layerName;
      }
    }
  }