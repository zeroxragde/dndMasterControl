/**
 * Representa una acción legendaria, que hereda de Accion y añade un costo.
 */
// Primero, importa la clase de la que hereda
import { Accion } from './accion.js';
export class AccionLegendaria extends Accion {
  /**
   * @param {string} nombre - El nombre de la acción.
   * @param {string} descripcion - La descripción de la acción.
   * @param {number} costoAccion - El costo para usar esta acción legendaria.
   */
  constructor(nombre = "", descripcion = "", costoAccion = 1) {
    super(nombre, descripcion); // Llama al constructor de la clase padre (Accion)
    this.costoAccion = costoAccion;
  }
}