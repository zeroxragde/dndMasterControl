
class EditorCreaturaModal extends Modal  {

  constructor(modalConfig) {
   if (typeof modalConfig === 'string') {
      modalConfig = { id: modalConfig, movable: true, onLoad: this.onEndLoad};
    }
    super(modalConfig);

    this.modalNode.querySelector('.modal-close-btn').addEventListener('click', () => {
      this.close();
    });
   


   this.sizes = [
    { value: 'Tiny', label: 'Diminuto' },
    { value: 'Small', label: 'Pequeño' },
    { value: 'Medium', label: 'Mediano' },
    { value: 'Large', label: 'Grande' },
    { value: 'Huge', label: 'Enorme' },
    { value: 'Gargantuan', label: 'Gargantuesco' }
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
    { value: '0', label: '0 (Ninguna)' },
    { value: '10', label: '10 (Armadura Natural)' },
    { value: '11', label: '11 (Armadura de Mago)' },
    { value: '11', label: '11 (Acolchada)' },
    { value: '12', label: '12 (Cuero)' },
    { value: '13', label: '13 (Cuero Tachonado)' },
    { value: '13', label: '13 (Oculta)' },
    { value: '14', label: '14 (Camisa de Malla)' },
    { value: '14', label: '14 (Armadura de Escamas)' },
    { value: '15', label: '15 (Coraza)' },
    { value: '15', label: '15 (Media Armadura)' },
    { value: '14', label: '14 (Armadura de Anillos)' },
    { value: '16', label: '16 (Cota de Malla)' },
    { value: '17', label: '17 (Armadura Laminada)' },
    { value: '18', label: '18 (Armadura Completa)' },
    { value: '0', label: '0 (Otra)' }
  ];


  this.savingThrows = [
    { value: "SavingThrow", label: "Tirada de Salvación" },
    { value: "Strength", label: "Fuerza" },
    { value: "Dexterity", label: "Destreza" },
    { value: "Constitution", label: "Constitución" },
    { value: "Intelligence", label: "Inteligencia" },
    { value: "Wisdom", label: "Sabiduría" },
    { value: "Charisma", label: "Carisma" }
  ];

  this.skills = [
    { value: "Skills", label: "Habilidades" },
    { value: "Acrobatics", label: "Acrobacias" },
    { value: "AnimalHandling", label: "Trato con Animales" },
    { value: "Arcana", label: "Arcanos" },
    { value: "Athletics", label: "Atletismo" },
    { value: "Deception", label: "Engaño" },
    { value: "History", label: "Historia" },
    { value: "Insight", label: "Perspicacia" },
    { value: "Intimidation", label: "Intimidación" },
    { value: "Investigation", label: "Investigación" },
    { value: "Medicine", label: "Medicina" },
    { value: "Nature", label: "Naturaleza" },
    { value: "Perception", label: "Percepción" },
    { value: "Performance", label: "Interpretación" },
    { value: "Persuasion", label: "Persuasión" },
    { value: "Religion", label: "Religión" },
    { value: "SleightOfHand", label: "Juego de Manos" },
    { value: "Stealth", label: "Sigilo" },
    { value: "Survival", label: "Supervivencia" }
  ];

  this.conditions = [
    { value: "SelectCondition", label: "Seleccionar Estado" },
    { value: "Blinded", label: "Cegado" },
    { value: "Charmed", label: "Hechizado" },
    { value: "Deafened", label: "Ensordecido" },
    { value: "Exhaustion", label: "Agotamiento" },
    { value: "Frightened", label: "Aterrorizado" },
    { value: "Grappled", label: "Agarrado" },
    { value: "Incapacitated", label: "Incapacitado" },
    { value: "Invisible", label: "Invisible" },
    { value: "Paralyzed", label: "Paralizado" },
    { value: "Petrified", label: "Petrificado" },
    { value: "Poisoned", label: "Envenenado" },
    { value: "Prone", label: "Derribado" },
    { value: "Restrained", label: "Restringido" },
    { value: "Stunned", label: "Aturdido" },
    { value: "Unconscious", label: "Inconsciente" }
  ];

  this.damageTypes = [
    { value: "DamageType", label: "Tipo de Daño" },
    { value: "Acid", label: "Ácido" },
    { value: "Bludgeoning", label: "Contundente" },
    { value: "Cold", label: "Frío" },
    { value: "Fire", label: "Fuego" },
    { value: "Force", label: "Fuerza" },
    { value: "Lightning", label: "Relámpago" },
    { value: "Necrotic", label: "Necrótico" },
    { value: "Piercing", label: "Perforante" },
    { value: "Poison", label: "Veneno" },
    { value: "Psychic", label: "Psíquico" },
    { value: "Radiant", label: "Radiante" },
    { value: "Slashing", label: "Cortante" },
    { value: "Thunder", label: "Trueno" },
    { value: "NonMagicalAttacks", label: "Ataques no mágicos" },
    { value: "NonSilveredAttacks", label: "Ataques no plateados" },
    { value: "NonAdamantineAttacks", label: "Ataques no adamantinos" },
    { value: "Other", label: "Otro" }
  ];

  this.languages = [
    { value: "All", label: "Todas" },
    { value: "Abyssal", label: "Abisal" },
    { value: "Aquan", label: "Acuático" },
    { value: "Auran", label: "Áurico" },
    { value: "Celestial", label: "Celestial" },
    { value: "Common", label: "Común" },
    { value: "DeepSpeech", label: "Habla Profunda" },
    { value: "Draconic", label: "Dracónico" },
    { value: "Dwarvish", label: "Enano" },
    { value: "Elvish", label: "Élfico" },
    { value: "Giant", label: "Gigante" },
    { value: "Goblin", label: "Goblin" },
    { value: "Gnomish", label: "Gnómico" },
    { value: "Halfling", label: "Mediano" },
    { value: "Ignan", label: "Ígneo" },
    { value: "Infernal", label: "Infernal" },
    { value: "Orc", label: "Orco" },
    { value: "Primordial", label: "Primordial" },
    { value: "Sylvan", label: "Feérico" },
    { value: "Terran", label: "Telúrico" },
    { value: "Undercommon", label: "Subcomún" },
    { value: "Other", label: "Otro" }
  ];
    super.onEndLoad();
  }

  _guardarCreatura() {

  }

  onEndLoad() {
      this.editorTabCreature = new Tabs({ id: 'editor-creature-container', orientation: 'vertical' });

  // ✅ Limpia botones previos del footer (por si se reusa el modal)
  if (this.footer) this.footer.innerHTML = "";

  // 💾 Botón Guardar
  this.addFooterButton('💾 Guardar', () => this._guardarCreatura(), {
    color: '#007bff',
    hoverColor: '#3399ff',
    tooltip: 'Guarda la criatura actual'
  });

  // 🧹 Botón Limpiar
  this.addFooterButton('🧹 Limpiar', () => this._limpiarCampos(), {
    color: '#b33c00',
    hoverColor: '#ff6600',
    tooltip: 'Limpia todos los campos del formulario'
  });

  // ❌ Botón Cerrar
  this.addFooterButton('❌ Cerrar', () => this.close(), {
    color: '#444',
    hoverColor: '#666',
    tooltip: 'Cerrar sin guardar'
  });


  }
  close() {
    if (typeof this.onCloseEditor === 'function') {
      this.onCloseEditor(this);
    }  
    super.close();  
  }

  loadSelects() { 

    this.populateSelect("cbSizes", this.sizes, "Selecciona un tamaño...");
    this.populateSelect("cbArmaduras", this.armaduras, "Selecciona una armadura...",() => {
      const tipoSelect = document.getElementById("cbArmaduras");
      const otroTipoInput = document.getElementById("otroArmadura");
      const otroTipcoInputValor = document.getElementById("otroArmaduraValor");
      tipoSelect.addEventListener("change", () => {
        if (tipoSelect.value === "0") {
          otroTipoInput.style.display = "block";
          otroTipcoInputValor.style.display = "block";
        } else {
            otroTipoInput.style.display = "none";
            otroTipcoInputValor.style.display = "none";
        }
      });
    }); 

    this.populateSelect("cbTipoM", this.tipoMonster, "Selecciona un tipo de monstruo...",() => {
      const tipoSelect = document.getElementById("cbTipoM");
      const otroTipoInput = document.getElementById("otroTipo");
      tipoSelect.addEventListener("change", () => {
        if (tipoSelect.value === "Otro") {
          otroTipoInput.style.display = "block";
        } else {
          otroTipoInput.style.display = "none";
        }
      });
    }); 

    this.populateSelect("cbSalvacion", this.savingThrows, "Selecciona una tirada...");
    this.populateSelect("cbHabilidad", this.skills, "Selecciona una habilidad...");
    this.populateSelect("cbCondiciones", this.conditions, "Selecciona una condición...");
    this.populateSelect("cbEstado", this.damageTypes, "Selecciona un tipo de daño...");
    this.populateSelect("cbIdiomas", this.languages, "Selecciona un idioma...");



    document.querySelectorAll('.creatura-btn') .forEach(button => {
    
      button.addEventListener('click', (target) => {
          const tipo =this._getAttributeElement(button,'tipo');
          const panelid =this._getAttributeElement(button,'panelid');
          const idSelect =this._getAttributeElement(button,'select');
          const select = document.getElementById(idSelect);
          const value = select.value; // valor del option (atributo value)
          this.createCard(panelid, value+"("+tipo+")");
          //AGREGR LA LOGICA PARA GUARDAR EL JSON FINAL DE LAS TIRADAS


      });

    });

    document.getElementById("fileFoto").addEventListener("change", (e) => {
      const file = e.target.files[0];
      const preview = document.getElementById("imgPreview");

      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          preview.src = ev.target.result;
          preview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });

    document.querySelectorAll('.creatura-stat-field input').forEach(input => {
      input.addEventListener('input', () => {
        const value = parseInt(input.value) || 0;
        const mod = Math.floor((value - 10) / 2);
        const label = input.nextElementSibling;
        label.textContent = (mod >= 0 ? '+' : '') + mod;
        label.classList.toggle('positive', mod >= 0);
        label.classList.toggle('negative', mod < 0);
      });
    });
    this._initHPDiceSystem();


    this.initActionCardSystem(
      "txtNombreAccion",      // ID del input nombre
      "txtDescripcionAccion", // ID del textarea
      "txtVistaPrevia",       // Panel donde se agregarán las tarjetas
      ".creatura-action-buttons .creatura-btn" // Selector de botones
    );
  }
  _getAttributeElement(element, attributeName) {
    return element.getAttribute(attributeName);
  }

   _initHPDiceSystem() {
    const rollButton = document.getElementById('creatura-roll-hp');
    const hpInput = document.getElementById('creatura-hp');
    const hpResult = document.getElementById('creatura-hp-result');

    if (!rollButton || !hpInput || !hpResult) return;

    rollButton.addEventListener('click', () => {
      const formula = hpInput.value.trim();
      if (!formula) return;

      const match = formula.match(/(\d+)d(\d+)\s*\+?\s*(\d+)?/i);
      if (!match) {
        hpResult.textContent = '= formato inválido';
        hpResult.style.color = '#ff5555';
        return;
      }

      const numDice = parseInt(match[1]);
      const diceSides = parseInt(match[2]);
      const bonus = parseInt(match[3]) || 0;

      let total = 0;
      for (let i = 0; i < numDice; i++) {
        total += Math.floor(Math.random() * diceSides) + 1;
      }
      total += bonus;

      hpResult.textContent = `= ${total}`;
      hpResult.style.color = '#4cc9f0';
    });
  }

  updateHPField(value) {
    const hpInput = document.getElementById('creatura-hp');
    const hpResult = document.getElementById('creatura-hp-result');
    if (!hpInput || !hpResult) return;

    hpInput.value = value || '';
    hpResult.textContent = '= 0';
  }

createCard(panelId, labelText) {
  const container = document.getElementById(panelId);
  if (!container) return console.error(`No se encontró el contenedor #${panelId}`);

  // Inicializa la estructura interna si no existe
  if (!this.selectedData) this.selectedData = {};
  if (!this.selectedData[panelId]) this.selectedData[panelId] = [];

  const value = labelText.trim();
  if (!value) return;

  // Evita duplicados
  if (this.selectedData[panelId].includes(value)) return;

  // Crear la tarjeta visual
  const card = document.createElement("div");
  card.className = "skill-tag";
  card.dataset.value = value;
  card.innerHTML = `
    ${value}
    <button class="remove-skill-btn" title="Eliminar">✖</button>
  `;

  // Evento para eliminar tarjeta + actualizar lista interna
  card.querySelector(".remove-skill-btn").addEventListener("click", () => {
    this.selectedData[panelId] = this.selectedData[panelId].filter(v => v !== value);
    card.remove();
  });

  // Agregar visualmente al panel
  container.appendChild(card);

  // Guardar internamente
  this.selectedData[panelId].push(value);
}

  populateSelect(selectId, data, placeholderText = "Selecciona...", fn = null) {
    const select = document.getElementById(selectId);
    if (!select) return console.error(`No se encontró el elemento #${selectId}`);
    if(fn && typeof fn === 'function') {
      //data = fn(data);
      select.addEventListener('change', (e) => {
        fn(e.target.value);
      });
    }

    // Limpia contenido previo
    select.innerHTML = "";

    // Opción inicial (placeholder)
    const placeholder = document.createElement("option");
    placeholder.textContent = placeholderText;
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    // Agregar opciones del JSON
    data.forEach(item => {
      const option = document.createElement("option");
      option.value = item.value;
      option.textContent = item.label;
      select.appendChild(option);
    });
  }

  show(){
    this.loadSelects();
    super.setTitle("Crear Criatura");
    if (typeof this.onOpenEditor === 'function') {
      this.onOpenEditor(this);
    }
    this.creatura = new Creatura();
    super.open();
  }
  loadCreaturaIntoHTML(){
      const inputs = this.modalNode.querySelectorAll("input, select, textarea");

      inputs.forEach(el => {
        console.log("Edgar was here",el.id, el.value);
      });
  }
  
  showEdit(c){
    this.creatura = c;
    this.loadCreaturaIntoHTML();
    this.loadSelects();
    super.setTitle("Editar Criatura");
    if (typeof this.onOpenEditor === 'function') {
      this.onOpenEditor(this);
    }
    super.open();
  }
  /////////
 

 /**
   * Inicializa el sistema de creación de tarjetas de acciones.
   * Cada botón con data-type crea una tarjeta en el panel especificado.
   */
  initActionCardSystem(nombreInputId, descripcionInputId, contenedorId, botonesSelector) {
    this.accionesGuardadas = {};

    document.querySelectorAll(botonesSelector).forEach(btn => {
      const tipo = btn.dataset.type;
      this.accionesGuardadas[tipo] = [];

      btn.addEventListener("click", () => {
        const nombre = document.getElementById(nombreInputId)?.value.trim();
        const descripcion = document.getElementById(descripcionInputId)?.value.trim();

        if (!nombre || !descripcion) {
          alert("Debes ingresar nombre y descripción antes de guardar.");
          return;
        }

        // Guardar datos internamente
        this.accionesGuardadas[tipo].push({ nombre, descripcion });

        // Crear tarjeta visual
        this._crearTarjetaAccion(contenedorId, tipo, nombre, descripcion);

        // Limpiar inputs
        document.getElementById(nombreInputId).value = "";
        document.getElementById(descripcionInputId).value = "";
      });
    });
  }

  /**
   * Crea una tarjeta visual dentro del panel seleccionado.
   */
  _crearTarjetaAccion(contenedorId, tipo, nombre, descripcion) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return console.error(`No se encontró el contenedor #${contenedorId}`);

    // 🎨 Colores personalizados por tipo
    const headerColors = {
      "HABILIDAD": "#3f51b5",
      "ACCION": "#00bcd4",
      "REACCION": "#ff9800",
      "ACCION BONUS": "#9c27b0",
      "HECHIZO": "#4caf50",
      "ACCION LEGENDARIA": "#f44336",
      "ACCION MISTICA": "#673ab7",
      "ACCION GUARDADA": "#8bc34a",
      "EFECTO REGIONAL": "#795548"
    };

    const color = headerColors[tipo.toUpperCase()] || "#00aaff";

    // Tarjeta visual
    const card = document.createElement("div");
    card.style.border = `3px solid ${color}`;
    card.style.borderRadius = "8px";
    card.style.padding = "8px";
    card.style.margin = "8px";
    card.style.background = "#1b1f23";
    card.style.color = "#fff";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.width = "260px";
    card.style.boxShadow = "0 0 8px rgba(0,0,0,0.3)";

    const header = document.createElement("div");
    header.textContent = tipo;
    header.style.fontWeight = "bold";
    header.style.textAlign = "center";
    header.style.background = color;
    header.style.borderRadius = "4px";
    header.style.padding = "5px";
    header.style.marginBottom = "6px";

    const title = document.createElement("strong");
    title.textContent = nombre;
    title.style.marginBottom = "4px";

    const desc = document.createElement("p");
    desc.textContent = descripcion;
    desc.style.whiteSpace = "pre-line"; // permite saltos de línea
    desc.style.fontSize = "14px";
    desc.style.lineHeight = "1.4";

    const eliminarBtn = document.createElement("button");
    eliminarBtn.textContent = "❌ Eliminar";
    eliminarBtn.style.marginTop = "6px";
    eliminarBtn.style.background = "#b71c1c";
    eliminarBtn.style.color = "white";
    eliminarBtn.style.border = "none";
    eliminarBtn.style.borderRadius = "4px";
    eliminarBtn.style.cursor = "pointer";
    eliminarBtn.style.padding = "4px";
    eliminarBtn.style.alignSelf = "flex-end";
    eliminarBtn.onclick = () => this._eliminarTarjetaAccion(card, tipo, nombre);

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(eliminarBtn);

    contenedor.appendChild(card);
    super.addFooterButton('💾 <span>Guardar</span>', () => this._guardarCreatura());
  }

  /**
   * Elimina una tarjeta visual y su registro interno del objeto accionesGuardadas.
   */
  _eliminarTarjetaAccion(card, tipo, nombre) {
    card.remove();
    if (this.accionesGuardadas?.[tipo]) {
      this.accionesGuardadas[tipo] = this.accionesGuardadas[tipo].filter(a => a.nombre !== nombre);
    }
  }




  ////////
}
window.EditorCreaturaModal = EditorCreaturaModal;