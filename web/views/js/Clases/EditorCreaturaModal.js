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

    this.populateSelect("cbSizes", this.sizes);

  }
  populateSelect(selectId, data, placeholderText = "Selecciona...") {
    const select = document.getElementById(selectId);
    if (!select) return console.error(`No se encontró el elemento #${selectId}`);

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
