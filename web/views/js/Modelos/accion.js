/**
 * Representa una acción genérica que una criatura puede realizar.
 * Es una clase de apoyo para el modelo principal de Creatura.
 */
class Accion {
  /**
   * @param {string} Nombre - El nombre de la acción. Ej: "Garras".
   * @param {string} Descripcion - La descripción de la acción.
   */
  /*constructor(Nombre = "", Descripcion = "") {
    this.Nombre = nombre;
    this.Descripcion = descripcion;
  }*/
 /**
   * @param {string} Nombre - El nombre de la acción.
   * @param {string} Descripcion - La descripción de la acción.
   */
constructor(Nombre = "", Descripcion = "") {
    this.Nombre = Nombre;
    this.Descripcion = Descripcion;
  }
}
