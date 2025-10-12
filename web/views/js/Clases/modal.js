/**
 * Clase para gestionar un componente modal.
 */
class Modal {
  static instances = new Map();
  static listenerInitialized = false;

  constructor(config) {
    this.modalNode = document.getElementById(config.id);
    this.triggerButton = document.getElementById(config.triggerId);

    this.isMovable = config.movable || false;
    this.width = config.width || null;
    this.height = config.height || null;
    this.onOpen = config.onOpen || null;
    this.onLoad = config.onLoad || null;
    this.hasBackdrop = config.hasBackdrop ?? true; // 👈 nueva propiedad

    if (!this.modalNode) {
      console.log(`Error al inicializar el modal: Faltan elementos para id "${config.id}".`);
      return;
    }
    if (this.triggerButton) {
      this.triggerButton.addEventListener('click', () => this.open());
    }

    if (this.isMovable) {
      this._makeMovable('.modal-header');
    }

    // 👇 Crear backdrop (una sola vez)
    if (this.hasBackdrop) {
      this._createBackdrop();
    }

    Modal.instances.set(this.modalNode.id, this);
    Modal.setupGlobalCloseListener();
    this.onEndLoad();
  }

  onEndLoad() {
    if (typeof this.onLoad === 'function') {
      this.onLoad(this);
    }
  }

  open() {
    const container = this.modalNode.querySelector('.editor-container') || this.modalNode;
    const modal_div = this.modalNode.querySelector('.modal-panel') || this.modalNode;
    if (this.width) {
      container.style.width = '95%';
      modal_div.style.width = this.width;
    } else {
      container.style.width = '95%';
      modal_div.style.width = '60%';
    }
    if (this.height) {
      container.style.height = this.height;
    } else {
      container.style.height = '';
    }

    // Mostrar backdrop primero
    if (this.hasBackdrop && this.backdropNode) {
      this.backdropNode.style.display = 'block';
    }

    this.modalNode.style.display = 'flex';

    if (typeof this.onOpen === 'function') {
      this.onOpen();
    }
  }

  close() {
    this.modalNode.style.display = 'none';
    if (this.hasBackdrop && this.backdropNode) {
      this.backdropNode.style.display = 'none';
    }
  }

  setTitle(newTitle) {
    const titleElement = this.modalNode.querySelector('.modal-header h3, .modal-header h2, .modal-header .modal-title');
    if (titleElement) {
      titleElement.textContent = newTitle;
    } else {
      console.warn(`No se encontró un elemento de título en ${this.modalNode.id}`);
    }
  }

  _makeMovable(handleSelector) {
    const handle = this.modalNode.querySelector(handleSelector);
    if (!handle) return;
    let initialX, initialY, initialModalLeft, initialModalTop;
    const onMouseDown = (e) => {
      e.preventDefault();
      initialModalLeft = this.modalNode.offsetLeft;
      initialModalTop = this.modalNode.offsetTop;
      initialX = e.clientX;
      initialY = e.clientY;
      this.modalNode.style.position = 'absolute';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    const onMouseMove = (e) => {
      const dx = e.clientX - initialX;
      const dy = e.clientY - initialY;
      this.modalNode.style.left = `${initialModalLeft + dx}px`;
      this.modalNode.style.top = `${initialModalTop + dy}px`;
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    handle.addEventListener('mousedown', onMouseDown);
  }

  /**
   * Crea el fondo negro detrás del modal
   */
  _createBackdrop() {
    // Evita duplicados
    if (this.backdropNode) return;

    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop');
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100vw';
    backdrop.style.height = '100vh';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    backdrop.style.zIndex = '999';
    backdrop.style.display = 'none';

    // Cierra el modal al hacer clic en el fondo (opcional)
    backdrop.addEventListener('click', () => this.close());

    // Insertarlo antes del modal en el DOM
    this.modalNode.parentNode.insertBefore(backdrop, this.modalNode);
    this.backdropNode = backdrop;
  }

  static setupGlobalCloseListener() {
    if (this.listenerInitialized) return;

    document.body.addEventListener('click', (event) => {
      const closeButton = event.target.closest('.modal-close-btn, .editor-close-btn');
      if (closeButton) {
        const modalNode = event.target.closest('.modal-panel, .editor-modal');
        if (modalNode && Modal.instances.has(modalNode.id)) {
          Modal.instances.get(modalNode.id).close();
        }
      }
    });

    this.listenerInitialized = true;
  }
}
