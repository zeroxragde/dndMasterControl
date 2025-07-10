/**
 * Representa una acción legendaria, que hereda de Accion y añade un costo.
 */
// 1. "Importamos" la clase Accion usando require
import { Accion } from './accion.js';

export class AccionLegendaria extends Accion {
  /**
   * @param {string} nombre - El nombre de la acción.
   * @param {string} descripcion - La descripción de la acción.
   * @param {number} costoAccion - El costo para usar esta acción legendaria.
   */
  constructor(Nombre = "", Descripcion = "", CostoAccion = 1) {
    super(Nombre, Descripcion); // Llama al constructor de la clase padre (Accion)
    this.CostoAccion = CostoAccion;
  }
}
