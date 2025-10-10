class EditorCreaturaModal {
  /**
   * @param {{
   *  id?: string,
   *  title?: string,
   *  width?: string,
   *  height?: string,
   *  onSave?: (criatura: any)=>void
   * }} config
   */
  constructor(config = {}) {
    this.cfg = Object.assign({
      id: 'editor-creatura-modal',
      title: 'Editor de Criatura',
      width: '85%',
      height: '76vh',
      onSave: null
    }, config);

    this.containerId = this.cfg.id;              // id del elemento modal raíz
    this.hiddenTriggerId = `${this.containerId}-trigger-hidden`;
    this.tabsContainerId = `${this.containerId}-tabs`;
    this._ensureDOM();
    this._injectStyles();
    this._bindStaticRefs();

    // datos lookup (selects)
    this._catalogs = this._buildCatalogs();

    // estado
    this.model = this._emptyModel(); // objeto Creatura "plano"
    this.onSave = typeof this.cfg.onSave === 'function' ? this.cfg.onSave : null;

    // inicializaciones
    this._fillSelects();
    this._wireBasicInputs();
    this._wireChipsPanels();
    this._wireActionPanels();
    this._wireLegendaryMythicLairRegional();
    this._wireImageLoader();
    this._wireSaveClose();

    // activa Tabs
    new Tabs({ id: this.tabsContainerId, orientation: 'vertical', title: this.cfg.title });

    // crea instancia Modal usando tu clase (con un trigger oculto)
    this.modal = new Modal({
      id: this.containerId,
      triggerId: this.hiddenTriggerId,
      movable: true,
      width: this.cfg.width,
      height: this.cfg.height,
      onOpen: () => {
        // nada especial, pero aquí se podría recalcular layout si es necesario
      }
    });
  }

  /* ======================= API ======================= */

  /**
   * Abre el modal. Si recibe una Creatura, la carga.
   * @param {object=} criatura
   */
  show(criatura = null) {
    if (criatura && typeof criatura === 'object') {
      this._loadModel(criatura);
    } else {
      this.model = this._emptyModel();
      this._renderFromModel();
    }
    this.modal.open();
  }

  hide() {
    this.modal.close();
  }

  getValue() {
    return JSON.parse(JSON.stringify(this.model));
  }

  /* =================== Construcción DOM =================== */

  _ensureDOM() {
    // si ya existe, no lo recrea
    if (document.getElementById(this.containerId)) return;

    // trigger oculto para satisfacer la clase Modal
    const hiddenBtn = document.createElement('button');
    hiddenBtn.id = this.hiddenTriggerId;
    hiddenBtn.style.display = 'none';
    document.body.appendChild(hiddenBtn);

    // modal raíz
    const root = document.createElement('div');
    root.id = this.containerId;
    root.className = 'editor-modal'; // tu Modal usa .editor-modal/.modal-panel para cerrar
    root.style.display = 'none';     // Modal.open() = 'flex'

    root.innerHTML = `
      <div class="modal-panel" id="${this.containerId}-panel">
        <div class="modal-header">
          <h2 id="${this.containerId}-title">${this.cfg.title}</h2>
          <button class="modal-close-btn" title="Cerrar">✕</button>
        </div>

        <div class="editor-container">
          <!-- barra superior -->
          <div class="editor-toolbar">
            <div class="left">
              <button class="btn primary" id="${this.containerId}-btn-save">Guardar</button>
            </div>
            <div class="right">
              <label class="img-upload">
                <input type="file" accept="image/*" id="${this.containerId}-img-file" />
                <span>Imagen...</span>
              </label>
            </div>
          </div>

          <!-- contenido principal -->
          <div id="${this.tabsContainerId}" class="editor-content">

            <!-- TABLIST -->
            <div role="tablist" aria-label="Editor Criatura" class="tabs-header">
              <button role="tab" class="tab" aria-controls="${this.containerId}-tab0">Generales</button>
              <button role="tab" class="tab" aria-controls="${this.containerId}-tab1">Bonificadores</button>
              <button role="tab" class="tab" aria-controls="${this.containerId}-tab2">Acciones</button>
              <button role="tab" class="tab" aria-controls="${this.containerId}-tab3">Adicionales</button>
              <button role="tab" class="tab" aria-controls="${this.containerId}-tab4">Reacciones</button>
              <button role="tab" class="tab" aria-controls="${this.containerId}-tab5">Legendarias</button>
              <button role="tab" class="tab" aria-controls="${this.containerId}-tab6">Míticas</button>
              <button role="tab" class="tab" aria-controls="${this.containerId}-tab7">Guarida</button>
              <button role="tab" class="tab" aria-controls="${this.containerId}-tab8">Regionales</button>
              <button role="tab" class="tab" aria-controls="${this.containerId}-tab9">Notas</button>
            </div>

            <!-- PANELS -->
            ${this._panelGenerales()}
            ${this._panelBonificadores()}
            ${this._panelAcciones(this.containerId, 'tab2', 'Acciones', 'acciones')}
            ${this._panelAcciones(this.containerId, 'tab3', 'Acciones Adicionales', 'accionesAdicionales')}
            ${this._panelAcciones(this.containerId, 'tab4', 'Reacciones', 'reacciones')}
            ${this._panelLegendarias()}
            ${this._panelMiticas()}
            ${this._panelGuarida()}
            ${this._panelRegionales()}
            ${this._panelNotas()}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
  }

  _injectStyles() {
    const styleId = `${this.containerId}-styles`;
    if (document.getElementById(styleId)) return;

    const css = `
      /* ====== Modal look (oscuro) ====== */
      #${this.containerId} {
        position: fixed; inset: 0; display: none; align-items: flex-start; justify-content: center;
        background: rgba(0,0,0,.45); z-index: 2000; padding-top: 6vh;
      }
      #${this.containerId}-panel {
        background: #181D2F; color: #eaeef7; border-radius: 12px; box-shadow: 0 10px 35px #0009; width: 60%;
        max-width: 1100px; min-width: 900px; overflow: hidden; border: 1px solid #293050;
      }
      #${this.containerId} .modal-header {
        background:#11162A; padding:12px 16px; cursor: move; display:flex; align-items:center; justify-content: space-between;
        border-bottom:1px solid #21294a;
      }
      #${this.containerId} .modal-header h2 { margin:0; font-size: 18px; }
      #${this.containerId} .modal-header .modal-close-btn {
        background:none; border:none; color:#fff; font-size:20px; cursor:pointer;
      }

      #${this.containerId} .editor-container { padding: 10px 12px; }
      #${this.containerId} .editor-toolbar {
        display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;
      }
      #${this.containerId} .btn {
        border: 1px solid #2b365f; background:#1c2444; color:#eaeef7; padding:8px 12px; border-radius:8px; cursor:pointer;
      }
      #${this.containerId} .btn.primary { border-color:#36c57e; background:#1d3b2e; }
      #${this.containerId} .btn:hover { filter: brightness(1.05); }
      #${this.containerId} .img-upload input[type="file"] { display:none; }
      #${this.containerId} .img-upload span {
        display:inline-block; border:1px dashed #42507c; padding:6px 10px; border-radius:6px; cursor:pointer;
        background:#0f152b; color:#c8d4ff;
      }

      /* Tabs */
      #${this.tabsContainerId} { display:flex; gap:12px; }
      #${this.tabsContainerId} .tabs-header {
        display:flex; flex-direction:column; min-width: 210px; gap:6px; border-right: 1px solid #283158; padding-right: 10px;
      }
      #${this.tabsContainerId} .tab {
        padding:8px 10px; border-radius:8px; border:1px solid transparent; background: none; color:#c9d1ff; cursor:pointer;
        text-align:left;
      }
      #${this.tabsContainerId} .tab.active {
        background:#00bcd4; color:#111; font-weight:bold; border-left:3px solid #00bcd4;
      }

      /* Panels */
      #${this.tabsContainerId} [role="tabpanel"] {
        display:none; flex:1; padding-left: 6px;
      }
      #${this.tabsContainerId} [role="tabpanel"].active { display:block; }

      /* Formularios */
      .grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
      .grid-3 { display:grid; grid-template-columns: repeat(3,1fr); gap:10px; }
      .grid-5 { display:grid; grid-template-columns: repeat(5,1fr); gap:10px; }
      .row { display:flex; gap:10px; align-items:center; flex-wrap: wrap; }
      label.inline { display:flex; flex-direction:column; gap:4px; font-size: 13px; }
      input[type="text"], input[type="number"], select, textarea {
        width:100%; padding:8px; border-radius:8px; border:1px solid #2a3561; background:#0f152b; color:#eaeef7;
      }
      textarea { min-height: 110px; resize: vertical; }

      /* Imagen */
      .img-preview {
        width: 160px; height: 160px; object-fit: cover; border-radius: 10px; border:1px solid #2a3561; background:#0b1133;
      }

      /* Chips/tags */
      .chip-area { display:flex; flex-wrap: wrap; gap:6px; }
      .chip {
        display:inline-flex; align-items:center; gap:6px;
        padding:4px 8px; border-radius:16px; border:1px solid #355; background:#11203a; color:#d8e6ff; font-size:12px;
      }
      .chip .rm {
        background:none; border:none; color:#ffb5b5; cursor:pointer; font-size:14px; line-height: 1;
      }

      /* Acción card */
      .action-editor { display:flex; gap:6px; align-items:flex-start; margin-bottom:10px; }
      .action-list { display:grid; gap:8px; }
      .action-card {
        padding:10px; border-radius:8px; border:1px solid #2a3561; background:#0f152b;
      }
      .action-card .name { font-weight: bold; margin-bottom:6px; }
      .action-card .small { opacity:.8; font-size:12px; }
      .action-card .rm-btn {
        float:right; background:none; border:1px solid #4a587f; color:#cbd6ff; border-radius:6px; padding:2px 6px; cursor:pointer;
      }

      .hint { font-size:12px; opacity:.8; }
      .divider { border-bottom:1px solid #27305a; margin: 6px 0 12px 0; }

      /* Pequeños helpers */
      .unit { display:flex; align-items:center; gap:6px; }
      .subtitle { opacity:.9; margin:0; padding:0; font-weight:600; }
    `;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }

  _bindStaticRefs() {
    this.root = document.getElementById(this.containerId);
  }

  /* =================== Panels HTML =================== */

  _panelGenerales() {
    const id = this.containerId;
    return `
    <section id="${id}-tab0" role="tabpanel" aria-labelledby="" class="active">
      <div class="grid-2">
        <div>
          <label class="inline">Nombre
            <input id="${id}-nombre" type="text" placeholder="Nombre de la criatura"/>
          </label>
        </div>
        <div>
          <label class="inline">Campaña
            <input id="${id}-campania" type="text" placeholder="Ej: El Umbral del Abismo"/>
          </label>
        </div>
      </div>

      <div class="divider"></div>

      <div class="grid-3">
        <label class="inline">Tamaño
          <select id="${id}-tamanio"></select>
        </label>
        <label class="inline">Tipo
          <select id="${id}-tipo"></select>
        </label>
        <label class="inline">Alineamiento
          <select id="${id}-alineamiento"></select>
        </label>
      </div>

      <div class="divider"></div>

      <div class="grid-3">
        <label class="inline">Clase de Armadura (CA)
          <input id="${id}-ac" type="number" min="0" />
        </label>
        <label class="inline">Descripción de Armadura
          <select id="${id}-desc-arm"></select>
        </label>
        <label class="inline">Puntos de Golpe
          <input id="${id}-hp" type="number" min="0"/>
        </label>
      </div>

      <div class="row">
        <label class="inline" style="flex:1">Dados de Golpe
          <input id="${id}-hp-dados" type="text" placeholder="Ej: 4d10 + 4"/>
        </label>
        <div class="unit">
          <img id="${id}-preview" class="img-preview" alt="imagen"/>
        </div>
      </div>

      <div class="divider"></div>

      <h4 class="subtitle">Velocidades (pies)</h4>
      <div class="grid-5">
        <label class="inline">Caminar
          <input id="${id}-vel-caminar" type="number" min="0"/>
        </label>
        <label class="inline">Volar
          <input id="${id}-vel-volar" type="number" min="0"/>
        </label>
        <label class="inline">Nadar
          <input id="${id}-vel-nadar" type="number" min="0"/>
        </label>
        <label class="inline">Cavar
          <input id="${id}-vel-cavar" type="number" min="0"/>
        </label>
        <label class="inline">Escalar
          <input id="${id}-vel-escalar" type="number" min="0"/>
        </label>
      </div>
    </section>
    `;
  }

  _panelBonificadores() {
    const id = this.containerId;
    return `
    <section id="${id}-tab1" role="tabpanel" aria-labelledby="">
      <h4 class="subtitle">Características</h4>
      <div class="grid-3">
        ${this._statBlock(id, 'Fuerza', 'fuerza')}
        ${this._statBlock(id, 'Destreza', 'destreza')}
        ${this._statBlock(id, 'Constitución', 'constitucion')}
        ${this._statBlock(id, 'Inteligencia', 'inteligencia')}
        ${this._statBlock(id, 'Sabiduría', 'sabiduria')}
        ${this._statBlock(id, 'Carisma', 'carisma')}
      </div>

      <div class="divider"></div>

      <div class="grid-2">
        <div>
          <h4 class="subtitle">Tiradas de Salvación</h4>
          <div class="row">
            <select id="${id}-sel-salvacion"></select>
            <button class="btn" id="${id}-add-salvacion">Añadir</button>
          </div>
          <div class="chip-area" id="${id}-panel-salvacion"></div>
        </div>

        <div>
          <h4 class="subtitle">Habilidades</h4>
          <div class="row">
            <select id="${id}-sel-habilidad"></select>
            <button class="btn" id="${id}-add-hab-comp">Comp</button>
            <button class="btn" id="${id}-add-hab-exp">Exp</button>
          </div>
          <div class="chip-area" id="${id}-panel-habilidad"></div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="grid-2">
        <div>
          <h4 class="subtitle">Idiomas</h4>
          <div class="row">
            <select id="${id}-sel-idioma"></select>
            <select id="${id}-sel-idioma-tipo">
              <option value="habla">Habla</option>
              <option value="entiende">Entiende</option>
              <option value="telepatia">Telepatía</option>
            </select>
            <button class="btn" id="${id}-add-idioma">Añadir</button>
          </div>
          <div class="chip-area" id="${id}-panel-idiomas"></div>
        </div>
        <div>
          <h4 class="subtitle">Sentidos</h4>
          <div class="row">
            <input id="${id}-in-sentido" type="text" placeholder="Ej: Percepción pasiva 11, Visión en la oscuridad 60 pies"/>
            <button class="btn" id="${id}-add-sentido">Añadir</button>
          </div>
          <div class="chip-area" id="${id}-panel-sentidos"></div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="grid-3">
        <div>
          <h4 class="subtitle">Vulnerabilidades de Daño</h4>
          <div class="row">
            <select id="${id}-sel-vuln"></select>
            <button class="btn" id="${id}-add-vuln">Añadir</button>
          </div>
          <div class="chip-area" id="${id}-panel-vuln"></div>
        </div>

        <div>
          <h4 class="subtitle">Resistencias de Daño</h4>
          <div class="row">
            <select id="${id}-sel-res"></select>
            <button class="btn" id="${id}-add-res">Añadir</button>
          </div>
          <div class="chip-area" id="${id}-panel-res"></div>
        </div>

        <div>
          <h4 class="subtitle">Inmunidades de Daño</h4>
          <div class="row">
            <select id="${id}-sel-inm-d"></select>
            <button class="btn" id="${id}-add-inm-d">Añadir</button>
          </div>
          <div class="chip-area" id="${id}-panel-inm-d"></div>
        </div>
      </div>

      <div class="divider"></div>

      <div>
        <h4 class="subtitle">Inmunidades de Condición</h4>
        <div class="row">
          <select id="${id}-sel-inm-c"></select>
          <button class="btn" id="${id}-add-inm-c">Añadir</button>
        </div>
        <div class="chip-area" id="${id}-panel-inm-c"></div>
      </div>

      <div class="divider"></div>

      <div class="grid-2">
        <label class="inline">CR
          <select id="${id}-cr"></select>
        </label>
        <label class="inline">XP
          <input id="${id}-xp" type="number" min="0"/>
        </label>
      </div>
    </section>
    `;
  }

  _panelAcciones(rootId, tabSuffix, titulo, key) {
    // key: 'acciones' | 'accionesAdicionales' | 'reacciones'
    const id = `${rootId}-${tabSuffix}`;
    const listId = `${id}-list`;
    const selId = `${id}-tipo`; // tipo informativo (normal/ataque/rasgo), no se guarda si no lo deseas
    const nomId = `${id}-name`;
    const desId = `${id}-desc`;
    const addId = `${id}-add`;

    return `
    <section id="${id}" role="tabpanel" aria-labelledby="">
      <h4 class="subtitle">${titulo}</h4>
      <div class="action-editor">
        <label class="inline" style="width:160px">Tipo
          <select id="${selId}">
            <option value="accion">Acción</option>
            <option value="ataque">Ataque</option>
            <option value="rasgo">Rasgo</option>
          </select>
        </label>
        <label class="inline" style="flex: 1">Nombre
          <input id="${nomId}" type="text" placeholder="Ej: Embiste"/>
        </label>
      </div>
      <label class="inline">Descripción
        <textarea id="${desId}" placeholder="Texto de la acción..."></textarea>
      </label>
      <div class="row" style="margin-top:6px;">
        <button class="btn" id="${addId}">Añadir ${titulo.slice(0,-1).toLowerCase()}</button>
        <span class="hint">Se agregará como tarjeta abajo.</span>
      </div>
      <div class="divider"></div>
      <div class="action-list" id="${listId}"></div>
    </section>
    `;
  }

  _panelLegendarias() {
    const id = this.containerId;
    return `
    <section id="${id}-tab5" role="tabpanel" aria-labelledby="">
      <h4 class="subtitle">Acciones Legendarias</h4>
      <div class="row">
        <label class="inline">¿Es Legendaria?
          <select id="${id}-es-legendaria">
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </label>
        <label class="inline">Resistencias Legendarias
          <input id="${id}-res-legend" type="number" min="0"/>
        </label>
      </div>

      <div class="divider"></div>

      <div class="action-editor">
        <label class="inline" style="flex:1">Nombre
          <input id="${id}-leg-nombre" type="text" placeholder="Ej: Golpe de sombras"/>
        </label>
        <label class="inline" style="width:160px">Costo Acción
          <input id="${id}-leg-costo" type="number" min="1" value="1"/>
        </label>
      </div>
      <label class="inline">Descripción
        <textarea id="${id}-leg-desc" placeholder="Descripción..."></textarea>
      </label>
      <div class="row" style="margin-top:6px;">
        <button class="btn" id="${id}-leg-add">Añadir legendaria</button>
      </div>

      <div class="divider"></div>

      <div class="action-list" id="${id}-legend-list"></div>
    </section>
    `;
  }

  _panelMiticas() {
    const id = this.containerId;
    return `
    <section id="${id}-tab6" role="tabpanel" aria-labelledby="">
      <h4 class="subtitle">Acciones Míticas</h4>
      <div class="row">
        <label class="inline">¿Es Mítica?
          <select id="${id}-es-mitica">
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </label>
      </div>

      <label class="inline">Descripción Mítica
        <textarea id="${id}-mit-desc" placeholder="Descripción del estado mítico..."></textarea>
      </label>

      <div class="divider"></div>

      <div class="action-editor">
        <label class="inline" style="flex:1">Nombre
          <input id="${id}-mit-nombre" type="text" placeholder="Nombre de la acción mítica"/>
        </label>
      </div>
      <label class="inline">Descripción
        <textarea id="${id}-mit-accion-desc" placeholder="Descripción..."></textarea>
      </label>
      <div class="row" style="margin-top:6px;">
        <button class="btn" id="${id}-mit-add">Añadir mítica</button>
      </div>

      <div class="divider"></div>

      <div class="action-list" id="${id}-mit-list"></div>
    </section>
    `;
  }

  _panelGuarida() {
    const id = this.containerId;
    return `
    <section id="${id}-tab7" role="tabpanel" aria-labelledby="">
      <h4 class="subtitle">Acciones de Guarida</h4>
      <div class="row">
        <label class="inline">¿Tiene Guarida?
          <select id="${id}-tiene-guarida">
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </label>
      </div>

      <label class="inline">Descripción de Guarida
        <textarea id="${id}-guarida-desc" placeholder="Información de la guarida..."></textarea>
      </label>

      <div class="divider"></div>

      <div class="action-editor">
        <label class="inline" style="flex:1">Nombre
          <input id="${id}-gua-nombre" type="text" placeholder="Nombre de acción de guarida"/>
        </label>
      </div>
      <label class="inline">Descripción
        <textarea id="${id}-gua-accion-desc" placeholder="Descripción..."></textarea>
      </label>
      <div class="row" style="margin-top:6px;">
        <button class="btn" id="${id}-gua-add">Añadir acción de guarida</button>
      </div>

      <div class="divider"></div>

      <div class="action-list" id="${id}-gua-list"></div>
    </section>
    `;
  }

  _panelRegionales() {
    const id = this.containerId;
    return `
    <section id="${id}-tab8" role="tabpanel" aria-labelledby="">
      <h4 class="subtitle">Efectos Regionales</h4>
      <div class="row">
        <label class="inline">¿Tiene Efectos Regionales?
          <select id="${id}-tiene-reg">
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </label>
      </div>

      <label class="inline">Descripción Regional
        <textarea id="${id}-reg-desc" placeholder="Descripción general de los efectos regionales..."></textarea>
      </label>

      <div class="divider"></div>

      <div class="action-editor">
        <label class="inline" style="flex:1">Nombre
          <input id="${id}-reg-nombre" type="text" placeholder="Nombre del efecto regional"/>
        </label>
      </div>
      <label class="inline">Descripción
        <textarea id="${id}-reg-accion-desc" placeholder="Descripción..."></textarea>
      </label>
      <div class="row" style="margin-top:6px;">
        <button class="btn" id="${id}-reg-add">Añadir efecto regional</button>
      </div>

      <div class="divider"></div>

      <div class="action-list" id="${id}-reg-list"></div>
    </section>
    `;
  }

  _panelNotas() {
    const id = this.containerId;
    return `
    <section id="${id}-tab9" role="tabpanel" aria-labelledby="">
      <h4 class="subtitle">Notas</h4>
      <textarea id="${id}-notas" placeholder="Notas adicionales..."></textarea>
    </section>
    `;
  }

  _statBlock(rootId, label, key) {
    const lower = key.toLowerCase();
    return `
      <div>
        <label class="inline">${label}
          <input id="${rootId}-${lower}" type="number" min="1" max="30"/>
        </label>
        <div class="hint">Bonificador: <strong id="${rootId}-bonus-${lower}">0</strong></div>
      </div>
    `;
  }

  /* =================== Catalogos =================== */

  _buildCatalogs() {
    return {
      tamanos: [ "Seleccionar", "Diminuto", "Pequeño", "Mediano", "Grande", "Enorme", "Gargantuesco" ],
      tipos: [ "Seleccionar", "Aberración", "Bestia", "Celestial", "Constructo", "Dragón", "Elemental", "Feérico", "Engendro", "Gigante", "Humanoide", "Monstruosidad", "Limo", "Sombra", "Planta", "No muerto", "Otro" ],
      armaduras: [ "Seleccionar", "Ninguna", "Armadura Natural", "Armadura de Mago", "Acolchada", "Cuero", "Cuero Tachonado", "Oculta", "Camisa de Malla", "Armadura de Escamas", "Coraza", "Media Armadura", "Armadura de Anillos", "Cota de Malla", "Armadura Laminada", "Armadura Completa", "Otra" ],
      alineamientos: [ "Seleccionar", "Legal Bueno", "Neutral Bueno", "Caótico Bueno", "Legal Neutral", "Neutral", "Caótico Neutral", "Legal Malvado", "Neutral Malvado", "Caótico Malvado" ],
      salvaciones: [ "Seleccionar", "Fuerza", "Destreza", "Constitución", "Inteligencia", "Sabiduría", "Carisma" ],
      habilidades: [ "Seleccionar", "Acrobacias", "Trato con Animales", "Arcanos", "Atletismo", "Engaño", "Historia", "Perspicacia", "Intimidación", "Investigación", "Medicina", "Naturaleza", "Percepción", "Interpretación", "Persuasión", "Religión", "Juego de Manos", "Sigilo", "Supervivencia" ],
      idiomas: [ "Común", "Enano", "Élfico", "Orco", "Dracónico", "Celestial", "Abisal", "Infernal", "Silvano", "Primordial" ],
      tiposDano: [ "Daño Contundente", "Daño Cortante", "Daño Perforante", "Fuego", "Frío", "Relámpago", "Ácido", "Veneno", "Psíquico", "Radiante", "Necrótico", "Trueno" ],
      condiciones: [ "Cegado", "Hechizado", "Ensordecido", "Agotamiento", "Aterrorizado", "Agarrado", "Incapacitado", "Invisible", "Paralizado", "Petrificado", "Envenenado", "Derribado", "Restringido", "Aturdido", "Inconsciente" ],
      cr: [
        "0 (10 XP)", "1/8 (25 XP)", "1/4 (50 XP)", "1/2 (100 XP)", "1 (200 XP)", "2 (450 XP)", "3 (700 XP)", "4 (1100 XP)",
        "5 (1800 XP)", "6 (2300 XP)", "7 (2900 XP)", "8 (3900 XP)", "9 (5000 XP)", "10 (5900 XP)", "11 (7200 XP)",
        "12 (8400 XP)", "13 (10000 XP)", "14 (11500 XP)", "15 (13000 XP)", "16 (15000 XP)", "17 (18000 XP)",
        "18 (20000 XP)", "19 (22000 XP)", "20 (25000 XP)", "21 (33000 XP)", "22 (41000 XP)", "23 (50000 XP)",
        "24 (62000 XP)", "25 (75000 XP)", "26 (90000 XP)", "27 (105000 XP)", "28 (120000 XP)", "29 (135000 XP)", "30 (155000 XP)"
      ]
    };
  }

  _fillSelects() {
    const id = this.containerId;
    this._fill(`${id}-tamanio`, this._catalogs.tamanos);
    this._fill(`${id}-tipo`, this._catalogs.tipos);
    this._fill(`${id}-alineamiento`, this._catalogs.alineamientos);
    this._fill(`${id}-desc-arm`, this._catalogs.armaduras);

    this._fill(`${id}-sel-salvacion`, this._catalogs.salvaciones);
    this._fill(`${id}-sel-habilidad`, this._catalogs.habilidades);
    this._fill(`${id}-sel-idioma`, this._catalogs.idiomas);

    this._fill(`${id}-sel-vuln`, this._catalogs.tiposDano);
    this._fill(`${id}-sel-res`, this._catalogs.tiposDano);
    this._fill(`${id}-sel-inm-d`, this._catalogs.tiposDano);
    this._fill(`${id}-sel-inm-c`, this._catalogs.condiciones);

    this._fill(`${id}-cr`, this._catalogs.cr);
  }

  _fill(selectId, arr) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = '';
    arr.forEach(txt => sel.add(new Option(txt, txt)));
  }

  /* =================== Lógica de Inputs =================== */

  _wireBasicInputs() {
    const id = this.containerId;
    const byId = (s) => document.getElementById(s);

    // generales
    byId(`${id}-nombre`).addEventListener('input', e => this.model.Nombre = e.target.value || '');
    byId(`${id}-campania`).addEventListener('input', e => this.model.Campania = e.target.value || '');
    byId(`${id}-tamanio`).addEventListener('change', e => this.model.Tamanio = e.target.value);
    byId(`${id}-tipo`).addEventListener('change', e => this.model.Tipo = e.target.value);
    byId(`${id}-alineamiento`).addEventListener('change', e => this.model.Alineamiento = e.target.value);

    byId(`${id}-ac`).addEventListener('input', e => this.model.ClaseArmadura = this._toInt(e.target.value, 10));
    byId(`${id}-desc-arm`).addEventListener('change', e => this.model.DescripcionArmadura = e.target.value);
    byId(`${id}-hp`).addEventListener('input', e => this.model.PuntosGolpe = this._toInt(e.target.value, 0));
    byId(`${id}-hp-dados`).addEventListener('input', e => this.model.DadosGolpe = e.target.value || '');

    byId(`${id}-vel-caminar`).addEventListener('input', e => this.model.VelocidadCaminar = this._toInt(e.target.value, 0));
    byId(`${id}-vel-volar`).addEventListener('input', e => this.model.VelocidadVolar = this._toInt(e.target.value, 0));
    byId(`${id}-vel-nadar`).addEventListener('input', e => this.model.VelocidadNadar = this._toInt(e.target.value, 0));
    byId(`${id}-vel-cavar`).addEventListener('input', e => this.model.VelocidadCavar = this._toInt(e.target.value, 0));
    byId(`${id}-vel-escalar`).addEventListener('input', e => this.model.VelocidadEscalado = this._toInt(e.target.value, 0));

    // características + bonus
    const stats = ['fuerza','destreza','constitucion','inteligencia','sabiduria','carisma'];
    const mapKey = {
      fuerza:'Fuerza', destreza:'Destreza', constitucion:'Constitucion',
      inteligencia:'Inteligencia', sabiduria:'Sabiduria', carisma:'Carisma'
    };
    stats.forEach(k=>{
      const input = byId(`${id}-${k}`);
      const bonusSpan = byId(`${id}-bonus-${k}`);
      input.addEventListener('input', e => {
        const val = this._toInt(e.target.value, 10);
        this.model[mapKey[k]] = val;
        const bonus = this._calcBonus(val);
        bonusSpan.textContent = (bonus >= 0 ? `+${bonus}` : `${bonus}`);

        // guarda también los bonificadores mapeados
        const bmap = {
          fuerza: 'BonificadorFuerza',
          destreza: 'BonificadorDestreza',
          constitucion: 'BonificadorConstitucion',
          inteligencia: 'BonificadorInteligencia',
          sabiduria: 'BonificadorSabiduria',
          carisma: 'BonificadorCarisma'
        };
        this.model[bmap[k]] = bonus;
      });
    });

    // CR / XP
    byId(`${id}-cr`).addEventListener('change', e => this.model.CR = e.target.value);
    byId(`${id}-xp`).addEventListener('input', e => this.model.XP = this._toInt(e.target.value, 0));
  }

  _wireChipsPanels() {
    const id = this.containerId;
    const byId = (s)=>document.getElementById(s);

    // Salvaciones (array de strings)
    byId(`${id}-add-salvacion`).addEventListener('click', ()=>{
      const sel = byId(`${id}-sel-salvacion`);
      const val = sel.value; if (!val || val === 'Seleccionar') return;
      if (!Array.isArray(this.model.Salvacion)) this.model.Salvacion = [];
      if (this.model.Salvacion.includes(val)) return;
      this.model.Salvacion.push(val);
      this._renderChips(byId(`${id}-panel-salvacion`), this.model.Salvacion, (v)=>this._removeFromArray(this.model.Salvacion, v));
    });

    // Habilidades (obj: { nombre: "competente"|"experto" })
    const paintHabs = ()=> {
      const area = byId(`${id}-panel-habilidad`);
      area.innerHTML = '';
      Object.entries(this.model.Habilidades || {}).forEach(([hab,tipo])=>{
        const chip = this._makeChip(`${hab} (${tipo})`, ()=>{ delete this.model.Habilidades[hab]; paintHabs(); });
        area.appendChild(chip);
      });
    };
    byId(`${id}-add-hab-comp`).addEventListener('click', ()=>{
      const sel = byId(`${id}-sel-habilidad`); const val = sel.value;
      if (!val || val === 'Seleccionar') return;
      if (!this.model.Habilidades) this.model.Habilidades = {};
      this.model.Habilidades[val] = 'competente';
      paintHabs();
    });
    byId(`${id}-add-hab-exp`).addEventListener('click', ()=>{
      const sel = byId(`${id}-sel-habilidad`); const val = sel.value;
      if (!val || val === 'Seleccionar') return;
      if (!this.model.Habilidades) this.model.Habilidades = {};
      this.model.Habilidades[val] = 'experto';
      paintHabs();
    });

    // Idiomas (obj: { idioma: "habla|entiende|telepatia" })
    byId(`${id}-add-idioma`).addEventListener('click', ()=>{
      const idi = byId(`${id}-sel-idioma`).value;
      const tipo = byId(`${id}-sel-idioma-tipo`).value;
      if (!idi) return;
      if (!this.model.Idiomas) this.model.Idiomas = {};
      this.model.Idiomas[idi] = tipo;
      this._paintIdiomas();
    });

    // Sentidos (array de strings)
    byId(`${id}-add-sentido`).addEventListener('click', ()=>{
      const v = byId(`${id}-in-sentido`).value.trim(); if (!v) return;
      if (!Array.isArray(this.model.Sentidos)) this.model.Sentidos=[];
      this.model.Sentidos.push(v);
      this._renderChips(byId(`${id}-panel-sentidos`), this.model.Sentidos, (val)=>this._removeFromArray(this.model.Sentidos, val));
      byId(`${id}-in-sentido`).value = '';
    });

    // Vulnerabilidades / Resistencias / Inmunidades D / Inmunidades C
    byId(`${id}-add-vuln`).addEventListener('click', ()=>{
      this._addTypedChip(`${id}-sel-vuln`, this.model.VulnerabilidadesDano = this.model.VulnerabilidadesDano || [], byId(`${id}-panel-vuln`));
    });
    byId(`${id}-add-res`).addEventListener('click', ()=>{
      this._addTypedChip(`${id}-sel-res`, this.model.ResistenciasDano = this.model.ResistenciasDano || [], byId(`${id}-panel-res`));
    });
    byId(`${id}-add-inm-d`).addEventListener('click', ()=>{
      this._addTypedChip(`${id}-sel-inm-d`, this.model.InmunidadesDano = this.model.InmunidadesDano || [], byId(`${id}-panel-inm-d`));
    });
    byId(`${id}-add-inm-c`).addEventListener('click', ()=>{
      this._addTypedChip(`${id}-sel-inm-c`, this.model.InmunidadesCondicion = this.model.InmunidadesCondicion || [], byId(`${id}-panel-inm-c`));
    });
  }

  _wireActionPanels() {
    // Acciones normales
    this._wireSimpleActionTab('tab2', this.model.Acciones = this.model.Acciones || []);
    // Acciones Adicionales
    this._wireSimpleActionTab('tab3', this.model.AccionesAdicionales = this.model.AccionesAdicionales || []);
    // Reacciones
    this._wireSimpleActionTab('tab4', this.model.Reacciones = this.model.Reacciones || []);
  }

  _wireLegendaryMythicLairRegional() {
    const id = this.containerId;
    const byId = (s)=>document.getElementById(s);

    // Legendarias
    byId(`${id}-es-legendaria`).addEventListener('change', e => this.model.EsLegendaria = (e.target.value === 'true'));
    byId(`${id}-res-legend`).addEventListener('input', e => this.model.CantidadResistenciasLegendarias = this._toInt(e.target.value, 0));
    byId(`${id}-leg-add`).addEventListener('click', ()=>{
      const nombre = byId(`${id}-leg-nombre`).value.trim();
      const desc = byId(`${id}-leg-desc`).value.trim();
      const costo = this._toInt(byId(`${id}-leg-costo`).value, 1);
      if (!nombre || !desc) return;
      if (!Array.isArray(this.model.AccionesLegendarias)) this.model.AccionesLegendarias = [];
      this.model.AccionesLegendarias.push({ Nombre:nombre, Descripcion: desc, CostoAccion: costo });
      byId(`${id}-leg-nombre`).value = ''; byId(`${id}-leg-desc`).value = '';
      this._paintList(byId(`${id}-legend-list`), this.model.AccionesLegendarias, true);
    });

    // Míticas
    byId(`${id}-es-mitica`).addEventListener('change', e => this.model.EsMitica = (e.target.value === 'true'));
    byId(`${id}-mit-desc`).addEventListener('input', e => this.model.DescripcionMitica = e.target.value || '');
    byId(`${id}-mit-add`).addEventListener('click', ()=>{
      const nombre = byId(`${id}-mit-nombre`).value.trim();
      const desc = byId(`${id}-mit-accion-desc`).value.trim();
      if (!nombre || !desc) return;
      if (!Array.isArray(this.model.AccionesMiticas)) this.model.AccionesMiticas = [];
      this.model.AccionesMiticas.push({ Nombre:nombre, Descripcion: desc });
      byId(`${id}-mit-nombre`).value=''; byId(`${id}-mit-accion-desc`).value='';
      this._paintList(byId(`${id}-mit-list`), this.model.AccionesMiticas);
    });

    // Guarida
    byId(`${id}-tiene-guarida`).addEventListener('change', e => this.model.TieneGuarida = (e.target.value === 'true'));
    byId(`${id}-guarida-desc`).addEventListener('input', e => this.model.DescripcionGuarida = e.target.value || '');
    byId(`${id}-gua-add`).addEventListener('click', ()=>{
      const nombre = byId(`${id}-gua-nombre`).value.trim();
      const desc = byId(`${id}-gua-accion-desc`).value.trim();
      if (!nombre || !desc) return;
      if (!Array.isArray(this.model.AccionesGuarida)) this.model.AccionesGuarida = [];
      this.model.AccionesGuarida.push({ Nombre:nombre, Descripcion: desc });
      byId(`${id}-gua-nombre`).value=''; byId(`${id}-gua-accion-desc`).value='';
      this._paintList(byId(`${id}-gua-list`), this.model.AccionesGuarida);
    });

    // Regionales
    byId(`${id}-tiene-reg`).addEventListener('change', e => this.model.TieneEfectosRegionales = (e.target.value === 'true'));
    byId(`${id}-reg-desc`).addEventListener('input', e => this.model.DescripcionRegional = e.target.value || '');
    byId(`${id}-reg-add`).addEventListener('click', ()=>{
      const nombre = byId(`${id}-reg-nombre`).value.trim();
      const desc = byId(`${id}-reg-accion-desc`).value.trim();
      if (!nombre || !desc) return;
      if (!Array.isArray(this.model.EfectosRegionales)) this.model.EfectosRegionales = [];
      this.model.EfectosRegionales.push({ Nombre:nombre, Descripcion: desc });
      byId(`${id}-reg-nombre`).value=''; byId(`${id}-reg-accion-desc`).value='';
      this._paintList(byId(`${id}-reg-list`), this.model.EfectosRegionales);
    });

    // Notas
    byId(`${id}-notas`).addEventListener('input', e => this.model.Notas = e.target.value || '');
  }

  _wireImageLoader() {
    const id = this.containerId;
    const file = document.getElementById(`${id}-img-file`);
    const img = document.getElementById(`${id}-preview`);
    file.addEventListener('change', async ()=>{
      const f = file.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        // puedes almacenar base64 entero en this.model.Imagen si lo deseas
        this.model.Imagen = reader.result; // data URL
        img.src = this.model.Imagen;
      };
      reader.readAsDataURL(f);
    });
  }

  _wireSaveClose() {
    const id = this.containerId;
    document.getElementById(`${id}-btn-save`).addEventListener('click', ()=>{
      if (this.onSave) this.onSave(this.getValue());
      this.hide();
    });
  }

  /* =================== Helpers UI =================== */

  _wireSimpleActionTab(tabSuffix, refArr) {
    const id = this.containerId;
    const root = `${id}-${tabSuffix}`;
    const list = document.getElementById(`${root}-list`);
    const nom = document.getElementById(`${root}-name`);
    const des = document.getElementById(`${root}-desc`);
    const add = document.getElementById(`${root}-add`);

    add.addEventListener('click', ()=>{
      const n = (nom.value || '').trim();
      const d = (des.value || '').trim();
      if (!n || !d) return;
      refArr.push({ Nombre: n, Descripcion: d });
      nom.value=''; des.value='';
      this._paintList(list, refArr);
    });

    // primer pintado
    this._paintList(list, refArr);
  }

  _paintList(container, items, showCost = false) {
    container.innerHTML = '';
    items.forEach((it, idx)=>{
      const card = document.createElement('div');
      card.className = 'action-card';
      const head = document.createElement('div');
      head.className = 'name';
      head.textContent = it.Nombre || '(Sin nombre)';

      const rm = document.createElement('button');
      rm.className = 'rm-btn';
      rm.textContent = 'Quitar';
      rm.onclick = ()=>{ items.splice(idx,1); this._paintList(container, items, showCost); };

      head.appendChild(rm);

      const desc = document.createElement('div');
      desc.textContent = it.Descripcion || '';
      const small = document.createElement('div');
      if (showCost && it.CostoAccion) {
        small.className = 'small';
        small.textContent = `Costo: ${it.CostoAccion} acción(es)`;
      }

      card.appendChild(head);
      if (small.textContent) card.appendChild(small);
      card.appendChild(desc);
      container.appendChild(card);
    });
  }

  _paintIdiomas() {
    const id = this.containerId;
    const area = document.getElementById(`${id}-panel-idiomas`);
    area.innerHTML = '';
    Object.entries(this.model.Idiomas || {}).forEach(([idi,tipo])=>{
      const chip = this._makeChip(`${idi} (${tipo})`, ()=>{
        delete this.model.Idiomas[idi];
        this._paintIdiomas();
      });
      area.appendChild(chip);
    });
  }

  _renderChips(container, arr, onRemove) {
    container.innerHTML = '';
    arr.forEach(v=>{
      const chip = this._makeChip(v, ()=>{ onRemove(v); this._renderChips(container, arr, onRemove); });
      container.appendChild(chip);
    });
  }

  _makeChip(text, onRemove) {
    const el = document.createElement('span');
    el.className = 'chip';
    el.textContent = text;
    const btn = document.createElement('button');
    btn.className = 'rm';
    btn.textContent = '×';
    btn.onclick = onRemove;
    el.appendChild(btn);
    return el;
  }

  _addTypedChip(selectId, targetArr, container) {
    const sel = document.getElementById(selectId);
    const v = sel.value; if (!v) return;
    if (targetArr.includes(v)) return;
    targetArr.push(v);
    this._renderChips(container, targetArr, (x)=>this._removeFromArray(targetArr, x));
  }

  _removeFromArray(arr, val) {
    const i = arr.indexOf(val); if (i>=0) arr.splice(i,1);
  }

  _toInt(v, def=0) {
    const n = parseInt(v,10);
    return isNaN(n) ? def : n;
    }

  _calcBonus(score) {
    const n = parseInt(score,10);
    if (isNaN(n)) return 0;
    return Math.floor((n - 10) / 2);
  }

  /* =================== Model & Render =================== */

  _emptyModel() {
    return {
      // Identificación
      Nombre: "", Campania: "", Imagen: "",
      Tamanio: "", Tipo: "", Alineamiento: "",

      // CA/HP/Vel
      ClaseArmadura: 10, DescripcionArmadura: "", PuntosGolpe: 0, DadosGolpe: "",
      VelocidadCaminar: 30, VelocidadVolar: 0, VelocidadNadar: 0, VelocidadCavar: 0, VelocidadEscalado: 0,

      // Stats
      Fuerza: 10, Destreza: 10, Constitucion: 10, Inteligencia: 10, Sabiduria: 10, Carisma: 10,
      BonificadorFuerza: 0, BonificadorDestreza: 0, BonificadorConstitucion: 0, BonificadorInteligencia: 0, BonificadorSabiduria: 0, BonificadorCarisma: 0,

      // Competencias
      Salvacion: [],
      Habilidades: {},

      // Resistencias/vuln/inmunidades
      VulnerabilidadesDano: [],
      ResistenciasDano: [],
      InmunidadesDano: [],
      InmunidadesCondicion: [],

      // Sentidos/Idiomas
      Sentidos: [],
      Idiomas: {},

      // CR/XP
      CR: "0 (10 XP)", XP: 10,

      // Acciones
      Acciones: [],
      AccionesHabilidad: [], // disponible si luego lo usas
      AccionesAdicionales: [],
      Reacciones: [],
      HechizosOEspeciales: [],

      // Legendaria
      EsLegendaria: false,
      CantidadResistenciasLegendarias: 0,
      AccionesLegendarias: [],

      // Mítica
      EsMitica: false,
      DescripcionMitica: "",
      AccionesMiticas: [],

      // Guarida
      TieneGuarida: false,
      AccionesGuarida: [],
      DescripcionGuarida: "",

      // Regionales
      TieneEfectosRegionales: false,
      EfectosRegionales: [],
      DescripcionRegional: "",

      // Notas
      Notas: ""
    };
  }

  _loadModel(criatura) {
    // clonar plano
    this.model = JSON.parse(JSON.stringify(this._emptyModel()));
    // merge
    Object.assign(this.model, JSON.parse(JSON.stringify(criatura)));
    // normaliza mínimos
    [
      'Salvacion','VulnerabilidadesDano','ResistenciasDano','InmunidadesDano','InmunidadesCondicion',
      'Sentidos','Acciones','AccionesAdicionales','Reacciones','AccionesLegendarias',
      'AccionesMiticas','AccionesGuarida','EfectosRegionales'
    ].forEach(k=>{ if (!Array.isArray(this.model[k])) this.model[k]=[]; });
    if (!this.model.Habilidades) this.model.Habilidades = {};
    if (!this.model.Idiomas) this.model.Idiomas = {};
    this._renderFromModel();
  }

  _renderFromModel() {
    const id = this.containerId;
    const byId = (s)=>document.getElementById(s);

    // Generales
    byId(`${id}-nombre`).value = this.model.Nombre || '';
    byId(`${id}-campania`).value = this.model.Campania || '';
    byId(`${id}-tamanio`).value = this.model.Tamanio || 'Seleccionar';
    byId(`${id}-tipo`).value = this.model.Tipo || 'Seleccionar';
    byId(`${id}-alineamiento`).value = this.model.Alineamiento || 'Neutral';
    byId(`${id}-ac`).value = this.model.ClaseArmadura ?? 10;
    byId(`${id}-desc-arm`).value = this.model.DescripcionArmadura || 'Seleccionar';
    byId(`${id}-hp`).value = this.model.PuntosGolpe ?? 0;
    byId(`${id}-hp-dados`).value = this.model.DadosGolpe || '';
    byId(`${id}-vel-caminar`).value = this.model.VelocidadCaminar ?? 30;
    byId(`${id}-vel-volar`).value = this.model.VelocidadVolar ?? 0;
    byId(`${id}-vel-nadar`).value = this.model.VelocidadNadar ?? 0;
    byId(`${id}-vel-cavar`).value = this.model.VelocidadCavar ?? 0;
    byId(`${id}-vel-escalar`).value = this.model.VelocidadEscalado ?? 0;

    // Imagen
    const prev = byId(`${id}-preview`);
    prev.src = this.model.Imagen || '';

    // Stats + bonus
    const setStat = (key, label)=> {
      byId(`${id}-${key}`).value = this.model[label] ?? 10;
      const b = this._calcBonus(this.model[label] ?? 10);
      byId(`${id}-bonus-${key}`).textContent = (b>=0?`+${b}`:`${b}`);
    }
    setStat('fuerza','Fuerza');
    setStat('destreza','Destreza');
    setStat('constitucion','Constitucion');
    setStat('inteligencia','Inteligencia');
    setStat('sabiduria','Sabiduria');
    setStat('carisma','Carisma');

    // Salvación chips
    this._renderChips(byId(`${id}-panel-salvacion`), this.model.Salvacion, (v)=>this._removeFromArray(this.model.Salvacion,v));

    // Habilidades chips
    const paintHabs = ()=>{
      const area = byId(`${id}-panel-habilidad`);
      area.innerHTML='';
      Object.entries(this.model.Habilidades).forEach(([hab,tipo])=>{
        area.appendChild(this._makeChip(`${hab} (${tipo})`, ()=>{ delete this.model.Habilidades[hab]; paintHabs(); }));
      });
    };
    paintHabs();

    // Idiomas chips
    this._paintIdiomas();

    // Sentidos chips
    this._renderChips(byId(`${id}-panel-sentidos`), this.model.Sentidos, (v)=>this._removeFromArray(this.model.Sentidos,v));

    // Daños/condiciones
    this._renderChips(byId(`${id}-panel-vuln`), this.model.VulnerabilidadesDano, (v)=>this._removeFromArray(this.model.VulnerabilidadesDano,v));
    this._renderChips(byId(`${id}-panel-res`), this.model.ResistenciasDano, (v)=>this._removeFromArray(this.model.ResistenciasDano,v));
    this._renderChips(byId(`${id}-panel-inm-d`), this.model.InmunidadesDano, (v)=>this._removeFromArray(this.model.InmunidadesDano,v));
    this._renderChips(byId(`${id}-panel-inm-c`), this.model.InmunidadesCondicion, (v)=>this._removeFromArray(this.model.InmunidadesCondicion,v));

    // CR/XP
    byId(`${id}-cr`).value = this.model.CR || '0 (10 XP)';
    byId(`${id}-xp`).value = this.model.XP ?? 10;

    // Acciones
    this._paintList(byId(`${id}-tab2-list`), this.model.Acciones);
    this._paintList(byId(`${id}-tab3-list`), this.model.AccionesAdicionales);
    this._paintList(byId(`${id}-tab4-list`), this.model.Reacciones);

    // Legendarias
    byId(`${id}-es-legendaria`).value = this.model.EsLegendaria ? 'true':'false';
    byId(`${id}-res-legend`).value = this.model.CantidadResistenciasLegendarias ?? 0;
    this._paintList(byId(`${id}-legend-list`), this.model.AccionesLegendarias, true);

    // Míticas
    byId(`${id}-es-mitica`).value = this.model.EsMitica ? 'true':'false';
    byId(`${id}-mit-desc`).value = this.model.DescripcionMitica || '';
    this._paintList(byId(`${id}-mit-list`), this.model.AccionesMiticas);

    // Guarida
    byId(`${id}-tiene-guarida`).value = this.model.TieneGuarida ? 'true':'false';
    byId(`${id}-guarida-desc`).value = this.model.DescripcionGuarida || '';
    this._paintList(byId(`${id}-gua-list`), this.model.AccionesGuarida);

    // Regionales
    byId(`${id}-tiene-reg`).value = this.model.TieneEfectosRegionales ? 'true':'false';
    byId(`${id}-reg-desc`).value = this.model.DescripcionRegional || '';
    this._paintList(byId(`${id}-reg-list`), this.model.EfectosRegionales);

    // Notas
    byId(`${id}-notas`).value = this.model.Notas || '';
  }
}
