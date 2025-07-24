/**
 * Clase para gestionar una vista de lista de datos en una tabla.
 * Es un componente genérico y reutilizable.
 */
class ListView {
  /**
   * @param {Object} config - Objeto de configuración.
   * @param {string} config.containerId - El ID del div que contiene la tabla.
   * @param {Array<Object>} config.data - El array de datos inicial.
   * @param {Array<{header: string, key: string}>} config.columns - La configuración de las columnas.
   * @param {Function} [config.onRowClick] - Callback que se ejecuta al hacer clic en una fila. Recibe el objeto de datos completo del item.
   */
  constructor(config) {
    this.container = document.getElementById(config.containerId);
    if (!this.container) {
      console.error(`Contenedor de lista con id "${config.containerId}" no encontrado.`);
      return;
    }
    
    // Evita la doble inicialización
    if (this.container.dataset.listInitialized) return;

    this.columns = config.columns || [];
    // Guarda la función que se ejecutará al hacer clic. Si no se proporciona, no hace nada.
    this.onRowClick = config.onRowClick || function() {}; 
    this.tbody = this.container.querySelector('tbody');

    if (!this.tbody) {
      console.error(`La tabla dentro de "${config.containerId}" debe tener un <tbody>.`);
      return;
    }

    this.updateData(config.data || []);
    this.container.dataset.listInitialized = 'true';
  }

  /**
   * Actualiza los datos de la lista y la vuelve a renderizar.
   * @param {Array<Object>} newData - El nuevo array de datos para mostrar.
   */
  updateData(newData) {
    this.data = newData;
    this.render();
  }


  /**
   * Devuelve el item seleccionado actualmente en la lista.
   * @returns {Object|null} El objeto del item seleccionado, o null si no hay ninguno.
   */
  getSelectedItem() {
  const filaSeleccionada = this.tbody.querySelector('.selected');
  if (!filaSeleccionada) return null;

  // Obtenemos el índice de la fila seleccionada
  const filas = Array.from(this.tbody.querySelectorAll('tr'));
  const indice = filas.indexOf(filaSeleccionada);

  if (indice < 0 || !this.data || !this.data[indice]) return null;

  return this.data[indice];
}

  /**
   * Renderiza las filas de la tabla de forma genérica.
   */
  render() {
    this.tbody.innerHTML = ''; 

    this.data.forEach((item) => {
      const fila = document.createElement('tr');

      this.columns.forEach(columna => {
        const celda = document.createElement('td');
        celda.textContent = item[columna.key] || '';
        fila.appendChild(celda);
      });

      // --- LÓGICA CLAVE DEL EVENTO ---
      fila.addEventListener('click', () => {
        // Deselecciona cualquier otra fila que estuviera seleccionada
        const filaSeleccionada = this.tbody.querySelector('.selected');
        if (filaSeleccionada) {
          filaSeleccionada.classList.remove('selected');
        }
        // Selecciona la fila actual
        fila.classList.add('selected');
        
        // Ejecuta la función callback que pasamos en la configuración,
        // enviándole los datos completos del item en el que se hizo clic.
        this.onRowClick(item);
      });
      
      this.tbody.appendChild(fila);
    });
  }
}
