/**
 * Modelo de datos para una criatura de D&D, traducido de C#.
 * Contiene todas las propiedades necesarias para un stat-block completo.
 */
// Importa las clases que necesita
// 1. "Importamos" las clases que necesita usando require
// 1. "Importamos" las clases que necesita usando require
import { Accion } from './accion.js';
import { AccionLegendaria } from './accionlegendaria.js';
export class Creatura {
  constructor() {
    // --- Identificación básica ---
    this.nombre = "";
    this.campania = "";
    this.imagen = "";
    this.tamanio = "";
    this.tipo = "";
    this.alineamiento = "";

    // --- Clase de Armadura, Puntos de Golpe y Velocidades ---
    this.claseArmadura = 10;
    this.descripcionArmadura = "";
    this.puntosGolpe = 0;
    this.dadosGolpe = "";

    this.velocidadCaminar = 30;
    this.velocidadVolar = 0;
    this.velocidadNadar = 0;
    this.velocidadCavar = 0;
    this.velocidadEscalado = 0;

    // --- Características de habilidad (Ability Scores) ---
    this.fuerza = 10;
    this.destreza = 10;
    this.constitucion = 10;
    this.inteligencia = 10;
    this.sabiduria = 10;
    this.carisma = 10;

    // Los bonificadores normalmente se calculan, pero se pueden almacenar si es necesario
    this.bonificadorFuerza = 0;
    this.bonificadorDestreza = 0;
    this.bonificadorConstitucion = 0;
    this.bonificadorInteligencia = 0;
    this.bonificadorSabiduria = 0;
    this.bonificadorCarisma = 0;
    
    // Tiradas de salvación con competencia
    this.salvacion = []; // Ej: ["fuerza", "constitucion"]

    // Habilidades con competencia o pericia
    this.habilidades = {}; // Ej: { "sigilo": "competente", "percepcion": "experto" }

    // --- Vulnerabilidades, resistencias, inmunidades ---
    this.vulnerabilidadesDano = [];
    this.resistenciasDano = [];
    this.inmunidadesDano = [];
    this.inmunidadesCondicion = [];

    // --- Sentidos ---
    this.sentidos = []; // Ej: "Visión en la Oscuridad 60 ft.", "Percepción pasiva 14"

    // --- Idiomas ---
    this.idiomas = {}; // Ej: { "comun": "habla", "draconico": "entiende" }

    // --- Challenge Rating (CR) y experiencia ---
    this.cr = "0";
    this.xp = 10;

    /** @type {Accion[]} */
    this.acciones = [];
    /** @type {Accion[]} */
    this.accionesHabilidad = [];
    /** @type {Accion[]} */
    this.accionesAdicionales = []; // Bonus Actions
    /** @type {Accion[]} */
    this.reacciones = [];
    /** @type {Accion[]} */
    this.hechizosOEspeciales = [];

    // --- Legendaria ---
    this.esLegendaria = false;
    this.cantidadResistenciasLegendarias = 0;
    /** @type {AccionLegendaria[]} */
    this.accionesLegendarias = [];

    // --- Mítica ---
    this.esMitica = false;
    this.descripcionMitica = "";
    /** @type {Accion[]} */
    this.accionesMiticas = [];

    // --- Guarida ---
    this.tieneGuarida = false;
    /** @type {Accion[]} */
    this.accionesGuarida = [];
    this.descripcionGuarida = "";

    // --- Efectos Regionales ---
    this.tieneEfectosRegionales = false;
    /** @type {Accion[]} */
    this.efectosRegionales = [];
    this.descripcionRegional = "";

    // --- Notas adicionales ---
    this.notas = "";
  }
}
// Al final de creatura.js
module.exports = { Creatura };