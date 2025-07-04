/**
 * Clase para gestionar sistemas de pestañas (tabs).
 * Se inicializa con el ID del contenedor principal de las pestañas.
 */
class Tabs {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) {
        console.error(`Contenedor de pestañas con id "${containerId}" no encontrado.`);
        return;
      }
  
      this.tabList = this.container.querySelector('[role="tablist"]');
      this.tabs = this.container.querySelectorAll('[role="tab"]');
      this.panels = this.container.querySelectorAll('[role="tabpanel"]');
  
      if (!this.tabList || !this.tabs.length || !this.panels.length) {
        console.error(`Estructura de pestañas incompleta en el contenedor "${containerId}".`);
        return;
      }
  
      // Usamos un único listener en la lista de botones para mayor eficiencia.
      this.tabList.addEventListener('click', this._onTabClick.bind(this));
    }
  
    _onTabClick(event) {
      const clickedTab = event.target.closest('[role="tab"]');
      if (!clickedTab) return; // Si el clic no fue en un botón de tab, no hacemos nada.
  
      this._switchTab(clickedTab);
    }
  
    _switchTab(tab) {
      const targetPanelId = tab.getAttribute('aria-controls');
  
      // 1. Desactivar todos los tabs y paneles.
      this.tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      this.panels.forEach(p => p.classList.remove('active'));
  
      // 2. Activar solo el tab y panel correctos.
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      this.container.querySelector(`#${targetPanelId}`).classList.add('active');
    }
  }