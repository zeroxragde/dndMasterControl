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
      { "value": "Aberración", "label": "Aberración" },
      { "value": "Bestia", "label": "Bestia" },
      { "value": "Celestial", "label": "Celestial" },
      { "value": "Constructo", "label": "Constructo" },
      { "value": "Dragón", "label": "Dragón" },
      { "value": "Elemental", "label": "Elemental" },
      { "value": "Feérico", "label": "Feérico" },
      { "value": "Engendro", "label": "Engendro" },
      { "value": "Gigante", "label": "Gigante" },
      { "value": "Humanoide", "label": "Humanoide" },
      { "value": "Monstruosidad", "label": "Monstruosidad" },
      { "value": "Limo", "label": "Limo" },
      { "value": "Planta", "label": "Planta" },
      { "value": "No muerto", "label": "No muerto" },
      { "value": "Otro", "label": "Otro" }
    ];

    this.armaduras = [
      { value: '10', label: '10 (Natural)' },
      { value: '11', label: '11 (Cuero)' },
      { value: '12', label: '12 (Cuero Tachonado)' },
      { value: '14', label: '14 (Escamas)' },
      { value: '16', label: '16 (Cota de Malla)' },
      { value: '17', label: '17 (Laminada)' },
      { value: '18', label: '18 (Placas)' }
    ];

    this.savingThrows = [
      { value: "Fuerza", label: "Fuerza" }, { value: "Destreza", label: "Destreza" },
      { value: "Constitución", label: "Constitución" }, { value: "Inteligencia", label: "Inteligencia" },
      { value: "Sabiduría", label: "Sabiduría" }, { value: "Carisma", label: "Carisma" }
    ];

    this.skills = [
      { value: "Acrobacias", label: "Acrobacias" }, { value: "Sigilo", label: "Sigilo" },
      { value: "Percepción", label: "Percepción" }, { value: "Engaño", label: "Engaño" },
      { value: "Perspicacia", label: "Perspicacia" }, { value: "Arcanos", label: "Arcanos" }
    ];

    this.conditions = [
      { value: "Hechizado", label: "Hechizado" }, { value: "Asustado", label: "Asustado" },
      { value: "Paralizado", label: "Paralizado" }, { value: "Envenenado", label: "Envenenado" },
      { value: "Cegado", label: "Cegado" }, { value: "Derribado", label: "Derribado" }
    ];

    this.damageTypes = [
      { value: "Fuego", label: "Fuego" }, { value: "Frío", label: "Frío" },
      { value: "Veneno", label: "Veneno" }, { value: "Psíquico", label: "Psíquico" },
      { value: "Radiante", label: "Radiante" }, { value: "Relámpago", label: "Relámpago" }
    ];

    this.languages = [
      { value: "Común", label: "Común" }, { value: "Goblin", label: "Goblin" },
      { value: "Enano", label: "Enano" }, { value: "Élfico", label: "Élfico" },
      { value: "Telepatía", label: "Telepatía" }, { value: "Subcomún", label: "Subcomún" }
    ];
  }

  onEndLoad() {
    this.editorTabCreature = new Tabs({ id: 'editor-creature-container', orientation: 'vertical' });
    if (this.footer) this.footer.innerHTML = "";
    this.addFooterButton('💾 Guardar', () => this._guardarCreatura(), { color: '#007bff' });
    this.addFooterButton('🧹 Limpiar', () => this._limpiarCampos(), { color: '#b33c00' });
    this.addFooterButton('❌ Cerrar', () => this.close(), { color: '#444' });
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

  loadCreaturaIntoHTML() {
    if (!this.creatura) return;

    // BUSCADOR POR PLACEHOLDER PARA CAMPOS SIN ID (CR, XP, NIVEL)
    const setByPlaceholder = (text, val) => {
      const el = Array.from(this.modalNode.querySelectorAll('input')).find(i => i.placeholder && i.placeholder.includes(text));
      if (el) {
        el.value = val !== undefined ? val : "";
        el.dispatchEvent(new Event('input'));
      }
    };

    const safeSet = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = val || "";
        el.dispatchEvent(new Event('input'));
      }
    };

    // --- TAB 1: GENERAL ---
    safeSet('creatura-nombre', this.creatura.Nombre);
    safeSet('creatura-hp', this.creatura.PuntosGolpe);
    safeSet('cbSizes', this.creatura.Tamanio);
    safeSet('cbTipoM', this.creatura.Tipo);
    safeSet('cbArmaduras', this.creatura.ClaseArmadura);

    setByPlaceholder("Nivel", this.creatura.Nivel);
    setByPlaceholder("Tamaño", this.creatura.Tamanio);
    setByPlaceholder("Velocidad", this.creatura.VelocidadCaminar);
    setByPlaceholder("Alineamiento", this.creatura.Alineamiento);
    setByPlaceholder("Desafío (CR)", this.creatura.CR);
    setByPlaceholder("XP", this.creatura.XP);

    // STATS
    const statInputs = this.modalNode.querySelectorAll('.creatura-stat-field input');
    const stats = [this.creatura.Fuerza, this.creatura.Destreza, this.creatura.Constitucion, this.creatura.Inteligencia, this.creatura.Sabiduria, this.creatura.Carisma];
    statInputs.forEach((input, i) => {
      if (stats[i] !== undefined) {
        input.value = stats[i];
        input.dispatchEvent(new Event('input'));
      }
    });

    // --- TAB 2: PANELES ---
    document.querySelectorAll('.display-panel').forEach(p => p.innerHTML = "");
    this.selectedData = {};
    if (Array.isArray(this.creatura.Salvacion)) {
      this.creatura.Salvacion.forEach(s => this.createCard("editor-c-panel-salvaciones", s));
    }

    // --- TAB 3: OTROS ---
    safeSet('txtNotas', this.creatura.Notas);
    safeSet('vistaCiega', this.creatura.VelocidadCavar);
    safeSet('visionNocturna', this.creatura.VelocidadVolar);
    const preview = document.getElementById("imgPreview");
    if (preview && this.creatura.Imagen) {
      preview.src = this.creatura.Imagen;
      preview.style.display = "block";
    }

    // --- TAB 4: ACCIONES ---
    const contenedor = document.getElementById("txtVistaPrevia");
    if (contenedor) {
      contenedor.innerHTML = "";
      this.accionesGuardadas = {};
      const categorias = [
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
      categorias.forEach(cat => {
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
    const colors = { "HABILIDAD": "#3f51b5", "ACCION": "#00bcd4", "REACCION": "#ff9800", "ACCION BONUS": "#9c27b0", "HECHIZO": "#4caf50", "ACCION LEGENDARIA": "#f44336", "ACCION MISTICA": "#673ab7" };
    const color = colors[tipo.toUpperCase()] || "#00aaff";
    const card = document.createElement("div");
    Object.assign(card.style, { border: `3px solid ${color}`, borderRadius: "8px", padding: "8px", margin: "8px", background: "#1b1f23", color: "#fff", display: "flex", flexDirection: "column", width: "260px", boxShadow: "0 0 8px rgba(0,0,0,0.3)" });
    card.innerHTML = `<div style="font-weight:bold; text-align:center; background:${color}; border-radius:4px; padding:5px; margin-bottom:6px;">${tipo}</div><strong>${nombre}</strong><p style="white-space:pre-line; font-size:14px; line-height:1.4;">${descripcion}</p><button style="margin-top:6px; background:#b71c1c; color:white; border:none; border-radius:4px; cursor:pointer; padding:4px; align-self:flex-end;">❌ Eliminar</button>`;
    card.querySelector("button").onclick = () => { card.remove(); this.accionesGuardadas[tipo] = this.accionesGuardadas[tipo].filter(a => a.nombre !== nombre); };
    contenedor.appendChild(card);
  }

  loadSelects() {
    this.populateSelect("cbSizes", this.sizes, "Tamaño...");
    this.populateSelect("cbArmaduras", this.armaduras, "Armadura...");
    this.populateSelect("cbTipoM", this.tipoMonster, "Tipo...");
    this.populateSelect("cbSalvacion", this.savingThrows, "Salvación...");
    this.populateSelect("cbHabilidad", this.skills, "Habilidad...");
    this.populateSelect("cbCondiciones", this.conditions, "Condición...");
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
    card.querySelector("button").onclick = () => { this.selectedData[panelId] = this.selectedData[panelId].filter(v => v !== labelText); card.remove(); };
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
    if (!btn) return;
    btn.onclick = () => {
      const input = document.getElementById('creatura-hp');
      const match = input.value.match(/(\d+)d(\d+)\s*\+?\s*(\d+)?/i);
      if (match) {
        let total = parseInt(match[3] || 0);
        for (let i = 0; i < parseInt(match[1]); i++) total += Math.floor(Math.random() * parseInt(match[2])) + 1;
        document.getElementById('creatura-hp-result').textContent = `= ${total}`;
      }
    };
  }

  initActionCardSystem(nId, dId, cId, bSel) {
    this.accionesGuardadas = {};
    document.querySelectorAll(bSel).forEach(btn => {
      const tipo = btn.dataset.type;
      btn.onclick = () => {
        const n = document.getElementById(nId).value.trim();
        const d = document.getElementById(dId).value.trim();
        if (n && d) {
          if (!this.accionesGuardadas[tipo]) this.accionesGuardadas[tipo] = [];
          this.accionesGuardadas[tipo].push({ nombre: n, descripcion: d });
          this._renderizarTarjetaVisual(cId, tipo, n, d);
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
    console.log("Guardando:", this.creatura.Nombre, "CR:", this.creatura.CR);
    this.close();
  }
}
window.EditorCreaturaModal = EditorCreaturaModal;