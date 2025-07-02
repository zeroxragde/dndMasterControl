/**
 * Clase para gestionar un componente modal.
 */
class Modal {
  constructor(config) {
    this.modalNode = document.getElementById(config.id);
    this.triggerButton = document.getElementById(config.triggerId);
    this.isMovable = config.movable || false;
    
    if (!this.modalNode || !this.triggerButton) return;

    // Asigna el evento para abrir el modal.
    this.triggerButton.addEventListener('click', () => this.open());

    if (this.isMovable) {
      this._makeMovable('.modal-header');
    }
  }

  open() {
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
}

/**
 * Función que inicializa todos los modales de la página.
 * Se asegura de que los listeners se configuren una sola vez.
 */
function inicializarTodosLosModales() {
  // Lista de configuraciones para todos los modales de la app
  const configs = [
    { id: 'listaPanel', triggerId: 'btnLista', movable: true },
    { id: 'modalSubida', triggerId: 'abrirSubida', movable: true },
    { id: 'creature-editor-modal', triggerId: 'btnNuevaCriatura' }
  ];

  // Instanciamos cada modal
  configs.forEach(config => new Modal(config));

  // Listener de Cierre Global (la solución definitiva)
  document.body.addEventListener('click', function(event) {
    const closeButton = event.target.closest('.modal-close-btn, .editor-close-btn');
    if (closeButton) {
      const modalToClose = event.target.closest('.modal-panel, .editor-modal');
      if (modalToClose) {
        modalToClose.style.display = 'none';
      }
    }
  });
}