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
    { value: '11', label: '11 (Armadura de Piel)' },
    { value: '12', label: '12 (Armadura de Cuero)' },
    { value: '13', label: '13 (Armadura de Cuero Tachonado)' },
    { value: '14', label: '14 (Armadura de Escamas)' },
    { value: '15', label: '15 (Armadura de Cota de Mallas)' },
    { value: '16', label: '16 (Armadura de Cota de Mallas Completa)' },
    { value: '17', label: '17 (Armadura de Placas)' }
  ];
    super.onEndLoad();
  }

  onEndLoad() {
      this.editorTabCreature = new Tabs({ id: 'editor-creature-container', orientation: 'vertical' });
  }
  close() {
    if (typeof this.onCloseEditor === 'function') {
      this.onCloseEditor(this);
    }  
    super.close();  
  }

  loadSelects() { 

    this.populateSelect("cbSizes", this.sizes, "Selecciona un tamaño...");
    this.populateSelect("cbArmaduras", this.armaduras, "Selecciona una armadura...");
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
    super.open();
  }
  
  showEdit(c){
    this.loadSelects();
    super.setTitle("Editar Criatura");
    if (typeof this.onOpenEditor === 'function') {
      this.onOpenEditor(this);
    }
    super.open();
  }
  
}
