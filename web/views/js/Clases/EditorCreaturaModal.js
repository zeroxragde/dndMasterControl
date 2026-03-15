class EditorCreaturaModal extends Modal {

  constructor(modalConfig) {
    if (typeof modalConfig === 'string') {
      modalConfig = { id: modalConfig, movable: true, onLoad: this.onEndLoad };
    }
    super(modalConfig);

    this.modalNode.querySelector('.modal-close-btn').addEventListener('click', () => {
      this.close();
    });

    this.sizes = [
      { value: 'Tiny', label: 'Diminuto' }, { value: 'Small', label: 'Pequeño' },
      { value: 'Medium', label: 'Mediano' }, { value: 'Large', label: 'Grande' },
      { value: 'Huge', label: 'Enorme' }, { value: 'Gargantuan', label: 'Gargantuesco' }
    ];
    this.tipoMonster = [
      { value: "Aberración", label: "Aberración" }, { value: "Bestia", label: "Bestia" },
      { value: "Humanoide", label: "Humanoide" }, { value: "Monstruosidad", label: "Monstruosidad" },
      { value: "No muerto", label: "No muerto" }, { value: "Otro", label: "Otro" }
    ];
    this.armaduras = [
      { value: '10', label: 'Armadura Natural' }, { value: '11', label: 'Cuero' },
      { value: '12', label: 'Cuero Tachonado' }, { value: '15', label: 'Coraza' },
      { value: '17', label: 'Armadura Laminada' }, { value: '18', label: 'Placas' }
    ];

    this.savingThrows = [{ value: "Fuerza", label: "Fuerza" }, { value: "Destreza", label: "Destreza" }, { value: "Constitución", label: "Constitución" }, { value: "Inteligencia", label: "Inteligencia" }, { value: "Sabiduría", label: "Sabiduría" }, { value: "Carisma", label: "Carisma" }];
    this.skills = [{ value: "Acrobacias", label: "Acrobacias" }, { value: "Engaño", label: "Engaño" }, { value: "Sigilo", label: "Sigilo" }, { value: "Percepción", label: "Percepción" }];
    this.conditions = [{ value: "Hechizado", label: "Hechizado" }, { value: "Asustado", label: "Asustado" }];
    this.damageTypes = [{ value: "Fuego", label: "Fuego" }, { value: "Veneno", label: "Veneno" }];
    this.languages = [{ value: "Común", label: "Común" }, { value: "Goblin", label: "Goblin" }];
  }

  loadCreaturaIntoHTML() {
    if (!this.creatura) return;

    const safeSet = (id, value) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = value || "";
        el.dispatchEvent(new Event('input'));
      }
    };

    // --- TAB 1: INFORMACIÓN GENERAL ---
    safeSet('creatura-nombre', this.creatura.Nombre);
    safeSet('cbSizes', this.creatura.Tamanio);
    safeSet('cbTipoM', this.creatura.Tipo);
    safeSet('cbArmaduras', this.creatura.ClaseArmadura);
    safeSet('creatura-hp', this.creatura.PuntosGolpe);

    // Mapeo por posición para inputs sin ID
    const inputsGeneral = this.modalNode.querySelectorAll('#web-tab-general input:not([id])');
    
    // Basado en tu HTML exacto:
    // [0] es Nivel, [1] es Tamaño (texto), [2] es Velocidad, [3] es Alineamiento, [4] es CR, [5] es XP
    if (inputsGeneral.length >= 6) {
      inputsGeneral[0].value = this.creatura.Nivel || "";       // NIVEL
      inputsGeneral[1].value = this.creatura.Tamanio || "";     // TAMAÑO TEXTO
      inputsGeneral[2].value = this.creatura.VelocidadCaminar || ""; // VELOCIDAD
      inputsGeneral[3].value = this.creatura.Alineamiento || ""; // ALINEAMIENTO
      inputsGeneral[4].value = this.creatura.CR || "0";         // DESAFÍO (CR)
      inputsGeneral[5].value = this.creatura.XP || "0";         // XP
    }

    // Estadísticas (Fuerza, Destreza, etc.)
    const statInputs = this.modalNode.querySelectorAll('.creatura-stat-field .creatura-form-input');
    const statValues = [
      this.creatura.Fuerza, this.creatura.Destreza, this.creatura.Constitucion,
      this.creatura.Inteligencia, this.creatura.Sabiduria, this.creatura.Carisma
    ];
    statInputs.forEach((input, i) => {
      if (statValues[i] !== undefined) {
        input.value = statValues[i];
        input.dispatchEvent(new Event('input')); 
      }
    });

    // --- TAB 2: ESTADÍSTICAS TIRADAS ---
    const paneles = ["editor-c-panel-salvaciones", "editor-c-panel-habilidades", "editor-c-panel-condiciones", "editor-c-panel-estado", "editor-c-panel-idiomas"];
    paneles.forEach(id => { 
      const p = document.getElementById(id);
      if (p) p.innerHTML = ""; 
    });
    this.selectedData = {};

    if (Array.isArray(this.creatura.Salvacion)) {
      this.creatura.Salvacion.forEach(s => this.createCard("editor-c-panel-salvaciones", s));
    }

    // --- TAB 3: OTROS (Visiones y Notas) ---
    safeSet('vistaCiega', this.creatura.VelocidadCavar);
    safeSet('visionNocturna', this.creatura.VelocidadVolar);
    safeSet('sentidoSismico', this.creatura.VelocidadNadar);
    safeSet('visionVerdadera', this.creatura.VelocidadEscalado);
    safeSet('txtNotas', this.creatura.Notas);
    
    const preview = document.getElementById("imgPreview");
    if (preview && this.creatura.Imagen) {
      preview.src = this.creatura.Imagen;
      preview.style.display = "block";
    }

    // --- TAB 4: ACCIONES (RECONSTRUCCIÓN COMPLETA) ---
    const contenedorAcciones = document.getElementById("txtVistaPrevia");
    if (contenedorAcciones) {
      contenedorAcciones.innerHTML = "";
      this.accionesGuardadas = {};

      const mapeo = [
        { lista: this.creatura.Acciones, tipo: "Accion" },
        { lista: this.creatura.AccionesHabilidad, tipo: "Habilidad" },
        { lista: this.creatura.Reacciones, tipo: "Reaccion" },
        { lista: this.creatura.AccionesAdicionales, tipo: "AccionBonus" },
        { lista: this.creatura.HechizosOEspeciales, tipo: "Hechizo" },
        { lista: this.creatura.AccionesLegendarias, tipo: "AccionLegendaria" },
        { lista: this.creatura.AccionesMiticas, tipo: "AccionMistica" },
        { lista: this.creatura.AccionesGuarida, tipo: "AccionGuarida" },
        { lista: this.creatura.EfectosRegionales, tipo: "EfectoRegional" }
      ];

      mapeo.forEach(cat => {
        if (Array.isArray(cat.lista)) {
          this.accionesGuardadas[cat.tipo] = [];
          cat.lista.forEach(acc => {
            this.accionesGuardadas[cat.tipo].push({ nombre: acc.Nombre, descripcion: acc.Descripcion });
            this._renderizarTarjetaVisual("txtVistaPrevia", cat.tipo, acc.Nombre, acc.Descripcion);
          });
        }
      });
    }
  }

  _renderizarTarjetaVisual(contenedorId, tipo, nombre, descripcion) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    const headerColors = {
      "HABILIDAD": "#3f51b5", "ACCION": "#00bcd4", "REACCION": "#ff9800",
      "ACCION BONUS": "#9c27b0", "HECHIZO": "#4caf50", "ACCION LEGENDARIA": "#f44336",
      "ACCION MISTICA": "#673ab7", "ACCION GUARDADA": "#8bc34a", "EFECTO REGIONAL": "#795548",
      "ACCION GUARIDA": "#5d4037"
    };
    const color = headerColors[tipo.toUpperCase()] || "#00aaff";

    const card = document.createElement("div");
    Object.assign(card.style, {
      border: `3px solid ${color}`, borderRadius: "8px", padding: "8px", margin: "8px",
      background: "#1b1f23", color: "#fff", display: "flex", flexDirection: "column",
      width: "260px", boxShadow: "0 0 8px rgba(0,0,0,0.3)"
    });

    card.innerHTML = `
      <div style="font-weight:bold; text-align:center; background:${color}; border-radius:4px; padding:5px; margin-bottom:6px;">${tipo}</div>
      <strong style="margin-bottom:4px;">${nombre}</strong>
      <p style="white-space:pre-line; font-size:14px; line-height:1.4;">${descripcion}</p>
      <button style="margin-top:6px; background:#b71c1c; color:white; border:none; border-radius:4px; cursor:pointer; padding:4px; align-self:flex-end;">❌ Eliminar</button>
    `;

    card.querySelector("button").onclick = () => {
      card.remove();
      this.accionesGuardadas[tipo] = this.accionesGuardadas[tipo].filter(a => a.nombre !== nombre);
    };
    contenedor.appendChild(card);
  }

  showEdit(c) {
    this.creatura = c;
    super.open();
    super.setTitle(`Editar Criatura: ${c.Nombre}`);

    setTimeout(() => {
      this.loadSelects();
      this.loadCreaturaIntoHTML();
    }, 150);
  }

  onEndLoad() {
    this.editorTabCreature = new Tabs({ id: 'editor-creature-container', orientation: 'vertical' });
    if (this.footer) this.footer.innerHTML = "";
    this.addFooterButton('💾 Guardar', () => this._guardarCreatura(), { color: '#007bff' });
    this.addFooterButton('🧹 Limpiar', () => this._limpiarCampos(), { color: '#b33c00' });
    this.addFooterButton('❌ Cerrar', () => this.close(), { color: '#444' });
  }

  loadSelects() {
    this.populateSelect("cbSizes", this.sizes, "Tamaño...");
    this.populateSelect("cbArmaduras", this.armaduras, "Armadura...");
    this.populateSelect("cbTipoM", this.tipoMonster, "Tipo...");
    this.populateSelect("cbSalvacion", this.savingThrows, "Salvación...");
    this.populateSelect("cbHabilidad", this.skills, "Habilidades...");
    this.populateSelect("cbCondiciones", this.conditions, "Condiciones...");
    this.populateSelect("cbEstado", this.damageTypes, "Daño...");
    this.populateSelect("cbIdiomas", this.languages, "Idioma...");
    this._initHPDiceSystem();
    this.initActionCardSystem("txtNombreAccion", "txtDescripcionAccion", "txtVistaPrevia", ".creatura-action-buttons .creatura-btn");
  }

  createCard(panelId, labelText) {
    const container = document.getElementById(panelId);
    if (!container) return;
    if (!this.selectedData) this.selectedData = {};
    if (!this.selectedData[panelId]) this.selectedData[panelId] = [];
    if (this.selectedData[panelId].includes(labelText)) return;

    const card = document.createElement("div");
    card.className = "skill-tag";
    card.innerHTML = `${labelText} <button class="remove-skill-btn">✖</button>`;
    card.querySelector("button").onclick = () => {
      this.selectedData[panelId] = this.selectedData[panelId].filter(v => v !== labelText);
      card.remove();
    };
    container.appendChild(card);
    this.selectedData[panelId].push(labelText);
  }

  populateSelect(id, data, placeholder) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = `<option disabled selected>${placeholder}</option>`;
    data.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.value; opt.textContent = item.label;
      select.appendChild(opt);
    });
  }

  _initHPDiceSystem() {
    const btn = document.getElementById('creatura-roll-hp');
    const input = document.getElementById('creatura-hp');
    const res = document.getElementById('creatura-hp-result');
    if (!btn) return;
    btn.onclick = () => {
      const match = input.value.match(/(\d+)d(\d+)\s*\+?\s*(\d+)?/i);
      if (!match) { res.textContent = "= error"; return; }
      let total = parseInt(match[3] || 0);
      for (let i = 0; i < parseInt(match[1]); i++) total += Math.floor(Math.random() * parseInt(match[2])) + 1;
      res.textContent = `= ${total}`;
    };
  }

  initActionCardSystem(nId, dId, cId, bSel) {
    this.accionesGuardadas = {};
    document.querySelectorAll(bSel).forEach(btn => {
      const tipo = btn.dataset.type;
      this.accionesGuardadas[tipo] = [];
      btn.onclick = () => {
        const n = document.getElementById(nId).value.trim();
        const d = document.getElementById(dId).value.trim();
        if (n && d) {
          this._crearTarjetaAccion(cId, tipo, n, d);
          document.getElementById(nId).value = ""; document.getElementById(dId).value = "";
        }
      };
    });
  }

  _limpiarCampos() {
    this.modalNode.querySelectorAll('input, textarea, select').forEach(el => el.value = "");
    document.querySelectorAll('.display-panel, .creatura-preview').forEach(p => p.innerHTML = "");
    this.selectedData = {}; this.accionesGuardadas = {};
  }

  _guardarCreatura() {
    alert(`Guardando a ${this.creatura.Nombre}...`);
    this.close();
  }
}
window.EditorCreaturaModal = EditorCreaturaModal;