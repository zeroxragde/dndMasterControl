window.EditorCreaturaModal = function(config) {
  const datosDelJuego = {
    tamanos: [ "Seleccionar Tamano", "Diminuto", "Pequeno", "Mediano", "Grande", "Enorme", "Gargantuesco" ],
    tipos: [ "Seleccionar Tipo", "Aberracion", "Bestia", "Celestial", "Constructo", "Dragon", "Elemental", "Feerico", "Engendro", "Constructo", "Gigante", "Humanoide", "Monstruosidad", "Limo", "Sombra", "Planta", "No muerto", "Otro" ],
    armaduras: [ "Seleccionar Armadura", "Ninguna", "Armadura Natural", "Armadura de Mago", "Acolchada", "Cuero", "Cuero Tachonado", "Oculta", "Camisa de Malla", "Armadura de Escamas", "Coraza", "Media Armadura", "Armadura de Anillos", "Cota de Malla", "Armadura Laminada", "Armadura Completa", "Otra" ],
    salvaciones: [ "Tirada de Salvacion", "Fuerza", "Destreza", "Constitucion", "Inteligencia", "Sabiduria", "Carisma" ],
    habilidades: [ "Habilidades", "Acrobacias", "Trato con Animales", "Arcanos", "Atletismo", "Engano", "Historia", "Perspicacia", "Intimidacion", "Investigacion", "Medicina", "Naturaleza", "Percepcion", "Interpretacion", "Persuasion", "Religion", "Juego de Manos", "Sigilo", "Supervivencia" ],
    alineamientos:[ "Seleccionar Alineamiento", "Legal Bueno", "Neutral Bueno", "Caotico Bueno", "Legal Neutral", "Neutral", "Caotico Neutral", "Legal Malvado", "Neutral Malvado", "Caotico Malvado" ]
  };

  const divContainer = document.getElementById(config.containerId);
  const btnOpen = document.getElementById(config.triggerBtnId);
  const onSave = typeof config.onSave === "function" ? config.onSave : function(){};

  let criatura = null;
  const modalId = "modal-creatura-" + Math.floor(Math.random()*100000);

  function crearModal() {
    divContainer.innerHTML = `
      <div id="${modalId}" style="display:none;position:fixed;top:6vh;left:50%;transform:translateX(-50%);background:#181D2F;padding:22px 30px;border-radius:18px;box-shadow:0 0 22px #000a;min-width:650px;z-index:2000;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h2 style="margin:0;">Editor de Criatura</h2>
          <button id="${modalId}-close" style="font-size:1.3em;background:none;border:none;color:#fff;">✕</button>
        </div>
        <div style="margin-top:10px;display:flex;gap:30px;">
          <div style="flex:2">
            <label>Nombre <input id="${modalId}-nombre" style="width:99%" /></label>
            <div style="display:flex; gap:7px; margin:12px 0;">
              <select id="${modalId}-tamanio"></select>
              <select id="${modalId}-tipo"></select>
              <select id="${modalId}-alineamiento"></select>
            </div>
            <label>Clase de Armadura <input id="${modalId}-ac" type="number" style="width:80px"/></label>
            <label>Descripción Armadura <select id="${modalId}-desc-arm"></select></label>
            <label>Puntos de Golpe <input id="${modalId}-hp" type="number" style="width:80px"/></label>
            <label>Dados Golpe <input id="${modalId}-hp-dados" style="width:120px"/></label>
          </div>
          <div style="flex:1">
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:3px;">
              ${['Fuerza','Destreza','Constitucion','Inteligencia','Sabiduria','Carisma'].map(stat=>`
                <label>${stat}
                  <input id="${modalId}-${stat.toLowerCase()}" type="number" min="1" max="30" style="width:48px;"/>
                  <span id="${modalId}-bonus-${stat.toLowerCase()}" style="margin-left:3px;"></span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>
        <div style="margin:16px 0; display:flex; gap:40px">
          <div>
            <label>Tiradas de Salvación</label>
            <div style="display:flex;align-items:center;gap:6px;">
              <select id="${modalId}-salvacion"></select>
              <button id="${modalId}-add-salvacion">Añadir</button>
            </div>
            <ul id="${modalId}-panel-salvacion" style="padding:0;list-style:none;min-height:28px;margin:5px 0 0 0;"></ul>
          </div>
          <div>
            <label>Habilidades</label>
            <div style="display:flex;align-items:center;gap:5px;">
              <select id="${modalId}-habilidad"></select>
              <button id="${modalId}-add-habilidad-comp">Comp</button>
              <button id="${modalId}-add-habilidad-exp">Exp</button>
            </div>
            <ul id="${modalId}-panel-habilidad" style="padding:0;list-style:none;min-height:28px;margin:5px 0 0 0;"></ul>
          </div>
        </div>
        <div style="margin-top:18px;display:flex;gap:12px;justify-content:flex-end;">
          <button id="${modalId}-save" style="background:#31ba4f;color:white;font-weight:bold;padding:6px 22px;border:none;border-radius:7px;">Guardar</button>
        </div>
      </div>
    `;

    llenarSelect(`${modalId}-tamanio`, datosDelJuego.tamanos);
    llenarSelect(`${modalId}-tipo`, datosDelJuego.tipos);
    llenarSelect(`${modalId}-alineamiento`, datosDelJuego.alineamientos);
    llenarSelect(`${modalId}-desc-arm`, datosDelJuego.armaduras);
    llenarSelect(`${modalId}-salvacion`, datosDelJuego.salvaciones);
    llenarSelect(`${modalId}-habilidad`, datosDelJuego.habilidades);

    // Cerrar modal
    document.getElementById(`${modalId}-close`).onclick = hide;
    document.getElementById(`${modalId}-save`).onclick = save;

    attachInputs();
    document.getElementById(`${modalId}-add-salvacion`).onclick = addSalvacion;
    document.getElementById(`${modalId}-add-habilidad-comp`).onclick = function(){ addHabilidad("competente"); };
    document.getElementById(`${modalId}-add-habilidad-exp`).onclick = function(){ addHabilidad("experto"); };
  }

  function llenarSelect(id, arr) {
    var sel = document.getElementById(id);
    if (!sel || !arr) return;
    sel.innerHTML = '';
    arr.forEach(opt => sel.add(new Option(opt, opt)));
  }

  function syncToForm() {
    if (!criatura) return;
    document.getElementById(`${modalId}-nombre`).value = criatura.Nombre || '';
    document.getElementById(`${modalId}-tamanio`).value = criatura.Tamanio || '';
    document.getElementById(`${modalId}-tipo`).value = criatura.Tipo || '';
    document.getElementById(`${modalId}-alineamiento`).value = criatura.Alineamiento || '';
    document.getElementById(`${modalId}-ac`).value = criatura.ClaseArmadura || '';
    document.getElementById(`${modalId}-desc-arm`).value = criatura.DescripcionArmadura || '';
    document.getElementById(`${modalId}-hp`).value = criatura.PuntosGolpe || '';
    document.getElementById(`${modalId}-hp-dados`).value = criatura.DadosGolpe || '';
    ['fuerza','destreza','constitucion','inteligencia','sabiduria','carisma'].forEach(stat=>{
      document.getElementById(`${modalId}-${stat}`).value = criatura[stat.charAt(0).toUpperCase() + stat.slice(1)] || '';
      updateBonus(stat);
    });
    renderPanelSalvacion();
    renderPanelHabilidad();
  }

  function attachInputs() {
    document.getElementById(`${modalId}-nombre`).oninput = e => criatura && (criatura.Nombre = e.target.value);
    document.getElementById(`${modalId}-tamanio`).onchange = e => criatura && (criatura.Tamanio = e.target.value);
    document.getElementById(`${modalId}-tipo`).onchange = e => criatura && (criatura.Tipo = e.target.value);
    document.getElementById(`${modalId}-alineamiento`).onchange = e => criatura && (criatura.Alineamiento = e.target.value);
    document.getElementById(`${modalId}-ac`).oninput = e => criatura && (criatura.ClaseArmadura = parseInt(e.target.value,10)||0);
    document.getElementById(`${modalId}-desc-arm`).onchange = e => criatura && (criatura.DescripcionArmadura = e.target.value);
    document.getElementById(`${modalId}-hp`).oninput = e => criatura && (criatura.PuntosGolpe = parseInt(e.target.value,10)||0);
    document.getElementById(`${modalId}-hp-dados`).oninput = e => criatura && (criatura.DadosGolpe = e.target.value);
    ['fuerza','destreza','constitucion','inteligencia','sabiduria','carisma'].forEach(stat=>{
      document.getElementById(`${modalId}-${stat}`).oninput = e => {
        if (!criatura) return;
        criatura[stat.charAt(0).toUpperCase() + stat.slice(1)] = parseInt(e.target.value,10)||0;
        updateBonus(stat);
      };
    });
  }

  function updateBonus(stat) {
    var val = parseInt(document.getElementById(`${modalId}-${stat}`).value,10)||0;
    var bonus = (val>0)?((val-10)/2)|0:0;
    document.getElementById(`${modalId}-bonus-${stat}`).textContent = (bonus>=0?"+":"")+bonus;
    if (criatura) criatura["Bonificador"+stat.charAt(0).toUpperCase()+stat.slice(1)] = bonus;
  }

  function addSalvacion() {
    var sel = document.getElementById(`${modalId}-salvacion`);
    var val = sel.value;
    if (!val || val === datosDelJuego.salvaciones[0] || !criatura) return;
    if (!criatura.Salvacion.includes(val)) {
      criatura.Salvacion.push(val);
      renderPanelSalvacion();
    }
  }

  function renderPanelSalvacion() {
    var panel = document.getElementById(`${modalId}-panel-salvacion`);
    panel.innerHTML = '';
    if (!criatura || !Array.isArray(criatura.Salvacion)) return;
    criatura.Salvacion.forEach(function(s, idx) {
      var li = document.createElement('li');
      li.textContent = s + " ";
      var btn = document.createElement('button');
      btn.textContent = '×';
      btn.style.marginLeft = '5px';
      btn.onclick = function() {
        criatura.Salvacion.splice(idx,1);
        renderPanelSalvacion();
      };
      li.appendChild(btn);
      panel.appendChild(li);
    });
  }

  function addHabilidad(tipo) {
    var sel = document.getElementById(`${modalId}-habilidad`);
    var val = sel.value;
    if (!val || val === datosDelJuego.habilidades[0] || !criatura) return;
    if (!criatura.Habilidades[val] || criatura.Habilidades[val] !== tipo) {
      criatura.Habilidades[val] = tipo;
      renderPanelHabilidad();
    }
  }

  function renderPanelHabilidad() {
    var panel = document.getElementById(`${modalId}-panel-habilidad`);
    panel.innerHTML = '';
    if (!criatura || typeof criatura.Habilidades !== "object") return;
    Object.keys(criatura.Habilidades).forEach(function(hab){
      var tipo = criatura.Habilidades[hab];
      var li = document.createElement('li');
      li.textContent = hab + " (" + (tipo === "competente" ? "Comp" : "Exp") + ")";
      var btn = document.createElement('button');
      btn.textContent = '×';
      btn.style.marginLeft = '5px';
      btn.onclick = function() {
        delete criatura.Habilidades[hab];
        renderPanelHabilidad();
      };
      li.appendChild(btn);
      panel.appendChild(li);
    });
  }

  function save() {
    if (criatura) onSave(criatura);
    hide();
  }

  function show(objetoCreatura) {
    if (!objetoCreatura) return;
    criatura = objetoCreatura;
    syncToForm();
    document.getElementById(modalId).style.display = "";
  }
  function hide() {
    document.getElementById(modalId).style.display = "none";
  }

  if(btnOpen) btnOpen.addEventListener("click", function() {
    if (typeof config.getCriatura === 'function') {
      show(config.getCriatura());
    } else if (config.criatura) {
      show(config.criatura);
    }
  });

  crearModal();

  // API pública
  return {
    show: show,
    hide: hide,
    refresh: syncToForm
  };
};
