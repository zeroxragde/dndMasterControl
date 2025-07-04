
function registrarToggle(botonId, modalId, mostrar = null) {
    const boton = document.getElementById(botonId);
    if (boton) {
      boton.addEventListener('click', () => {
        toggleModal(modalId, mostrar);
      });
    }
  }
  
  function toggleModal(id, mostrar = null) {
    const el = document.getElementById(id);
    if (!el) return;
  
    const visible = el.style.display === 'block' || el.style.display === 'flex';
    const nuevoEstado = mostrar !== null ? mostrar : !visible;
    el.style.display = nuevoEstado ? 'flex' : 'none';
  }
  
  function hacerModalMovible(modalId, headerSelector = '.modal-header') {
    const modal = document.getElementById(modalId);
    const header = modal.querySelector(headerSelector);
    if (!modal || !header) return;
  
    let initialX, initialY;
    let initialModalLeft, initialModalTop;
    
    function onMouseDown(e) {
      // Evita la selección de texto mientras se arrastra
      e.preventDefault(); 
      
      // Guarda la posición inicial del modal y del ratón
      initialModalLeft = modal.offsetLeft;
      initialModalTop = modal.offsetTop;
      initialX = e.clientX;
      initialY = e.clientY;
  
      // Establece la posición como absoluta para poder moverlo libremente
      modal.style.position = 'absolute';
      modal.style.zIndex = 1000;
  
      // Empieza a escuchar los eventos de movimiento y de soltar el clic
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  
    function onMouseMove(e) {
      // Calcula cuánto se ha movido el ratón desde el punto inicial
      const dx = e.clientX - initialX;
      const dy = e.clientY - initialY;
  
      // Aplica ese mismo cambio a la posición inicial del modal
      modal.style.left = `${initialModalLeft + dx}px`;
      modal.style.top = `${initialModalTop + dy}px`;
    }
  
    function onMouseUp() {
      // Deja de escuchar los eventos cuando se suelta el clic
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  
    // Activa todo el proceso cuando se hace clic en el encabezado
    header.addEventListener('mousedown', onMouseDown);
  }

  function mostrarTab(id, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
  }



  function filtrarCanciones() {
    const input = document.getElementById('buscadorCanciones');
    const filtro = input.value.toLowerCase();
    const items = document.querySelectorAll('#listaCanciones li');
  
    items.forEach(item => {
      const texto = item.textContent || item.innerText;
      item.style.display = texto.toLowerCase().includes(filtro) ? '' : 'none';
    });
  }
  

  
  // 🎵 Reproductor
  function cargarCancion() {
    if (!canciones.length) return;
    audio.src = canciones[indice];
    nombre.textContent = `🎵 ${canciones[indice].split(/[/\\\\]/).pop()}`;
  }
  
  function anteriorCancion() {
    if (!canciones.length) return;
    indice = (indice - 1 + canciones.length) % canciones.length;
    cargarCancion();
    audio.play();
  }
  
  function siguienteCancion() {
    if (!canciones.length) return;
    indice = (indice + 1) % canciones.length;
    cargarCancion();
    audio.play();
  }
  
  function togglePlay() {
    if (!audio.src) return;
    audio.paused ? audio.play() : audio.pause();
  }
  
  function ajustarVolumen(valor) {
    audio.volume = parseFloat(valor);
  }