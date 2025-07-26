
export class Accion {
  /**
   * @param {string} Nombre - El nombre de la acción. Ej: "Garras".
   * @param {string} Descripcion - La descripción de la acción.
   */
  constructor(Nombre = "", Descripcion = "") {
    this.Nombre = nombre;
    this.Descripcion = descripcion;
  }
}
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
export class Creatura {
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

    // Los bonificadores normalmente se calculan, pero se pueden almacenar si es necesario
    this.BonificadorFuerza = 0;
    this.BonificadorDestreza = 0;
    this.BonificadorConstitucion = 0;
    this.BonificadorInteligencia = 0;
    this.BonificadorSabiduria = 0;
    this.BonificadorCarisma = 0;
    
    // Tiradas de salvación con competencia
    this.Salvacion = []; // Ej: ["fuerza", "constitucion"]

    // Habilidades con competencia o pericia
    this.Habilidades = {}; // Ej: { "sigilo": "competente", "percepcion": "experto" }

    // --- Vulnerabilidades, resistencias, inmunidades ---
    this.VulnerabilidadesDano = [];
    this.ResistenciasDano = [];
    this.InmunidadesDano = [];
    this.InmunidadesCondicion = [];

    // --- Sentidos ---
    this.Sentidos = []; // Ej: "Visión en la Oscuridad 60 ft.", "Percepción pasiva 14"

    // --- Idiomas ---
    this.Idiomas = {}; // Ej: { "comun": "habla", "draconico": "entiende" }

    // --- Challenge Rating (CR) y experiencia ---
    this.CR = "0";
    this.XP = 10;

    /** @type {Accion[]} */
    this.Acciones = [];
    /** @type {Accion[]} */
    this.AccionesHabilidad = [];
    /** @type {Accion[]} */
    this.AccionesAdicionales = []; // Bonus Actions
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
    /** @type {Accion[]} */
    this.AccionesGuarida = [];
    this.DescripcionGuarida = "";

    // --- Efectos Regionales ---
    this.TieneEfectosRegionales = false;
    /** @type {Accion[]} */
    this.EfectosRegionales = [];
    this.DescripcionRegional = "";

    // --- Notas adicionales ---
    this.Notas = "";
  }
}