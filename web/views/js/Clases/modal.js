class Modal {
  static activeModals = new Map();

  constructor(config) {
    this.modalNode = document.getElementById(config.id);
    this.triggerButton = document.getElementById(config.triggerId);
    this.isMovable = config.movable || false;

    if (!this.modalNode || !this.triggerButton) return;

    this.triggerButton.addEventListener('click', () => this.open());

    if (this.isMovable) {
      this._makeMovable('.modal-header');
    }

    // Registrar la instancia
    Modal.activeModals.set(this.modalNode.id, this);
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