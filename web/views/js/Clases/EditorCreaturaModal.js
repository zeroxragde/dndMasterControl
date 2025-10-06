window.EditorCreaturaModal = function(config) {
  const datosDelJuego = {
    tamanos: [ "Seleccionar", "Diminuto", "Pequeño", "Mediano", "Grande", "Enorme", "Gargantuesco" ],
    tipos: [ "Seleccionar", "Aberración", "Bestia", "Celestial", "Constructo", "Dragón", "Elemental", "Feérico", "Engendro", "Gigante", "Humanoide", "Monstruosidad", "Limo", "Sombra", "Planta", "No muerto", "Otro" ],
    armaduras: [ "Seleccionar", "Ninguna", "Armadura Natural", "Armadura de Mago", "Acolchada", "Cuero", "Cuero Tachonado", "Oculta", "Camisa de Malla", "Armadura de Escamas", "Coraza", "Media Armadura", "Armadura de Anillos", "Cota de Malla", "Armadura Laminada", "Armadura Completa", "Otra" ],
    alineamientos: [ "Seleccionar", "Legal Bueno", "Neutral Bueno", "Caótico Bueno", "Legal Neutral", "Neutral", "Caótico Neutral", "Legal Malvado", "Neutral Malvado", "Caótico Malvado" ],
    salvaciones: [ "Seleccionar", "Fuerza", "Destreza", "Constitución", "Inteligencia", "Sabiduría", "Carisma" ],
    habilidades: [ "Seleccionar", "Acrobacias", "Trato con Animales", "Arcanos", "Atletismo", "Engaño", "Historia", "Perspicacia", "Intimidación", "Investigación", "Medicina", "Naturaleza", "Percepción", "Interpretación", "Persuasión", "Religión", "Juego de Manos", "Sigilo", "Supervivencia" ],
    idiomas: [ "Común", "Enano", "Élfico", "Orco", "Dracónico", "Celestial", "Abisal", "Infernal", "Silvano", "Primordial" ],
    velocidades: [ "Caminar", "Volar", "Nadar", "Trepar", "Excavar" ],
    resistencias: [ "Daño Contundente", "Daño Cortante", "Daño Perforante", "Fuego", "Frío", "Relámpago", "Ácido", "Veneno", "Psíquico", "Radiante", "Necrótico", "Trueno" ]
  };

  const divContainer = document.getElementById(config.containerId);
  const btnOpen = document.getElementById(config.triggerBtnId);
  const onSave = typeof config.onSave === "function" ? config.onSave : function(){};

  let criatura = null;
  const modalId = "creatura-" + Math.floor(Math.random()*100000);

  function crearModal() {
    divContainer.innerHTML = `
      <div id="${modalId}" style="display:none;position:fixed;top:5vh;left:50%;transform:translateX(-50%);background:#181D2F;border-radius:12px;box-shadow:0 0 22px #000a;min-width:950px;z-index:2000;color:white;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#11162A;border-radius:12px 12px 0 0;cursor:move;">
          <h2 style="margin:0;">Editor de Criatura</h2>
          <button id="${modalId}-close" style="font-size:1.3em;background:none;border:none;color:#fff;">✕</button>
        </div>

        <!-- Tabs -->
        <div style="display:flex;border-bottom:1px solid #333;">
          ${["Generales","Bonificadores","Acciones","Adicionales","Reacciones","Legendarias","Míticas","Hechizos","Otros"].map((tab, i)=>`
            <button class="tab-btn" data-tab="${i}" style="flex:1;padding:10px;border:none;background:${i===0?"#222844":"#181D2F"};color:white;cursor:pointer;">${tab}</button>
          `).join('')}
        </div>

        <!-- Contenido Tabs -->
        <div id="${modalId}-tabs">
          <!-- Generales -->
          <div class="tab-content" data-tab="0" style="padding:18px;display:block;">
            <label>Nombre <input id="${modalId}-nombre" style="width:95%"/></label><br><br>
            <select id="${modalId}-tamanio"></select>
            <select id="${modalId}-tipo"></select>
            <select id="${modalId}-alineamiento"></select><br><br>
            <label>Clase de Armadura <input id="${modalId}-ac" type="number" style="width:80px"/></label>
            <select id="${modalId}-desc-arm"></select><br><br>
            <label>Puntos de Golpe <input id="${modalId}-hp" type="number" style="width:80px"/></label>
            <label>Dados de Golpe <input id="${modalId}-hp-dados" style="width:120px"/></label>
          </div>

          <!-- Bonificadores -->
          <div class="tab-content" data-tab="1" style="padding:18px;display:none;">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
              ${['Fuerza','Destreza','Constitución','Inteligencia','Sabiduría','Carisma'].map(stat=>`
                <label>${stat}<br>
                  <input id="${modalId}-${stat.toLowerCase()}" type="number" min="1" max="30" style="width:60px;"/>
                  <span id="${modalId}-bonus-${stat.toLowerCase()}"></span>
                </label>
              `).join('')}
            </div>
            <br>
            <label>Tiradas de Salvación</label>
            <select id="${modalId}-salvacion"></select>
            <button id="${modalId}-add-salvacion">Añadir</button>
            <ul id="${modalId}-panel-salvacion" style="list-style:none;padding:0;"></ul>

            <br><label>Habilidades</label>
            <select id="${modalId}-habilidad"></select>
            <button id="${modalId}-add-habilidad-comp">Comp</button>
            <button id="${modalId}-add-habilidad-exp">Exp</button>
            <ul id="${modalId}-panel-habilidad" style="list-style:none;padding:0;"></ul>
          </div>

          <!-- Acciones -->
          <div class="tab-content" data-tab="2" style="padding:18px;display:none;">
            <textarea id="${modalId}-acciones" style="width:100%;height:150px;"></textarea>
          </div>

          <!-- Adicionales -->
          <div class="tab-content" data-tab="3" style="padding:18px;display:none;">
            <textarea id="${modalId}-adicionales" style="width:100%;height:150px;"></textarea>
          </div>

          <!-- Reacciones -->
          <div class="tab-content" data-tab="4" style="padding:18px;display:none;">
            <textarea id="${modalId}-reacciones" style="width:100%;height:150px;"></textarea>
          </div>

          <!-- Legendarias -->
          <div class="tab-content" data-tab="5" style="padding:18px;display:none;">
            <textarea id="${modalId}-legendarias" style="width:100%;height:150px;"></textarea>
          </div>

          <!-- Míticas -->
          <div class="tab-content" data-tab="6" style="padding:18px;display:none;">
            <textarea id="${modalId}-miticas" style="width:100%;height:150px;"></textarea>
          </div>

          <!-- Hechizos -->
          <div class="tab-content" data-tab="7" style="padding:18px;display:none;">
            <textarea id="${modalId}-hechizos" style="width:100%;height:150px;"></textarea>
          </div>

          <!-- Otros -->
          <div class="tab-content" data-tab="8" style="padding:18px;display:none;">
            <label>Idiomas</label>
            <select id="${modalId}-idiomas" multiple style="width:100%;"></select><br><br>
            <label>Velocidades</label>
            <select id="${modalId}-velocidades" multiple style="width:100%;"></select><br><br>
            <label>Resistencias</label>
            <select id="${modalId}-resistencias" multiple style="width:100%;"></select><br><br>
            <label>Efectos Regionales</label>
            <textarea id="${modalId}-efectos" style="width:100%;height:80px;"></textarea>
          </div>
        </div>

        <div style="margin:14px;padding:10px;display:flex;justify-content:flex-end;">
          <button id="${modalId}-save" style="background:#31ba4f;color:white;font-weight:bold;padding:8px 20px;border:none;border-radius:7px;">Guardar</button>
        </div>
      </div>
    `;

    // rellenar selects
    llenarSelect(`${modalId}-tamanio`, datosDelJuego.tamanos);
    llenarSelect(`${modalId}-tipo`, datosDelJuego.tipos);
    llenarSelect(`${modalId}-alineamiento`, datosDelJuego.alineamientos);
    llenarSelect(`${modalId}-desc-arm`, datosDelJuego.armaduras);
    llenarSelect(`${modalId}-salvacion`, datosDelJuego.salvaciones);
    llenarSelect(`${modalId}-habilidad`, datosDelJuego.habilidades);
    llenarSelect(`${modalId}-idiomas`, datosDelJuego.idiomas);
    llenarSelect(`${modalId}-velocidades`, datosDelJuego.velocidades);
    llenarSelect(`${modalId}-resistencias`, datosDelJuego.resistencias);

    // tabs switching
    divContainer.querySelectorAll(".tab-btn").forEach(btn=>{
      btn.addEventListener("click", function(){
        const tabIndex = this.dataset.tab;
        divContainer.querySelectorAll(".tab-btn").forEach(b=>b.style.background="#181D2F");
        this.style.background = "#222844";
        divContainer.querySelectorAll(".tab-content").forEach(c=>c.style.display="none");
        divContainer.querySelector(`.tab-content[data-tab='${tabIndex}']`).style.display="block";
      });
    });

    document.getElementById(`${modalId}-close`).onclick = hide;
    document.getElementById(`${modalId}-save`).onclick = save;
  }

  function llenarSelect(id, arr) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';
    arr.forEach(opt => sel.add(new Option(opt, opt)));
  }

  function save() {
    if (criatura) onSave(criatura);
    hide();
  }
  function show(obj) {
    criatura = obj;
    document.getElementById(modalId).style.display="";
  }
  function hide() {
    document.getElementById(modalId).style.display="none";
  }

  if(btnOpen) btnOpen.addEventListener("click", function() {
    if (typeof config.getCriatura === 'function') {
      show(config.getCriatura());
    } else if (config.criatura) {
      show(config.criatura);
    }
  });

  crearModal();

  return { show, hide };
};
