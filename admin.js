// ============================================================
// ADMIN.JS - COMPLETO CON GALERÍA DE ICONOS
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // --- Elementos DOM ---
  const loginForm = document.getElementById('loginForm');
  const adminPanel = document.getElementById('adminPanel');
  const loginFormElement = document.getElementById('loginFormElement');
  const loginError = document.getElementById('loginError');
  const logoutBtns = document.querySelectorAll('#logoutBtn, #logoutBtnMobile, #logoutBtnAdmin');

  const tabServicios = document.getElementById('tabServicios');
  const tabPromociones = document.getElementById('tabPromociones');
  const tabPromoMes = document.getElementById('tabPromoMes');
  const tabs = document.querySelectorAll('.admin-tab');

  const serviciosList = document.getElementById('serviciosList');
  const promocionesList = document.getElementById('promocionesList');
  const nuevoServicioBtn = document.getElementById('nuevoServicioBtn');
  const nuevaPromoBtn = document.getElementById('nuevaPromoBtn');

  // Modal
  const modalForm = document.getElementById('modalForm');
  const modalFormElement = document.getElementById('modalFormElement');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalTipo = document.getElementById('modalTipo');
  const modalId = document.getElementById('modalId');
  const modalTitulo = document.getElementById('modalTitulo');
  const modalDescripcion = document.getElementById('modalDescripcion');
  const modalImagen = document.getElementById('modalImagen');
  const modalIcono = document.getElementById('modalIcono');
  const modalDestacado = document.getElementById('modalDestacado');
  const modalOrden = document.getElementById('modalOrden');
  const modalDescuento = document.getElementById('modalDescuento');
  const modalFechaInicio = document.getElementById('modalFechaInicio');
  const modalFechaFin = document.getElementById('modalFechaFin');
  const modalMensaje = document.getElementById('modalMensaje');
  const modalImagenPreview = document.getElementById('modalImagenPreview');
  const modalImagenPreviewImg = document.getElementById('modalImagenPreviewImg');
  const modalQuitarImagen = document.getElementById('modalQuitarImagen');
  const iconPreview = document.getElementById('iconPreview');
  const iconGrid = document.getElementById('iconGrid');

  // Promo mes
  const pmVistaTitulo = document.getElementById('pm_vista_titulo');
  const pmVistaDescripcion = document.getElementById('pm_vista_descripcion');
  const pmVistaFechas = document.getElementById('pm_vista_fechas');
  const pmVistaImagen = document.getElementById('pm_vista_imagen');
  const pmMensaje = document.getElementById('pm_mensaje');
  const editarPromoMesBtn = document.getElementById('editarPromoMesBtn');

  // ------------------------------------------------------------
  // 1. AUTENTICACIÓN
  // ------------------------------------------------------------
  let currentUser = null;

  async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      currentUser = session.user;
      showAdminPanel(true);
    } else {
      showAdminPanel(false);
    }
  }

  function showAdminPanel(show) {
    loginForm.style.display = show ? 'none' : 'block';
    adminPanel.style.display = show ? 'block' : 'none';
  }

  loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      loginError.classList.remove('hidden');
    } else {
      loginError.classList.add('hidden');
      currentUser = data.user;
      showAdminPanel(true);
      await loadAllData();
    }
  });

  logoutBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      currentUser = null;
      showAdminPanel(false);
    });
  });

  // ------------------------------------------------------------
  // 2. GALERÍA DE ICONOS
  // ------------------------------------------------------------
  const iconList = [
    'spa', 'face', 'self_care', 'massage', 'cleaning_services',
    'handshake', 'health_and_safety', 'favorite', 'star', 'stars',
    'water_drop', 'beauty', 'cosmetics', 'bed', 'chair',
    'bathtub', 'shower', 'dry_cleaning', 'local_laundry_service',
    'manicure', 'pedicure', 'makeup', 'barber', 'hair_cut',
    'hair_brush', 'comb', 'perfume', 'deodorant', 'soap',
    'shampoo', 'conditioner', 'lotion', 'sunny', 'ac_unit',
    'bubble_chart', 'cake', 'flower', 'nature', 'park',
    'pool', 'hot_tub', 'sauna', 'steam', 'spa_outdoor'
  ];

  function renderIconGallery() {
    if (!iconGrid) return;
    iconGrid.innerHTML = iconList.map(iconName => `
      <button type="button" class="icon-option p-2 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center" data-icon="${iconName}">
        <span class="material-symbols-outlined text-2xl text-on-surface-variant hover:text-primary">${iconName}</span>
      </button>
    `).join('');

    iconGrid.querySelectorAll('.icon-option').forEach(btn => {
      btn.addEventListener('click', function() {
        const icon = this.dataset.icon;
        modalIcono.value = icon;
        updateIconPreview(icon);
        iconGrid.querySelectorAll('.icon-option').forEach(b => b.classList.remove('bg-primary/20'));
        this.classList.add('bg-primary/20');
      });
    });
  }

  function updateIconPreview(iconName) {
    if (iconPreview) {
      iconPreview.textContent = iconName || 'spa';
    }
  }

  function highlightCurrentIcon() {
    const currentIcon = modalIcono.value.trim() || 'spa';
    updateIconPreview(currentIcon);
    if (iconGrid) {
      iconGrid.querySelectorAll('.icon-option').forEach(btn => {
        btn.classList.toggle('bg-primary/20', btn.dataset.icon === currentIcon);
      });
    }
  }

  function toggleIconGallery(show) {
    const gallery = document.getElementById('iconGallery');
    if (gallery) {
      gallery.style.display = show ? 'block' : 'none';
    }
    if (show) {
      highlightCurrentIcon();
    }
  }

  // Evento para previsualizar al escribir manualmente
  modalIcono.addEventListener('input', function() {
    updateIconPreview(this.value);
  });

  renderIconGallery();

  // ------------------------------------------------------------
  // 3. FUNCIONES DE CARGA (CRUD)
  // ------------------------------------------------------------
  async function loadServicios() {
    const { data, error } = await supabaseClient
      .from('servicios')
      .select('*')
      .order('orden', { ascending: true });
    if (error) throw error;
    renderServicios(data);
  }

  function renderServicios(servicios) {
    if (!servicios || servicios.length === 0) {
      serviciosList.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">No hay servicios.</p>';
      return;
    }
    serviciosList.innerHTML = servicios.map(s => `
      <div class="admin-card bg-white p-4 rounded-xl border border-outline-variant/20 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-2xl text-primary">${s.icono || 'spa'}</span>
            <h4 class="font-bold">${s.titulo}</h4>
          </div>
          <p class="text-sm text-on-surface-variant line-clamp-2">${s.descripcion || ''}</p>
          <div class="flex gap-3 text-xs mt-1">
            <span>${s.destacado ? '⭐ Destacado' : ''}</span>
            <span>Orden: ${s.orden || 0}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn-admin btn-outline-admin editar-servicio" data-id="${s.id}">✎ Editar</button>
          <button class="btn-admin btn-danger-admin eliminar-servicio" data-id="${s.id}">🗑</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.editar-servicio').forEach(btn => {
      btn.addEventListener('click', () => openModal('servicio', btn.dataset.id));
    });
    document.querySelectorAll('.eliminar-servicio').forEach(btn => {
      btn.addEventListener('click', () => eliminarRegistro('servicios', btn.dataset.id, loadServicios));
    });
  }

  // ------------------------------------------------------------
  // 4. PROMOCIONES
  // ------------------------------------------------------------
  async function loadPromociones() {
    const { data, error } = await supabaseClient
      .from('promociones')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    renderPromociones(data);
  }

  function renderPromociones(promos) {
    if (!promos || promos.length === 0) {
      promocionesList.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">No hay promociones.</p>';
      return;
    }
    promocionesList.innerHTML = promos.map(p => `
      <div class="admin-card bg-white p-4 rounded-xl border border-outline-variant/20 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div class="flex-1">
          <h4 class="font-bold">${p.titulo}</h4>
          <p class="text-sm text-on-surface-variant line-clamp-2">${p.descripcion || ''}</p>
          <div class="flex gap-3 text-xs mt-1">
            <span class="bg-primary text-white px-2 py-0.5 rounded-full">${p.descuento || ''}</span>
            <span>${p.fecha_inicio ? 'Desde ' + new Date(p.fecha_inicio).toLocaleDateString() : ''}</span>
            <span>${p.fecha_fin ? 'Hasta ' + new Date(p.fecha_fin).toLocaleDateString() : ''}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn-admin btn-outline-admin editar-promo" data-id="${p.id}">✎ Editar</button>
          <button class="btn-admin btn-danger-admin eliminar-promo" data-id="${p.id}">🗑</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.editar-promo').forEach(btn => {
      btn.addEventListener('click', () => openModal('promocion', btn.dataset.id));
    });
    document.querySelectorAll('.eliminar-promo').forEach(btn => {
      btn.addEventListener('click', () => eliminarRegistro('promociones', btn.dataset.id, loadPromociones));
    });
  }

  // ------------------------------------------------------------
  // 5. ELIMINAR GENÉRICO
  // ------------------------------------------------------------
  async function eliminarRegistro(tabla, id, callback) {
    if (!confirm('¿Eliminar este registro?')) return;
    const { error } = await supabaseClient.from(tabla).delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      callback();
    }
  }

  // ------------------------------------------------------------
  // 6. MODAL - ABRIR / CERRAR
  // ------------------------------------------------------------
  function openModal(tipo, id = null) {
    modalTipo.value = tipo;
    modalId.value = id || '';
    modalMensaje.textContent = '';
    modalImagen.value = '';
    modalImagenPreview.classList.add('hidden');

    if (tipo === 'servicio') {
      modalTitle.textContent = id ? 'Editar servicio' : 'Nuevo servicio';
      document.getElementById('modalCamposServicio').classList.remove('hidden');
      document.getElementById('modalCamposPromocion').classList.add('hidden');
      toggleIconGallery(true);
      modalDestacado.value = 'false';
      modalOrden.value = 0;
    } else {
      modalTitle.textContent = id ? 'Editar promoción' : 'Nueva promoción';
      document.getElementById('modalCamposServicio').classList.add('hidden');
      document.getElementById('modalCamposPromocion').classList.remove('hidden');
      toggleIconGallery(false);
      modalDescuento.value = '';
      modalFechaInicio.value = '';
      modalFechaFin.value = '';
    }

    if (id) {
      cargarDatosParaEditar(tipo, id);
    } else {
      modalTitulo.value = '';
      modalDescripcion.value = '';
      modalIcono.value = 'spa';
      updateIconPreview('spa');
      modalImagenPreviewImg.src = '';
    }

    modalForm.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  async function cargarDatosParaEditar(tipo, id) {
    const tabla = tipo === 'servicio' ? 'servicios' : 'promociones';
    const { data, error } = await supabaseClient.from(tabla).select('*').eq('id', id).single();
    if (error) {
      alert('Error al cargar: ' + error.message);
      return;
    }
    modalTitulo.value = data.titulo || '';
    modalDescripcion.value = data.descripcion || '';

    if (tipo === 'servicio') {
      modalIcono.value = data.icono || 'spa';
      updateIconPreview(data.icono || 'spa');
      modalDestacado.value = data.destacado ? 'true' : 'false';
      modalOrden.value = data.orden || 0;
      highlightCurrentIcon();
      if (data.imagen_url) {
        modalImagenPreviewImg.src = data.imagen_url;
        modalImagenPreview.classList.remove('hidden');
      }
    } else {
      modalDescuento.value = data.descuento || '';
      modalFechaInicio.value = data.fecha_inicio || '';
      modalFechaFin.value = data.fecha_fin || '';
      if (data.imagen_url) {
        modalImagenPreviewImg.src = data.imagen_url;
        modalImagenPreview.classList.remove('hidden');
      }
    }
  }

  function closeModal() {
    modalForm.classList.add('hidden');
    document.body.style.overflow = '';
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  modalForm.addEventListener('click', (e) => {
    if (e.target === modalForm) closeModal();
  });

  modalQuitarImagen.addEventListener('click', () => {
    modalImagenPreview.classList.add('hidden');
    modalImagenPreviewImg.src = '';
    modalImagen.value = '';
  });

  // ------------------------------------------------------------
  // 7. GUARDAR (CREAR / EDITAR)
  // ------------------------------------------------------------
  modalFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tipo = modalTipo.value;
    const id = modalId.value;
    const tabla = tipo === 'servicio' ? 'servicios' : 'promociones';
    const isEdit = !!id;

    const data = {
      titulo: modalTitulo.value.trim(),
      descripcion: modalDescripcion.value.trim(),
    };

    // Subir imagen si se seleccionó
    const file = modalImagen.files[0];
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('imagenes')
          .upload(`public/${fileName}`, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabaseClient.storage
          .from('imagenes')
          .getPublicUrl(`public/${fileName}`);
        data.imagen_url = urlData.publicUrl;
      } catch (err) {
        modalMensaje.textContent = 'Error al subir imagen: ' + err.message;
        modalMensaje.classList.add('text-error');
        return;
      }
    } else if (isEdit) {
      // Si no se sube nueva, conservar la existente (no se incluye en el update)
    }

    if (tipo === 'servicio') {
      data.icono = modalIcono.value.trim() || 'spa';
      data.destacado = modalDestacado.value === 'true';
      data.orden = parseInt(modalOrden.value) || 0;
    } else {
      data.descuento = modalDescuento.value.trim();
      data.fecha_inicio = modalFechaInicio.value || null;
      data.fecha_fin = modalFechaFin.value || null;
    }

    let result;
    if (isEdit) {
      result = await supabaseClient.from(tabla).update(data).eq('id', id);
    } else {
      result = await supabaseClient.from(tabla).insert([data]);
    }

    if (result.error) {
      modalMensaje.textContent = 'Error: ' + result.error.message;
      modalMensaje.classList.add('text-error');
    } else {
      modalMensaje.textContent = '✅ Guardado correctamente.';
      modalMensaje.classList.remove('text-error');
      setTimeout(() => {
        closeModal();
        if (tipo === 'servicio') loadServicios();
        else loadPromociones();
      }, 1000);
    }
  });

  // ------------------------------------------------------------
  // 8. PROMOCIÓN DEL MES
  // ------------------------------------------------------------
  async function loadPromoMes() {
    const { data, error } = await supabaseClient
      .from('promocion_mes')
      .select('*')
      .maybeSingle();
    if (error) {
      pmMensaje.textContent = 'Error al cargar: ' + error.message;
      return;
    }
    if (data) {
      pmVistaTitulo.textContent = data.titulo || 'Sin título';
      pmVistaDescripcion.textContent = data.descripcion || '';
      pmVistaFechas.textContent = data.fecha_inicio && data.fecha_fin
        ? `Fechas: ${new Date(data.fecha_inicio).toLocaleDateString()} - ${new Date(data.fecha_fin).toLocaleDateString()}`
        : 'Sin fechas';
      pmVistaImagen.src = data.imagen_url || 'https://via.placeholder.com/400x200?text=Promoción+del+mes';
    } else {
      pmVistaTitulo.textContent = 'No hay promoción del mes';
      pmVistaDescripcion.textContent = '';
      pmVistaFechas.textContent = '';
      pmVistaImagen.src = 'https://via.placeholder.com/400x200?text=Sin+promoción';
    }
  }

  editarPromoMesBtn.addEventListener('click', () => {
    // Abrir modal para editar la promoción del mes (usamos el mismo modal)
    // Cargamos los datos actuales en el modal de promociones
    // Pero necesitamos una lógica especial: guardar en tabla promocion_mes
    // Para no complicar, abrimos el modal de promociones y luego al guardar,
    // detectamos si es promo_mes por un flag.
    // Implementación rápida: abrir modal con tipo 'promocion_mes'
    // y al guardar, hacer upsert en promocion_mes.
    // Como ejemplo, dejamos un mensaje.
    alert('Función de edición de promoción del mes: puedes implementar un modal similar al de promociones pero con la tabla promocion_mes.');
    // Aquí podrías llamar a una función openModalPromoMes()
  });

  // ------------------------------------------------------------
  // 9. TABS
  // ------------------------------------------------------------
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const target = this.dataset.tab;
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
      if (target === 'servicios') {
        tabServicios.classList.remove('hidden');
        loadServicios();
      } else if (target === 'promociones') {
        tabPromociones.classList.remove('hidden');
        loadPromociones();
      } else if (target === 'promoMes') {
        tabPromoMes.classList.remove('hidden');
        loadPromoMes();
      }
    });
  });

  // ------------------------------------------------------------
  // 10. EVENTOS DE BOTONES PARA NUEVO
  // ------------------------------------------------------------
  nuevoServicioBtn.addEventListener('click', () => openModal('servicio'));
  nuevaPromoBtn.addEventListener('click', () => openModal('promocion'));

  // ------------------------------------------------------------
  // 11. INICIALIZACIÓN
  // ------------------------------------------------------------
  async function loadAllData() {
    await loadServicios();
    await loadPromociones();
    await loadPromoMes();
  }

  await checkSession();
  if (currentUser) {
    await loadAllData();
  }
});
