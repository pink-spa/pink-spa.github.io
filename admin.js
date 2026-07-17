// ============================================================
// admin.js - Panel con autenticación real de Supabase
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // --- Elementos DOM ---
  const loginForm = document.getElementById('loginForm');
  const adminPanel = document.getElementById('adminPanel');
  const loginFormElement = document.getElementById('loginFormElement');
  const loginError = document.getElementById('loginError');
  const logoutBtns = document.querySelectorAll('#logoutBtn, #logoutBtnMobile, #logoutBtnAdmin');
  const tabs = document.querySelectorAll('.admin-tab');
  const tabContents = {
    servicios: document.getElementById('tabServicios'),
    promociones: document.getElementById('tabPromociones'),
    promoMes: document.getElementById('tabPromoMes')
  };
  const serviciosList = document.getElementById('serviciosList');
  const promocionesList = document.getElementById('promocionesList');
  const nuevoServicioBtn = document.getElementById('nuevoServicioBtn');
  const nuevaPromoBtn = document.getElementById('nuevaPromoBtn');
  const editarPromoMesBtn = document.getElementById('editarPromoMesBtn');

  // --- Modal ---
  const modal = document.getElementById('modalForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalFormElement = document.getElementById('modalFormElement');
  const modalTipo = document.getElementById('modalTipo');
  const modalId = document.getElementById('modalId');
  const modalTitulo = document.getElementById('modalTitulo');
  const modalDescripcion = document.getElementById('modalDescripcion');
  const modalImagen = document.getElementById('modalImagen');
  const modalImagenPreview = document.getElementById('modalImagenPreview');
  const modalImagenPreviewImg = document.getElementById('modalImagenPreviewImg');
  const modalQuitarImagen = document.getElementById('modalQuitarImagen');
  const modalIcono = document.getElementById('modalIcono');
  const iconPreview = document.getElementById('iconPreview');
  const iconGrid = document.getElementById('iconGrid');
  const modalDestacado = document.getElementById('modalDestacado');
  const modalOrden = document.getElementById('modalOrden');
  const modalDescuento = document.getElementById('modalDescuento');
  const modalFechaInicio = document.getElementById('modalFechaInicio');
  const modalFechaFin = document.getElementById('modalFechaFin');
  const modalMensaje = document.getElementById('modalMensaje');
  const camposServicio = document.getElementById('modalCamposServicio');
  const camposPromocion = document.getElementById('modalCamposPromocion');

  // --- Estado del modal ---
  let currentTipo = 'servicio';
  let currentId = null;
  let currentImageUrl = null;

  // ============================================================
  // LISTA DE ICONOS (Material Symbols)
  // ============================================================
  const ICONOS = [
    'spa', 'face', 'self_care', 'health_and_beauty', 'makeup', 'hair',
    'manicure', 'pedicure', 'massage', 'facial', 'skin', 'lipstick',
    'perfume', 'bath', 'shower', 'body', 'hands', 'feet', 'nails',
    'brush', 'comb', 'scissors', 'razor', 'beauty', 'cosmetics',
    'cream', 'lotion', 'oil', 'fragrance', 'deodorant', 'shampoo',
    'conditioner', 'soap', 'towel', 'robe', 'slippers', 'mirror',
    'light', 'candle', 'flower', 'leaf', 'water', 'bubbles', 'steam',
    'sauna', 'hot_tub', 'pool', 'sun', 'moon', 'star', 'heart',
    'favorite', 'celebration', 'spa_wellness', 'relax', 'peace',
    'balance', 'energy', 'vitality', 'renew', 'refresh'
  ];

  // ============================================================
  // GALERÍA DE ICONOS
  // ============================================================
  function renderIconGrid(selectedIcon = 'spa') {
    iconGrid.innerHTML = ICONOS.map(icon => `
      <div class="icon-option cursor-pointer p-2 text-center rounded-lg hover:bg-surface-container-high transition-colors ${icon === selectedIcon ? 'bg-primary/20' : ''}"
           data-icon="${icon}">
        <span class="material-symbols-outlined text-2xl">${icon}</span>
        <span class="text-[10px] block truncate">${icon}</span>
      </div>
    `).join('');

    iconGrid.querySelectorAll('.icon-option').forEach(el => {
      el.addEventListener('click', () => {
        const icon = el.dataset.icon;
        modalIcono.value = icon;
        iconPreview.textContent = icon;
        iconGrid.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('bg-primary/20'));
        el.classList.add('bg-primary/20');
      });
    });
  }

  modalIcono.addEventListener('input', () => {
    const val = modalIcono.value.trim();
    iconPreview.textContent = val || 'spa';
    iconGrid.querySelectorAll('.icon-option').forEach(el => {
      el.classList.toggle('bg-primary/20', el.dataset.icon === val);
    });
  });

  renderIconGrid('spa');

  // ============================================================
  // AUTENTICACIÓN CON SUPABASE (LOGIN REAL)
  // ============================================================
  // Verificar sesión al cargar
  async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      loginForm.classList.add('hidden');
      adminPanel.classList.remove('hidden');
      cargarTodosLosDatos();
    } else {
      loginForm.classList.remove('hidden');
      adminPanel.classList.add('hidden');
    }
  }

  // Login con Supabase Auth
  loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        loginForm.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loginError.classList.add('hidden');
        cargarTodosLosDatos();
      } else {
        loginError.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Error de login:', err);
      loginError.classList.remove('hidden');
      loginError.textContent = err.message || 'Credenciales incorrectas. Intenta de nuevo.';
    }
  });

  // Logout con Supabase
  async function logout() {
    await supabaseClient.auth.signOut();
    adminPanel.classList.add('hidden');
    loginForm.classList.remove('hidden');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    loginError.classList.add('hidden');
  }

  logoutBtns.forEach(btn => {
    btn.addEventListener('click', logout);
  });

  // ============================================================
  // TABS
  // ============================================================
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      Object.keys(tabContents).forEach(key => {
        tabContents[key].classList.toggle('hidden', key !== tabName);
      });
    });
  });

  // ============================================================
  // FUNCIONES DE CARGA (con manejo de sesión)
  // ============================================================
  async function cargarTodosLosDatos() {
    await cargarServicios();
    await cargarPromociones();
    await cargarPromoMes();
  }

  async function cargarServicios() {
    try {
      const { data, error } = await supabaseClient
        .from('servicios')
        .select('*')
        .order('orden', { ascending: true, nullsFirst: false });
      if (error) throw error;
      if (data && data.length > 0) {
        serviciosList.innerHTML = data.map(serv => `
          <div class="admin-card bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-2">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2">
                ${serv.icono ? `<span class="material-symbols-outlined text-primary">${serv.icono}</span>` : ''}
                <h4 class="font-bold text-lg">${serv.titulo}</h4>
              </div>
              <div class="flex gap-2">
                <button class="editar-servicio text-primary" data-id="${serv.id}">
                  <span class="material-symbols-outlined text-sm">edit</span>
                </button>
                <button class="eliminar-servicio text-error" data-id="${serv.id}">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
            <p class="text-sm text-on-surface-variant">${serv.descripcion || ''}</p>
            <div class="flex flex-wrap gap-2 text-xs">
              ${serv.destacado ? '<span class="bg-primary/10 text-primary px-2 py-1 rounded-full">Destacado</span>' : ''}
              ${serv.orden !== null ? `<span class="text-on-surface-variant">Orden: ${serv.orden}</span>` : ''}
            </div>
            ${serv.imagen_url ? `<img src="${serv.imagen_url}" alt="${serv.titulo}" class="h-20 w-full object-cover rounded-lg mt-1" />` : ''}
          </div>
        `).join('');
        document.querySelectorAll('.editar-servicio').forEach(btn => {
          btn.addEventListener('click', () => abrirModalEditar('servicio', btn.dataset.id));
        });
        document.querySelectorAll('.eliminar-servicio').forEach(btn => {
          btn.addEventListener('click', () => eliminarRegistro('servicio', btn.dataset.id));
        });
      } else {
        serviciosList.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">No hay servicios registrados.</p>';
      }
    } catch (err) {
      console.error('Error cargando servicios:', err);
      serviciosList.innerHTML = '<p class="col-span-full text-center text-error">Error al cargar servicios.</p>';
    }
  }

  async function cargarPromociones() {
    try {
      const { data, error } = await supabaseClient
        .from('promociones')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        promocionesList.innerHTML = data.map(promo => `
          <div class="admin-card bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col gap-2">
            <div class="flex justify-between items-start">
              <h4 class="font-bold text-lg">${promo.titulo}</h4>
              <div class="flex gap-2">
                <button class="editar-promocion text-primary" data-id="${promo.id}">
                  <span class="material-symbols-outlined text-sm">edit</span>
                </button>
                <button class="eliminar-promocion text-error" data-id="${promo.id}">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
            <p class="text-sm text-on-surface-variant">${promo.descripcion || ''}</p>
            <div class="flex flex-wrap gap-2 text-xs">
              ${promo.descuento ? `<span class="bg-primary text-white px-2 py-1 rounded-full">${promo.descuento}</span>` : ''}
              ${promo.fecha_inicio ? `<span>Desde: ${new Date(promo.fecha_inicio).toLocaleDateString()}</span>` : ''}
              ${promo.fecha_fin ? `<span>Hasta: ${new Date(promo.fecha_fin).toLocaleDateString()}</span>` : ''}
            </div>
            ${promo.imagen_url ? `<img src="${promo.imagen_url}" alt="${promo.titulo}" class="h-20 w-full object-cover rounded-lg mt-1" />` : ''}
          </div>
        `).join('');
        document.querySelectorAll('.editar-promocion').forEach(btn => {
          btn.addEventListener('click', () => abrirModalEditar('promocion', btn.dataset.id));
        });
        document.querySelectorAll('.eliminar-promocion').forEach(btn => {
          btn.addEventListener('click', () => eliminarRegistro('promocion', btn.dataset.id));
        });
      } else {
        promocionesList.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">No hay promociones registradas.</p>';
      }
    } catch (err) {
      console.error('Error cargando promociones:', err);
      promocionesList.innerHTML = '<p class="col-span-full text-center text-error">Error al cargar promociones.</p>';
    }
  }

  async function cargarPromoMes() {
    try {
      const { data, error } = await supabaseClient
        .from('promo_mes')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;

      const vista = document.getElementById('promoMesVista');
      const titulo = document.getElementById('pm_vista_titulo');
      const desc = document.getElementById('pm_vista_descripcion');
      const fechas = document.getElementById('pm_vista_fechas');
      const imagen = document.getElementById('pm_vista_imagen');
      const mensaje = document.getElementById('pm_mensaje');

      if (data) {
        titulo.textContent = data.titulo || 'Sin título';
        desc.textContent = data.descripcion || 'Sin descripción';
        fechas.textContent = `Fechas: ${data.fecha_inicio ? new Date(data.fecha_inicio).toLocaleDateString() : ''} ${data.fecha_fin ? ' - ' + new Date(data.fecha_fin).toLocaleDateString() : ''}`;
        imagen.src = data.imagen_url || 'https://via.placeholder.com/800x400?text=Promoción+del+Mes';
        imagen.alt = data.titulo || 'Promoción del mes';
        mensaje.textContent = data.activo ? '✅ Activa' : '❌ Inactiva';
        let hiddenId = document.getElementById('pm_id_actual');
        if (!hiddenId) {
          hiddenId = document.createElement('input');
          hiddenId.type = 'hidden';
          hiddenId.id = 'pm_id_actual';
          document.getElementById('promoMesCard').appendChild(hiddenId);
        }
        hiddenId.value = data.id;
      } else {
        titulo.textContent = 'No hay promoción del mes configurada';
        desc.textContent = 'Haz clic en "Editar" para crear una.';
        fechas.textContent = '';
        imagen.src = 'https://via.placeholder.com/800x400?text=Sin+promoción';
        mensaje.textContent = '';
        const hiddenId = document.getElementById('pm_id_actual');
        if (hiddenId) hiddenId.value = '';
      }
    } catch (err) {
      console.error('Error cargando promoción del mes:', err);
      document.getElementById('pm_mensaje').textContent = 'Error al cargar la promoción del mes.';
    }
  }

  // ============================================================
  // ELIMINAR REGISTRO
  // ============================================================
  async function eliminarRegistro(tipo, id) {
    if (!confirm(`¿Eliminar este ${tipo}?`)) return;
    const tabla = tipo === 'servicio' ? 'servicios' : 'promociones';
    try {
      const { error } = await supabaseClient.from(tabla).delete().eq('id', id);
      if (error) throw error;
      if (tipo === 'servicio') await cargarServicios();
      else await cargarPromociones();
    } catch (err) {
      console.error('Error eliminando:', err);
      alert('Error al eliminar.');
    }
  }

  // ============================================================
  // ABRIR MODAL
  // ============================================================
  function abrirModalEditar(tipo, id = null) {
    currentTipo = tipo;
    currentId = id;
    modalMensaje.textContent = '';
    modal.classList.remove('hidden');

    if (tipo === 'servicio') {
      camposServicio.classList.remove('hidden');
      camposPromocion.classList.add('hidden');
      document.querySelector('#modalCamposPromocion > div:first-child').style.display = 'block';
      modalTitle.textContent = id ? 'Editar servicio' : 'Nuevo servicio';
    } else if (tipo === 'promocion') {
      camposServicio.classList.add('hidden');
      camposPromocion.classList.remove('hidden');
      document.querySelector('#modalCamposPromocion > div:first-child').style.display = 'block';
      modalTitle.textContent = id ? 'Editar promoción' : 'Nueva promoción';
    } else if (tipo === 'promomes') {
      camposServicio.classList.add('hidden');
      camposPromocion.classList.remove('hidden');
      document.querySelector('#modalCamposPromocion > div:first-child').style.display = 'none';
      modalTitle.textContent = id ? 'Editar promoción del mes' : 'Crear promoción del mes';
    }

    modalFormElement.reset();
    modalImagenPreview.classList.add('hidden');
    modalQuitarImagen.classList.add('hidden');
    modalImagen.value = '';
    modalDescuento.value = '';
    modalFechaInicio.value = '';
    modalFechaFin.value = '';
    modalIcono.value = '';
    modalDestacado.value = 'false';
    modalOrden.value = '0';
    modalId.value = id || '';
    modalTipo.value = tipo;
    iconPreview.textContent = 'spa';
    renderIconGrid('spa');

    if (id) {
      cargarDatosEnModal(tipo, id);
    } else {
      currentImageUrl = null;
    }
  }

  async function cargarDatosEnModal(tipo, id) {
    const tabla = tipo === 'servicio' ? 'servicios' : (tipo === 'promocion' ? 'promociones' : 'promo_mes');
    try {
      const { data, error } = await supabaseClient.from(tabla).select('*').eq('id', id).single();
      if (error) throw error;
      if (!data) return;

      modalTitulo.value = data.titulo || '';
      modalDescripcion.value = data.descripcion || '';
      currentImageUrl = data.imagen_url || null;
      if (currentImageUrl) {
        modalImagenPreview.classList.remove('hidden');
        modalImagenPreviewImg.src = currentImageUrl;
        modalQuitarImagen.classList.remove('hidden');
      } else {
        modalImagenPreview.classList.add('hidden');
        modalQuitarImagen.classList.add('hidden');
      }

      if (tipo === 'servicio') {
        modalIcono.value = data.icono || '';
        iconPreview.textContent = data.icono || 'spa';
        renderIconGrid(data.icono || 'spa');
        modalDestacado.value = data.destacado ? 'true' : 'false';
        modalOrden.value = data.orden || 0;
      } else if (tipo === 'promocion') {
        modalDescuento.value = data.descuento || '';
        modalFechaInicio.value = data.fecha_inicio || '';
        modalFechaFin.value = data.fecha_fin || '';
      } else if (tipo === 'promomes') {
        modalFechaInicio.value = data.fecha_inicio || '';
        modalFechaFin.value = data.fecha_fin || '';
      }
    } catch (err) {
      console.error('Error cargando datos para editar:', err);
      modalMensaje.textContent = 'Error al cargar los datos.';
    }
  }

  // ============================================================
  // GUARDAR
  // ============================================================
  modalFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    modalMensaje.textContent = '';

    const tipo = modalTipo.value;
    const id = modalId.value;
    const titulo = modalTitulo.value.trim();
    const descripcion = modalDescripcion.value.trim();
    const imagenFile = modalImagen.files[0];
    let imagenUrl = currentImageUrl;

    if (imagenFile) {
      try {
        const fileExt = imagenFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;
        const { error: uploadError } = await supabaseClient.storage
          .from('imagenes')
          .upload(filePath, imagenFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabaseClient.storage
          .from('imagenes')
          .getPublicUrl(filePath);
        imagenUrl = urlData.publicUrl;
      } catch (err) {
        console.error('Error subiendo imagen:', err);
        modalMensaje.textContent = 'Error al subir la imagen.';
        return;
      }
    }

    let dataObj = { titulo, descripcion, imagen_url: imagenUrl };

    if (tipo === 'servicio') {
      dataObj.icono = modalIcono.value.trim();
      dataObj.destacado = modalDestacado.value === 'true';
      dataObj.orden = parseInt(modalOrden.value) || 0;
    } else if (tipo === 'promocion') {
      dataObj.descuento = modalDescuento.value.trim();
      dataObj.fecha_inicio = modalFechaInicio.value || null;
      dataObj.fecha_fin = modalFechaFin.value || null;
    } else if (tipo === 'promomes') {
      dataObj.fecha_inicio = modalFechaInicio.value || null;
      dataObj.fecha_fin = modalFechaFin.value || null;
      dataObj.activo = true;
    }

    const tabla = tipo === 'servicio' ? 'servicios' : (tipo === 'promocion' ? 'promociones' : 'promo_mes');

    try {
      let result;
      if (id) {
        result = await supabaseClient.from(tabla).update(dataObj).eq('id', id);
      } else {
        result = await supabaseClient.from(tabla).insert(dataObj);
      }
      if (result.error) throw result.error;

      modal.classList.add('hidden');
      if (tipo === 'servicio') await cargarServicios();
      else if (tipo === 'promocion') await cargarPromociones();
      else if (tipo === 'promomes') await cargarPromoMes();
    } catch (err) {
      console.error('Error guardando:', err);
      modalMensaje.textContent = 'Error al guardar.';
    }
  });

  // ============================================================
  // CERRAR MODAL
  // ============================================================
  const cerrarModal = () => modal.classList.add('hidden');
  modalCloseBtn.addEventListener('click', cerrarModal);
  modalCancelBtn.addEventListener('click', cerrarModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  modalQuitarImagen.addEventListener('click', () => {
    currentImageUrl = null;
    modalImagenPreview.classList.add('hidden');
    modalQuitarImagen.classList.add('hidden');
    modalImagen.value = '';
  });

  modalImagen.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        modalImagenPreview.classList.remove('hidden');
        modalImagenPreviewImg.src = ev.target.result;
        modalQuitarImagen.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  // ============================================================
  // BOTONES NUEVO/EDITAR
  // ============================================================
  nuevoServicioBtn.addEventListener('click', () => abrirModalEditar('servicio'));
  nuevaPromoBtn.addEventListener('click', () => abrirModalEditar('promocion'));
  editarPromoMesBtn.addEventListener('click', () => {
    const hiddenId = document.getElementById('pm_id_actual');
    const id = hiddenId ? hiddenId.value : null;
    abrirModalEditar('promomes', id || null);
  });

  // ============================================================
  // INICIALIZAR: verificar sesión al cargar
  // ============================================================
  await checkSession();
});
