/**
 * Clase para gestionar sistemas de pestañas (tabs).
 * Soporta orientación horizontal/vertical y un título opcional.
 * Toda la lógica y los estilos base están contenidos en la clase.
 */
class Tabs {
  constructor(config) {
    this.container = document.getElementById(config.id);
    if (!this.container) {
      console.error(`Contenedor de pestañas con id "${config.id}" no encontrado.`);
      return;
    }

    // Prevenimos la doble inicialización.
    if (this.container.dataset.tabsInitialized) return;

    // --- Propiedades de configuración ---
     this.title = config.title || null;
    this.orientation = config.orientation || 'horizontal'; // 'horizontal' o 'vertical'
    this.title = config.title || null; // Título opcional

    this.tabList = this.container.querySelector('[role="tablist"]');
    this.tabs = this.container.querySelectorAll('[role="tab"]');
    this.panels = this.container.querySelectorAll('[role="tabpanel"]');

    if (!this.tabList || !this.tabs.length) return;

    // Si se proporciona un título, lo creamos y lo añadimos al DOM.
    // Si se proporciona un título, lo actualizamos.
    if (this.title) {
      this._updateTitle();
    }

    // Aplicamos los estilos y la lógica de eventos.
    this._applyBaseStyles();
    this._updateActiveTabStyles();
    this.tabList.addEventListener('click', this._onTabClick.bind(this));
    this.container.dataset.tabsInitialized = 'true';
    
    // Activamos la primera pestaña por defecto para asegurar la visibilidad inicial.
    if (this.tabs.length > 0) {
        this._switchTab(this.tabs[0]);
    }
  }

  /**
   * (Privado) Crea el elemento del título y lo añade al contenedor.
   */
 /* _createHeader() {
    const header = document.createElement('h3');
    header.textContent = this.title;
    
    // Estilos para el título para que se vea bien
    header.style.margin = '0 0 15px 0';
    header.style.padding = '0';
    header.style.fontSize = '18px';
    header.style.color = '#e0e0e0';
    header.style.borderBottom = '1px solid #444';
    header.style.paddingBottom = '10px';

    // Inserta el título al principio del contenedor de pestañas.
    this.container.prepend(header);
  }*/
 /**
   * (Privado) Crea el elemento del título y lo añade al contenedor de contenido.
   */
 /* _createHeader() {
    const header = document.createElement('h3');
    header.textContent = this.title;
    
    // Estilos para el título
    header.style.margin = '0 0 20px 0'; // Un poco más de margen inferior
    header.style.padding = '0';
    header.style.fontSize = '18px';
    header.style.color = '#e0e0e0';

    // --- EL CAMBIO CLAVE ESTÁ AQUÍ ---
    // En lugar de añadirlo al contenedor principal, lo añadimos
    // al contenedor del contenido, justo antes de los paneles.
    const contentArea = this.container.querySelector('.editor-content');
    if (contentArea) {
      contentArea.prepend(header);
    }
  }*/

  /**
   * (Privado) Busca un elemento del título y reemplaza su contenido.
   */
  _updateTitle() {
    // Busca el contenedor del modal subiendo en la jerarquía del DOM
    const modalContainer = this.container.closest('.modal-panel, .editor-modal');
    if (!modalContainer) return;
    
    // Busca el elemento del título DENTRO del modal
    const titleElement = modalContainer.querySelector('#editor-title-display');
    if (titleElement) {
      titleElement.innerHTML = this.title; // Reemplaza todo el contenido
    }
  }
  /**
   * (Privado) Aplica los estilos base según la orientación.
   */
  _applyBaseStyles() {
    this.container.style.display = 'flex';
    this.container.style.flexDirection = (this.orientation === 'vertical') ? 'row' : 'column';

    // Estilos para la lista de botones (el 'tablist')
    this.tabList.style.display = 'flex';
    this.tabList.style.flexDirection = (this.orientation === 'vertical') ? 'column' : 'row';
    this.tabList.style.gap = '5px';
    if (this.orientation === 'vertical') {
      this.tabList.style.borderRight = '1px solid #444';
      this.tabList.style.paddingRight = '10px';
      this.tabList.style.marginRight = '10px';
    } else {
      this.tabList.style.marginBottom = '15px';
    }

    // Estilos para cada botón individual
    this.tabs.forEach(tab => {
      tab.style.padding = '8px 16px';
      tab.style.border = '1px solid transparent';
      tab.style.borderRadius = '6px';
      tab.style.background = 'none';
      tab.style.color = '#ccc';
      tab.style.cursor = 'pointer';
      tab.style.transition = 'all 0.2s ease-in-out';
      tab.style.textAlign = (this.orientation === 'vertical') ? 'left' : 'center';
    });

    // Oculta todos los paneles excepto el activo
    this.panels.forEach(p => {
      if (!p.classList.contains('active')) p.style.display = 'none';
    });
  }

  /**
   * (Privado) Actualiza los estilos de todos los botones según cuál esté activo.
   */
  _updateActiveTabStyles() {
    this.tabs.forEach(tab => {
      if (tab.classList.contains('active')) {
        tab.style.background = '#00bcd4';
        tab.style.color = '#111';
        tab.style.fontWeight = 'bold';
        if (this.orientation === 'vertical') {
          tab.style.borderLeft = '3px solid #00bcd4';
        } else {
          tab.style.borderBottom = '3px solid #00bcd4';
        }
      } else {
        tab.style.background = 'none';
        tab.style.color = '#ccc';
        tab.style.fontWeight = 'normal';
        tab.style.border = '1px solid transparent';
      }
    });
  }

  _onTabClick(event) {
    const clickedTab = event.target.closest('[role="tab"]');
    if (!clickedTab) return;
    this._switchTab(clickedTab);
  }

  _switchTab(tab) {
    const targetPanelId = tab.getAttribute('aria-controls');

    this.tabs.forEach(t => t.classList.remove('active'));
    this.panels.forEach(p => {
      p.style.display = 'none';
      p.classList.remove('active');
    });

    tab.classList.add('active');
    const targetPanel = this.container.querySelector(`#${targetPanelId}`);
    if (targetPanel) {
      targetPanel.style.display = 'block';
      targetPanel.classList.add('active');
    }
    
    // Actualizamos los estilos de todos los botones
    this._updateActiveTabStyles();
  }
}
