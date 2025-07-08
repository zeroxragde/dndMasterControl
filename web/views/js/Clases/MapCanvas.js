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
        this.tokens.push(token);
        this.draw();
      };
    }
  
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.backgroundImage) {
        this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
      }
      this.tokens.forEach(token => {
        this.ctx.drawImage(token.img, token.x, token.y, token.width, token.height);
      });
      if (this.selectedToken) {
        this.ctx.strokeStyle = '#00bcd4';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.selectedToken.x, this.selectedToken.y, this.selectedToken.width, this.selectedToken.height);
        this._drawResizeHandles(this.selectedToken);
      }
       // --- ¡LÍNEA CLAVE AÑADIDA! ---
        // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
        // Convertimos los tokens a un formato simple antes de enviarlos.
        const serializableTokens = this.tokens.map(token => ({
            src: token.img.src, // Solo enviamos la URL de la imagen
            x: token.x,
            y: token.y,
            width: token.width,
            height: token.height
        }));
    
        // Enviamos el estado con los datos simples.
        ipcRenderer.send('update-map-state', serializableTokens);
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
  
    _getMousePos(e) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        mouseX: e.clientX - rect.left,
        mouseY: e.clientY - rect.top
      };
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
      for (let i = this.tokens.length - 1; i >= 0; i--) {
        const token = this.tokens[i];
        if (mouseX > token.x && mouseX < token.x + token.width && mouseY > token.y && mouseY < token.y + token.height) {
          this.selectedToken = token;
          this.isDragging = true;
          this.dragOffsetX = mouseX - token.x;
          this.dragOffsetY = mouseY - token.y;
          this.tokens.splice(i, 1);
          this.tokens.push(token);
          break;
        }
      }
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
  }