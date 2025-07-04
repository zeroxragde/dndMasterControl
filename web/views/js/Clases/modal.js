/**
 * Clase para gestionar un componente modal.
 * Encapsula la lógica para abrir, cerrar, mover y dimensionar un modal,
 * y gestiona un listener de cierre global de forma automática.
 */
class Modal {
  // Propiedades estáticas para gestionar todas las instancias y el listener global.
  static #instances = new Map();
  static #listenerInitialized = false;

  constructor(config) {
    this.modalNode = document.getElementById(config.id);
    this.triggerButton = document.getElementById(config.triggerId);
    
    this.isMovable = config.movable || false;
    this.width = config.width || null;

    if (!this.modalNode || !this.triggerButton) {
      console.error(`Error al inicializar el modal: Faltan elementos para id "${config.id}".`);
      return;
    }

    // Asigna el evento para abrir el modal.
    this.triggerButton.addEventListener('click', () => this.open());

    if (this.isMovable) {
      this._makeMovable('.modal-header');
    }

    // Registra esta instancia en el mapa estático.
    Modal.#instances.set(this.modalNode.id, this);

    // Asegura que el listener de cierre global se configure una sola vez.
    Modal.#initializeGlobalCloseListener();
  }

  open() {
    const container = this.modalNode.querySelector('.editor-container') || this.modalNode;
    if (this.width) {
      container.style.width = this.width;
    } else {
      container.style.width = '';
    }
    this.modalNode.style.display = 'flex';
  }

  close() {
    this.modalNode.style.display = 'none';
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
   * (Método estático privado) Configura el listener de cierre global.
   * Gracias a la bandera #listenerInitialized, este código solo se ejecuta una vez.
   */
  static #initializeGlobalCloseListener() {
    if (this.#listenerInitialized) {
      return; // Si ya está inicializado, no hacemos nada.
    }
    
    document.body.addEventListener('click', function(event) {
      const closeButton = event.target.closest('.modal-close-btn, .editor-close-btn');
      if (closeButton) {
        const modalNode = event.target.closest('.modal-panel, .editor-modal');
        // Usamos el mapa estático para encontrar la instancia correcta y llamar su método close().
        if (modalNode && Modal.#instances.has(modalNode.id)) {
          Modal.#instances.get(modalNode.id).close();
        }
      }
    });

    this.#listenerInitialized = true; // Marcamos como inicializado.
  }
}