/**
 * Clase para gestionar una vista de lista de datos en una tabla.
 * Es un componente genérico y reutilizable.
 */
class ListView {
  /**
   * @param {Object} config - Objeto de configuración.
   * @param {string} config.containerId - El ID del div que contiene la tabla.
   * @param {Array<Object>} config.data - El array de datos a mostrar.
   * @param {Array<{header: string, key: string}>} config.columns - La configuración de las columnas.
   */
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    if (!this.container) {
      console.error(`Contenedor de lista con id "${config.containerId}" no encontrado.`);
      return;
    }
    
    if (this.container.dataset.listInitialized) return;

    this.data = config.data || [];
    this.columns = config.columns || []; // Guardamos la configuración de las columnas
    this.tbody = this.container.querySelector('tbody');

    if (!this.tbody || this.columns.length === 0) {
      console.error(`Estructura de lista incompleta o sin columnas definidas para "${config.containerId}".`);
      return;
    }

    this.render();
    this.container.dataset.listInitialized = 'true';
  }

  /**
   * Renderiza las filas de la tabla de forma genérica.
   */
  render() {
    this.tbody.innerHTML = ''; 

    this.data.forEach((item, index) => {
      const fila = document.createElement('tr');

      // --- LÓGICA GENÉRICA ---
      // Itera sobre la configuración de columnas para crear cada celda.
      this.columns.forEach(columna => {
        const celda = document.createElement('td');
        // Usa la 'key' de la columna para obtener el dato correcto del objeto 'item'.
        celda.textContent = item[columna.key] || ''; // Muestra el dato o un string vacío si no existe
        fila.appendChild(celda);
      });

      // El resto de la lógica (selección) se mantiene igual.
      fila.addEventListener('click', () => {
        const filaSeleccionada = this.tbody.querySelector('.selected');
        if (filaSeleccionada) {
          filaSeleccionada.classList.remove('selected');
        }
        fila.classList.add('selected');
      });
/*
      if (index === 0) {
        fila.classList.add('selected');
      }*/
      
      this.tbody.appendChild(fila);
    });
  }
}