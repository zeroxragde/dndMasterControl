/**
 * Clase para gestionar un componente modal.
 * Encapsula la lógica para abrir, cerrar, mover y dimensionar un modal.
 */
class Modal {
  // Almacena todas las instancias de modales creadas para referencia.
  static activeModals = new Map();

  constructor(config) {
    this.modalNode = document.getElementById(config.id);
    this.triggerButton = document.getElementById(config.triggerId);
    
    // Propiedades configurables con valores por defecto.
    this.isMovable = config.movable || false;
    this.width = config.width || null; // Ancho personalizado (e.g., '90%', '1000px')

    if (!this.modalNode || !this.triggerButton) {
      console.error(`Error al inicializar el modal: No se encontró el nodo con id "${config.id}" o el disparador con id "${config.triggerId}".`);
      return;
    }

    // Asigna el evento para abrir el modal.
    this.triggerButton.addEventListener('click', () => this.open());

    // Si es movible, activa la funcionalidad.
    if (this.isMovable) {
      this._makeMovable('.modal-header');
    }

    // Registra esta instancia en el mapa estático para referencia global.
    Modal.activeModals.set(this.modalNode.id, this);
  }

  /**
   * Abre el modal y aplica el ancho personalizado si fue especificado.
   */
  open() {
    const container = this.modalNode.querySelector('.editor-container') || this.modalNode;
    
    if (this.width) {
      container.style.width = this.width; // Aplica el ancho personalizado.
    } else {
      container.style.width = ''; // Usa el ancho definido en el CSS.
    }
    
    this.modalNode.style.display = 'flex';
  }

  /**
   * Cierra el modal.
   */
  close() {
    this.modalNode.style.display = 'none';
  }

  /**
   * (Método privado) Añade la funcionalidad de arrastrar y soltar al modal.
   */
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
   * Configura un listener global en el documento para manejar el cierre de cualquier modal.
   * Este método estático se llama una sola vez.
   */
  static setupGlobalCloseListener() {
    document.body.addEventListener('click', function(event) {
      const closeButton = event.target.closest('.modal-close-btn, .editor-close-btn');
      if (closeButton) {
        const modalNode = event.target.closest('.modal-panel, .editor-modal');
        if (modalNode && Modal.activeModals.has(modalNode.id)) {
          Modal.activeModals.get(modalNode.id).close();
        }
      }
    });
  }
}