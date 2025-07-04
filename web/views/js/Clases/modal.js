/**
 * Clase para gestionar un componente modal.
 */
class Modal {
    // Propiedades estáticas públicas para que sean accesibles por los métodos estáticos.
    static instances = new Map();
    static listenerInitialized = false;
  
    constructor(config) {
      this.modalNode = document.getElementById(config.id);
      this.triggerButton = document.getElementById(config.triggerId);
      
      this.isMovable = config.movable || false;
      this.width = config.width || null;
      this.onOpen = config.onOpen || null;
  
      if (!this.modalNode || !this.triggerButton) {
        console.error(`Error al inicializar el modal: Faltan elementos para id "${config.id}".`);
        return;
      }
  
      this.triggerButton.addEventListener('click', () => this.open());
  
      if (this.isMovable) {
        this._makeMovable('.modal-header');
      }
  
      // Registra esta instancia en el mapa estático.
      Modal.instances.set(this.modalNode.id, this);
  
      // Llama al método estático para asegurar que el listener de cierre global se configure una sola vez.
      Modal.setupGlobalCloseListener();
    }
  
    open() {
      const container = this.modalNode.querySelector('.editor-container') || this.modalNode;
      if (this.width) {
        container.style.width = this.width;
      } else {
        container.style.width = '';
      }
      this.modalNode.style.display = 'flex';
  
      if (typeof this.onOpen === 'function') {
        this.onOpen();
      }
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
     * (Método Estático) Configura el listener de cierre global.
     * Gracias a la bandera, este código solo se ejecuta una vez.
     */
    static setupGlobalCloseListener() {
      if (this.listenerInitialized) {
        return;
      }
      
      document.body.addEventListener('click', (event) => {
        const closeButton = event.target.closest('.modal-close-btn, .editor-close-btn');
        if (closeButton) {
          const modalNode = event.target.closest('.modal-panel, .editor-modal');
          // Ahora podemos acceder a "Modal.instances" sin problemas.
          if (modalNode && Modal.instances.has(modalNode.id)) {
            Modal.instances.get(modalNode.id).close();
          }
        }
      });
  
      this.listenerInitialized = true;
    }
  }