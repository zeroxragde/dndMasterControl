// web/views/js/Modelos/creatura.js

//import { Accion } from './accion.js';
//import { AccionLegendaria } from './accionlegendaria.js';

class Creatura {
 
  constructor() {
    // --- Identificación básica ---
    this.Nombre = "";
    this.Campania = "";
    this.Imagen = "";
    this.Tamanio = "";
    this.Tipo = "";
    this.Alineamiento = "";

    // --- Clase de Armadura, Puntos de Golpe y Velocidades ---
    this.ClaseArmadura = 10;
    this.DescripcionArmadura = "";
    this.PuntosGolpe = 0;
    this.DadosGolpe = "";

    this.VelocidadCaminar = 30;
    this.VelocidadVolar = 0;
    this.VelocidadNadar = 0;
    this.VelocidadCavar = 0;
    this.VelocidadEscalado = 0;

    // --- Características de habilidad (Ability Scores) ---
    this.Fuerza = 10;
    this.Destreza = 10;
    this.Constitucion = 10;
    this.Inteligencia = 10;
    this.Sabiduria = 10;
    this.Carisma = 10;

    // Los bonificadores almacenados para reflejar lo que ves en UI
    this.BonificadorFuerza = 0;
    this.BonificadorDestreza = 0;
    this.BonificadorConstitucion = 0;
    this.BonificadorInteligencia = 0;
    this.BonificadorSabiduria = 0;
    this.BonificadorCarisma = 0;
    
    // Tiradas de salvación con competencia
    this.Salvacion = []; 

    // Habilidades con competencia o pericia
    this.Habilidades = {}; 

    // --- Vulnerabilidades, resistencias, inmunidades ---
    this.VulnerabilidadesDano = [];
    this.ResistenciasDano = [];
    this.InmunidadesDano = [];
    this.InmunidadesCondicion = [];

    // --- Sentidos ---
    this.Sentidos = []; 

    // --- Idiomas ---
    this.Idiomas = {}; 

    // --- Challenge Rating (CR) y experiencia ---
    this.CR = "0";
    this.XP = 0;

    // --- Listas de Acciones ---
    /** @type {Accion[]} */
    this.Acciones = [];
    /** @type {Accion[]} */
    this.AccionesHabilidad = [];
    /** @type {Accion[]} */
    this.AccionesAdicionales = []; 
    /** @type {Accion[]} */
    this.Reacciones = [];
    /** @type {Accion[]} */
    this.HechizosOEspeciales = [];

    // --- Legendaria ---
    this.EsLegendaria = false;
    this.CantidadResistenciasLegendarias = 0;
    /** @type {AccionLegendaria[]} */
    this.AccionesLegendarias = [];

    // --- Mítica ---
    this.EsMitica = false;
    this.DescripcionMitica = "";
    /** @type {Accion[]} */
    this.AccionesMiticas = [];

    // --- Guarida ---
    this.TieneGuarida = false;
    this.DescripcionGuarida = "";
    /** @type {Accion[]} */
    this.AccionesGuarida = [];

    // --- Efectos Regionales ---
    this.TieneEfectosRegionales = false;
    this.DescripcionRegional = "";
    /** @type {Accion[]} */
    this.EfectosRegionales = [];

    // --- Notas adicionales ---
    this.Notas = "";
  }
}
// Al final de creatura.js
//module.exports = { Creatura };
// ✅ (Opcional, para compatibilidad con código viejo)
//window.Creatura = Creatura;
// MANTÉN ESTO PARA ELECTRON/NODE:
if (typeof module !== 'undefined') {
    module.exports = { Creatura };
}
// MANTÉN ESTO PARA EL NAVEGADOR/HTML:
window.Creatura = Creatura;