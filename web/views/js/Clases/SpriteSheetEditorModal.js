class SpriteSheetEditorModal extends Modal {
  constructor(modalConfig) {
    if (typeof modalConfig === 'string') {
      modalConfig = { id: modalConfig, movable: true };
    }

    super(modalConfig);

    this.gridColor = modalConfig.gridColor || 'white';
    this.padding = modalConfig.padding || '15px';
    this.onOpenEditor = modalConfig.onOpenEditor || (() => {});
    this.onCloseEditor = modalConfig.onCloseEditor || (() => {});

    this.modalNode.style.padding = this.padding;
    this.categoria = null;

    this.fileInput = this.modalNode.querySelector('#spritesheet-file-input');
    this.previewDiv = this.modalNode.querySelector('#spritesheet-preview');
    this.spriteWidthInput = this.modalNode.querySelector('#sprite-width');
    this.spriteHeightInput = this.modalNode.querySelector('#sprite-height');
    this.processBtn = this.modalNode.querySelector('#btn-process-sprite');

    this.captureViewer = this.modalNode.querySelector('#sprite-capture-viewer');
    if (!this.captureViewer) {
      this.captureViewer = document.createElement('div');
      this.captureViewer.id = 'sprite-capture-viewer';
      this.captureViewer.style.marginTop = '10px';
      this.modalNode.querySelector('.modal-content').appendChild(this.captureViewer);
    }

    this.colorPicker = this.modalNode.querySelector('#grid-color-picker');
    if (!this.colorPicker) {
      this.colorPicker = document.createElement('input');
      this.colorPicker.type = 'color';
      this.colorPicker.id = 'grid-color-picker';
      this.colorPicker.value = this.rgbToHex(this.gridColor);
      this.colorPicker.style.margin = '10px 0';
      this.modalNode.querySelector('.modal-content').insertBefore(this.colorPicker, this.previewDiv);
    }

    this.colorPicker.addEventListener('input', (e) => {
      this.gridColor = e.target.value;
      this.drawGrid();
    });

    this.fileInput.addEventListener('change', this.onFileChange.bind(this));
    this.spriteWidthInput.addEventListener('input', this.drawGrid.bind(this));
    this.spriteHeightInput.addEventListener('input', this.drawGrid.bind(this));
    this.processBtn.addEventListener('click', this.onProcess.bind(this));

    this.modalNode.querySelector('.modal-close-btn').addEventListener('click', () => {
      this.close();
      this.clearPreview();
    });

    this.img = new Image();
    this.canvasImage = null;
    this.ctxImage = null;
    this.canvasGrid = null;
    this.ctxGrid = null;
    this.selectedSprite = null;
    this.nombreBase = null;
    this.categoriaSeleccionada = null;

    ipcRenderer.on('guardar-sprite-respuesta', (event, response) => {
      if (response.success) {
        alert(`Sprite guardado: ${response.registro.nombre}`);
        this.close();
        this.clearPreview();

        if (typeof window.actualizarListaAssets === 'function') {
          window.actualizarListaAssets();
        }
      } else {
        alert(`Error al guardar sprite: ${response.error}`);
      }
    });
  }
  setCategoria(categoria) {
    this.categoria = categoria;    
  }
  close() {
    if (typeof this.onCloseEditor === 'function') {
      this.onCloseEditor(this);
    }  
    super.close();  
  }

  open(){
    if (typeof this.onOpenEditor === 'function') {
      this.onOpenEditor(this);
    }
    super.open();
  }



  rgbToHex(color) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = color;
    return ctx.fillStyle;
  }

  onFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    this.nombreBase = file.name.replace(/\.[^/.]+$/, "");

    const url = URL.createObjectURL(file);
    this.img = new Image();

    this.img.onload = () => {
      this.createCanvas(this.img.width, this.img.height);
      this.drawGrid();
    };

    this.img.src = url;
  }

  createCanvas(width, height) {
    this.previewDiv.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = width + 'px';
    wrapper.style.height = height + 'px';
    wrapper.style.maxWidth = '100%';
    wrapper.style.maxHeight = '400px';
    wrapper.style.overflow = 'auto';
    wrapper.style.border = '1px solid #ccc';

    this.canvasImage = document.createElement('canvas');
    this.canvasImage.width = width;
    this.canvasImage.height = height;
    this.canvasImage.style.position = 'absolute';
    this.canvasImage.style.top = '0';
    this.canvasImage.style.left = '0';
    this.canvasImage.style.zIndex = '0';

    this.canvasGrid = document.createElement('canvas');
    this.canvasGrid.width = width;
    this.canvasGrid.height = height;
    this.canvasGrid.style.position = 'absolute';
    this.canvasGrid.style.top = '0';
    this.canvasGrid.style.left = '0';
    this.canvasGrid.style.zIndex = '1';
    this.canvasGrid.style.pointerEvents = 'none';

    wrapper.appendChild(this.canvasImage);
    wrapper.appendChild(this.canvasGrid);
    this.previewDiv.appendChild(wrapper);

    this.ctxImage = this.canvasImage.getContext('2d');
    this.ctxGrid = this.canvasGrid.getContext('2d');

    this.canvasImage.addEventListener('click', this.onCanvasClick.bind(this));
  }

  drawGrid() {
    if (!this.img.complete || !this.ctxGrid || !this.ctxImage) return;

    this.ctxImage.clearRect(0, 0, this.canvasImage.width, this.canvasImage.height);
    this.ctxImage.drawImage(this.img, 0, 0);

    this.ctxGrid.clearRect(0, 0, this.canvasGrid.width, this.canvasGrid.height);

    const sw = parseInt(this.spriteWidthInput.value);
    const sh = parseInt(this.spriteHeightInput.value);

    this.ctxGrid.strokeStyle = this.gridColor;

    for (let x = 0; x <= this.canvasGrid.width; x += sw) {
      this.ctxGrid.beginPath();
      this.ctxGrid.moveTo(x, 0);
      this.ctxGrid.lineTo(x, this.canvasGrid.height);
      this.ctxGrid.stroke();
    }
    for (let y = 0; y <= this.canvasGrid.height; y += sh) {
      this.ctxGrid.beginPath();
      this.ctxGrid.moveTo(0, y);
      this.ctxGrid.lineTo(this.canvasGrid.width, y);
      this.ctxGrid.stroke();
    }
  }

  onCanvasClick(e) {
    const rect = this.canvasImage.getBoundingClientRect();
    const sw = parseInt(this.spriteWidthInput.value);
    const sh = parseInt(this.spriteHeightInput.value);

    const x = Math.floor((e.clientX - rect.left) / sw) * sw;
    const y = Math.floor((e.clientY - rect.top) / sh) * sh;

    const cutCanvas = document.createElement('canvas');
    cutCanvas.width = sw;
    cutCanvas.height = sh;
    const cutCtx = cutCanvas.getContext('2d');

    cutCtx.fillStyle = 'black';
    cutCtx.fillRect(0, 0, sw, sh);

    cutCtx.drawImage(this.canvasImage, x, y, sw, sh, 0, 0, sw, sh);

    const pngDataUrl = cutCanvas.toDataURL('image/png');

    this.selectedSprite = pngDataUrl;

    this.captureViewer.innerHTML = '';
    const imgElement = document.createElement('img');
    imgElement.src = pngDataUrl;
    imgElement.style.imageRendering = 'pixelated';
    imgElement.style.width = `${sw}px`;
    imgElement.style.height = `${sh}px`;
    this.captureViewer.appendChild(imgElement);

    console.log('Sprite recortado:', pngDataUrl);
  }

  onProcess() {
    if (!this.selectedSprite) {
      alert('No has seleccionado ningún sprite.');
      return;
    }

    if (!this.nombreBase) {
      alert('No se ha cargado ninguna imagen para obtener el nombre base.');
      return;
    }

    ipcRenderer.send('guardar-sprite', {
      imagen: this.selectedSprite,
      nombreBase: this.nombreBase,
      categoria: this.categoria
    });
  }

  clearPreview() {
    this.previewDiv.innerHTML = '';
    this.canvasImage = null;
    this.ctxImage = null;
    this.canvasGrid = null;
    this.ctxGrid = null;
    this.img = new Image();
    this.fileInput.value = '';
    if (this.captureViewer) this.captureViewer.innerHTML = '';
    this.selectedSprite = null;
    this.nombreBase = null;
    this.categoriaSeleccionada = null;
  }
}
