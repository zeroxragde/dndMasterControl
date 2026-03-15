// web/views/js/Modelos/creatura.js

class Accion {
  constructor(Nombre = "", Descripcion = "") {
    // Corregido: Referencia exacta al parámetro recibido
    this.Nombre = Nombre; 
    this.Descripcion = Descripcion;
  }
}

class AccionLegendaria extends Accion {
  constructor(Nombre = "", Descripcion = "", CostoAccion = 1) {
    super(Nombre, Descripcion);
    this.CostoAccion = CostoAccion;
  }
}

class Creatura {
  constructor() {
    this.Nombre = "";
    this.Campania = "";
    this.Imagen = "";
    this.Tamanio = "";
    this.Tipo = "";
    this.Alineamiento = "";
    this.ClaseArmadura = 10;
    this.DescripcionArmadura = "";
    this.PuntosGolpe = 0;
    this.DadosGolpe = "";
    this.VelocidadCaminar = 30;
    this.VelocidadVolar = 0;
    this.VelocidadNadar = 0;
    this.VelocidadCavar = 0;
    this.VelocidadEscalado = 0;
    this.Fuerza = 10;
    this.Destreza = 10;
    this.Constitucion = 10;
    this.Inteligencia = 10;
    this.Sabiduria = 10;
    this.Carisma = 10;
    this.Salvacion = []; 
    this.Habilidades = {}; 
    this.VulnerabilidadesDano = [];
    this.ResistenciasDano = [];
    this.InmunidadesDano = [];
    this.InmunidadesCondicion = [];
    this.Sentidos = []; 
    this.Idiomas = {}; 
    this.CR = "0";
    this.XP = 0;
    this.Acciones = [];
    this.AccionesHabilidad = [];
    this.AccionesAdicionales = []; 
    this.Reacciones = [];
    this.HechizosOEspeciales = [];
    this.EsLegendaria = false;
    this.AccionesLegendarias = [];
    this.Notas = "";
  }
}

// Exportación compatible para Electron y el Navegador
if (typeof module !== 'undefined') {
    module.exports = { Creatura, Accion, AccionLegendaria };
}
window.Creatura = Creatura;