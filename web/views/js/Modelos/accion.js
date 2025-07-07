/**
 * Representa una acción genérica que una criatura puede realizar.
 * Es una clase de apoyo para el modelo principal de Creatura.
 */
export class Accion {
  /**
   * @param {string} nombre - El nombre de la acción. Ej: "Garras".
   * @param {string} descripcion - La descripción de la acción.
   */
  constructor(nombre = "", descripcion = "") {
    this.nombre = nombre;
    this.descripcion = descripcion;
  }
}