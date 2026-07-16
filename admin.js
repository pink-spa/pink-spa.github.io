// admin.js
document.addEventListener('DOMContentLoaded', async () => {
  const { createClient } = supabase;
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ========== DOM ELEMENTS ==========
  const loginForm = document.getElementById('loginForm');
  const adminPanel = document.getElementById('adminPanel');
  const loginFormElement = document.getElementById('loginFormElement');
  const loginError = document.getElementById('loginError');
  const logoutBtns = ['logoutBtn', 'logoutBtnAdmin', 'logoutBtnMobile'].map(id => document.getElementById(id));
  const tabs = document.querySelectorAll('.admin-tab');
  const tabPanes = {
    servicios: document.getElementById('tabServicios'),
    promociones: document.getElementById('tabPromociones'),
    promoMes: document.getElementById('tabPromoMes')
  };
  const serviciosList = document.getElementById('serviciosList');
  const promocionesList = document.getElementById('promocionesList');
  const nuevoServicioBtn = document.getElementById('nuevoServicioBtn');
  const nuevaPromoBtn = document.getElementById('nuevaPromoBtn');
  const editarPromoMesBtn = document.getElementById('editarPromoMesBtn');

  // Elementos de la vista de Promo del Mes
  const pmVistaTitulo = document.getElementById('pm_vista_titulo');
  const pmVistaDescripcion = document.getElementById('pm_vista_descripcion');
  const pmVistaFechas = document.getElementById('pm_vista_fechas');
  const pmVistaImagen = document.getElementById('pm_vista_imagen');
  const pmMensaje = document.getElementById('pm_mensaje');

  // ========== MODAL ==========
  const modal = document.getElementById('modalForm');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalFormElement = document.getElementById('modalFormElement');
  const modalTitle = document.getElementById('modalTitle');
  const modalTitulo = document.getElementById('modalTitulo');
  const modalDescripcion = document.getElementById('modalDescripcion');
  const modalImagen = document.getElementById('modalImagen');
  const modalImagenPreview = document.getElementById('modalImagenPreview');
  const modalImagenPreviewImg = document.getElementById('modalImagenPreviewImg');
  const modalQuitarImagen = document.getElementById('modalQuitarImagen');
  const modalTipo = document.getElementById('modalTipo');
  const modalId = document.getElementById('modalId');
  const modalIcono = document.getElementById('modalIcono');
  const modalDestacado = document.getElementById('modalDestacado');
  const modalOrden = document.getElementById('modalOrden');
  const modalDescuento = document.getElementById('modalDescuento');
  const modalFechaInicio = document.getElementById('modalFechaInicio');
  const modalFechaFin = document.getElementById('modalFechaFin');
  const modalCamposServicio = document.getElementById('modalCamposServicio');
  const modalCamposPromocion = document.getElementById('modalCamposPromocion');
  const modalMensaje = document.getElementById('modalMensaje');

  let currentFile = null;      // archivo seleccionado en el modal
  let currentUser = null;

  // ========== AUTENTICACIÓN ==========
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
    if (show) {
      loginForm.classList.add('hidden');
      adminPanel.classList.remove('hidden');
      loadData();
    } else {
      loginForm.classList.remove('hidden');
      adminPanel.classList.add('hidden');
    }
  }

  loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginError.classList.add('hidden');
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      currentUser = data.user;
      showAdminPanel(true);
    } catch (err) {
      loginError.classList.remove('hidden');
      console.error(err);
    }
  });

  logoutBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        currentUser = null;
        showAdminPanel(false);
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
      });
    }
  });

  // ========== TABS ==========
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      Object.keys(tabPanes).forEach(key => {
        tabPanes[key].classList.toggle('hidden', key !== target);
      });
      if (target === 'servicios') loadServicios();
      else if (target === 'promociones') loadPromociones();
      else if (target === 'promoMes') loadPromoMes();
    });
  });

  // ========== MODAL ==========
  function abrirModal(tipo, datos = null) {
    modalTipo.value = tipo;
    modalId.value = datos?.id || '';
    modalMensaje.textContent = '';
    modalMensaje.className = 'text-sm';
    modalTitulo.value = datos?.titulo || '';
    modalDescripcion.value = datos?.descripcion || '';
    modalImagen.value = '';
    currentFile = null;
    modalImagenPreview.classList.add('hidden');

    if (tipo === 'servicio') {
      modalTitle.textContent = datos ? 'Editar Servicio' : 'Nuevo Servicio';
      modalCamposServicio.classList.remove('hidden');
      modalCamposPromocion.classList.add('hidden');
      modalIcono.value = datos?.icono || 'spa';
      modalDestacado.value = datos?.destacado ? 'true' : 'false';
      modalOrden.value = datos?.orden || 0;
    } else if (tipo === 'promocion') {
      modalTitle.textContent = datos ? 'Editar Promoción' : 'Nueva Promoción';
      modalCamposServicio.classList.add('hidden');
      modalCamposPromocion.classList.remove('hidden');
      modalDescuento.value = datos?.descuento || '';
      modalFechaInicio.value = datos?.fecha_inicio || '';
      modalFechaFin.value = datos?.fecha_fin || '';
    } else if (tipo === 'promoMes') {
      modalTitle.textContent = 'Editar Promoción del Mes';
      modalCamposServicio.classList.add('hidden');
      modalCamposPromocion.classList.remove('hidden');
      modalDescuento.value = '';
      modalFechaInicio.value = datos?.fecha_inicio || '';
      modalFechaFin.value = datos?.fecha_fin || '';
    }

    if (datos?.imagen_url) {
      modalImagenPreviewImg.src = datos.imagen_url;
      modalImagenPreview.classList.remove('hidden');
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function cerrarModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  modalCloseBtn.addEventListener('click', cerrarModal);
  modalCancelBtn.addEventListener('click', cerrarModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  modalQuitarImagen.addEventListener('click', () => {
    modalImagenPreview.classList.add('hidden');
    modalImagen.value = '';
    currentFile = null;
  });

  modalImagen.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      currentFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        modalImagenPreviewImg.src = ev.target.result;
        modalImagenPreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    } else {
      currentFile = null;
      modalImagenPreview.classList.add('hidden');
    }
  });

  // ========== SUBIR IMAGEN A SUPABASE ==========
  async function subirImagen(file, carpeta = 'servicios') {
    const extension = file.name.split('.').pop();
    const nombre = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const ruta = `${carpeta}/${nombre}`;

    const { data, error } = await supabaseClient.storage
      .from('imagenes')   // ← Cambia a 'IMAGENES' si no renombraste el bucket
      .upload(ruta, file);

    if (error) throw error;

    const { data: urlData } = supabaseClient.storage
      .from('imagenes')   // ← Cambia a 'IMAGENES' si no renombraste el bucket
      .getPublicUrl(ruta);

    return urlData.publicUrl;
  }

  // ========== GUARDAR (submit del modal) ==========
  modalFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tipo = modalTipo.value;
    const id = modalId.value;
    const titulo = modalTitulo.value.trim();
    const descripcion = modalDescripcion.value.trim();
    const imagenSeleccionada = currentFile;

    if (!titulo) {
      modalMensaje.textContent = 'El título es obligatorio.';
      modalMensaje.className = 'text-sm text-error';
      return;
    }

    try {
      let imagen_url = null;
      if (imagenSeleccionada) {
        const carpeta = tipo === 'servicio' ? 'servicios' : 'promociones';
        imagen_url = await subirImagen(imagenSeleccionada, carpeta);
      } else {
        if (!modalImagenPreview.classList.contains('hidden')) {
          imagen_url = modalImagenPreviewImg.src;
        }
      }

      let tabla, datos = { titulo, descripcion, imagen_url };

      if (tipo === 'servicio') {
        tabla = 'servicios';
        datos.icono = modalIcono.value.trim() || 'spa';
        datos.destacado = modalDestacado.value === 'true';
        datos.orden = parseInt(modalOrden.value) || 0;
      } else if (tipo === 'promocion') {
        tabla = 'promociones';
        datos.descuento = modalDescuento.value.trim();
        datos.fecha_inicio = modalFechaInicio.value || null;
        datos.fecha_fin = modalFechaFin.value || null;
      } else if (tipo === 'promoMes') {
        tabla = 'promo_mes';
        datos.fecha_inicio = modalFechaInicio.value || null;
        datos.fecha_fin = modalFechaFin.value || null;
        datos.activo = true;
        // descuento no aplica en promo_mes
      }

      let respuesta;
      if (id) {
        respuesta = await supabaseClient.from(tabla).update(datos).eq('id', id);
      } else {
        respuesta = await supabaseClient.from(tabla).insert([datos]);
      }

      if (respuesta.error) throw respuesta.error;

      alert('¡Guardado con éxito!');
      cerrarModal();
      // Recargar la vista correspondiente
      if (tipo === 'servicio') loadServicios();
      else if (tipo === 'promocion') loadPromociones();
      else if (tipo === 'promoMes') loadPromoMes();
    } catch (err) {
      console.error(err);
      modalMensaje.textContent = 'Error: ' + err.message;
      modalMensaje.className = 'text-sm text-error';
    }
  });

  // ========== SERVICIOS ==========
  async function loadServicios() {
    try {
      const { data, error } = await supabaseClient
        .from('servicios')
        .select('*')
        .order('orden', { ascending: true });
      if (error) throw error;
      renderServicios(data);
    } catch (err) {
      console.error('Error cargando servicios:', err);
      serviciosList.innerHTML = '<p class="text-error">Error al cargar servicios.</p>';
    }
  }

  function renderServicios(servicios) {
    if (!servicios || servicios.length === 0) {
      serviciosList.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">No hay servicios.</p>';
      return;
    }
    serviciosList.innerHTML = servicios.map(s => `
      <div class="admin-card bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col">
        <div class="flex items-center gap-3 mb-2">
          ${s.imagen_url ? `<img src="${s.imagen_url}" alt="${s.titulo}" class="w-12 h-12 rounded-full object-cover" />` : ''}
          <span class="material-symbols-outlined text-primary text-2xl">${s.icono || 'spa'}</span>
          <h4 class="font-bold">${s.titulo}</h4>
          ${s.destacado ? '<span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Destacado</span>' : ''}
        </div>
        ${s.descripcion ? `<p class="text-sm text-on-surface-variant mb-2">${s.descripcion}</p>` : ''}
        <div class="flex gap-2 mt-auto pt-2 border-t border-outline-variant/10">
          <button class="btn-admin btn-outline-admin text-sm editar-servicio" data-id="${s.id}">Editar</button>
          <button class="btn-admin btn-danger-admin text-sm eliminar-servicio" data-id="${s.id}">Eliminar</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.editar-servicio').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const servicio = servicios.find(s => s.id == id);
        abrirModal('servicio', servicio);
      });
    });
    document.querySelectorAll('.eliminar-servicio').forEach(btn => {
      btn.addEventListener('click', () => eliminarServicio(btn.dataset.id));
    });
  }

  async function eliminarServicio(id) {
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;
    try {
      const { error } = await supabaseClient.from('servicios').delete().eq('id', id);
      if (error) throw error;
      loadServicios();
      alert('Servicio eliminado.');
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  }

  nuevoServicioBtn.addEventListener('click', () => abrirModal('servicio'));

  // ========== PROMOCIONES ==========
  async function loadPromociones() {
    try {
      const { data, error } = await supabaseClient
        .from('promociones')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      renderPromociones(data);
    } catch (err) {
      console.error('Error cargando promociones:', err);
      promocionesList.innerHTML = '<p class="text-error">Error al cargar promociones.</p>';
    }
  }

  function renderPromociones(promociones) {
    if (!promociones || promociones.length === 0) {
      promocionesList.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">No hay promociones.</p>';
      return;
    }
    promocionesList.innerHTML = promociones.map(p => `
      <div class="admin-card bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col">
        <div class="flex items-center gap-3 mb-2">
          ${p.imagen_url ? `<img src="${p.imagen_url}" alt="${p.titulo}" class="w-12 h-12 rounded-full object-cover" />` : ''}
          <h4 class="font-bold">${p.titulo}</h4>
        </div>
        ${p.descripcion ? `<p class="text-sm text-on-surface-variant mb-1">${p.descripcion}</p>` : ''}
        <div class="text-sm text-on-surface-variant mb-2">
          ${p.descuento ? `<span class="bg-primary text-white px-2 py-0.5 rounded-full text-xs">${p.descuento}</span>` : ''}
          ${p.fecha_inicio ? `Desde ${new Date(p.fecha_inicio).toLocaleDateString()}` : ''}
          ${p.fecha_fin ? ` hasta ${new Date(p.fecha_fin).toLocaleDateString()}` : ''}
        </div>
        <div class="flex gap-2 mt-auto pt-2 border-t border-outline-variant/10">
          <button class="btn-admin btn-outline-admin text-sm editar-promo" data-id="${p.id}">Editar</button>
          <button class="btn-admin btn-danger-admin text-sm eliminar-promo" data-id="${p.id}">Eliminar</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.editar-promo').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const promo = promociones.find(p => p.id == id);
        abrirModal('promocion', promo);
      });
    });
    document.querySelectorAll('.eliminar-promo').forEach(btn => {
      btn.addEventListener('click', () => eliminarPromo(btn.dataset.id));
    });
  }

  async function eliminarPromo(id) {
    if (!confirm('¿Eliminar esta promoción?')) return;
    try {
      const { error } = await supabaseClient.from('promociones').delete().eq('id', id);
      if (error) throw error;
      loadPromociones();
      alert('Promoción eliminada.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  nuevaPromoBtn.addEventListener('click', () => abrirModal('promocion'));

  // ========== PROMOCIÓN DEL MES ==========
  let currentPromoMes = null;

  async function loadPromoMes() {
    try {
      const { data, error } = await supabaseClient
        .from('promo_mes')
        .select('*')
        .eq('activo', true)
        .maybeSingle();
      if (error) throw error;

      if (data) {
        currentPromoMes = data;
        pmVistaTitulo.textContent = data.titulo || 'Sin título';
        pmVistaDescripcion.textContent = data.descripcion || 'Sin descripción';
        pmVistaFechas.textContent = data.fecha_inicio && data.fecha_fin
          ? `Válido del ${new Date(data.fecha_inicio).toLocaleDateString()} al ${new Date(data.fecha_fin).toLocaleDateString()}`
          : 'Sin fechas definidas';
        if (data.imagen_url) {
          pmVistaImagen.src = data.imagen_url;
          pmVistaImagen.classList.remove('hidden');
        } else {
          pmVistaImagen.classList.add('hidden');
        }
        pmMensaje.textContent = '';
        pmMensaje.className = 'text-sm';
      } else {
        const { data: newData, error: insertError } = await supabaseClient
          .from('promo_mes')
          .insert([{ titulo: 'Nueva Promoción del Mes', descripcion: '', activo: true }])
          .select()
          .single();
        if (insertError) throw insertError;
        currentPromoMes = newData;
        loadPromoMes();
      }
    } catch (err) {
      console.error('Error cargando promo mes:', err);
      pmMensaje.textContent = 'Error al cargar: ' + err.message;
      pmMensaje.className = 'text-sm text-error';
    }
  }

  if (editarPromoMesBtn) {
    editarPromoMesBtn.addEventListener('click', () => {
      if (currentPromoMes) {
        abrirModal('promoMes', currentPromoMes);
      } else {
        alert('No hay datos de promoción del mes.');
      }
    });
  }

  // Botón eliminar promo mes (lo añadimos dinámicamente)
  const eliminarPromoMesBtn = document.createElement('button');
  eliminarPromoMesBtn.textContent = 'Eliminar';
  eliminarPromoMesBtn.className = 'btn-admin btn-danger-admin mt-3';
  eliminarPromoMesBtn.addEventListener('click', async () => {
    if (!confirm('¿Eliminar la promoción del mes?')) return;
    if (!currentPromoMes) return;
    try {
      const { error } = await supabaseClient
        .from('promo_mes')
        .delete()
        .eq('id', currentPromoMes.id);
      if (error) throw error;
      const { data: newData, error: insertError } = await supabaseClient
        .from('promo_mes')
        .insert([{ titulo: 'Nueva Promoción del Mes', descripcion: '', activo: true }])
        .select()
        .single();
      if (insertError) throw insertError;
      currentPromoMes = newData;
      loadPromoMes();
      alert('Promoción del mes eliminada y reiniciada.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
  // Insertar el botón después del contenedor de la vista
  const promoMesCard = document.querySelector('#promoMesCard');
  if (promoMesCard) {
    promoMesCard.appendChild(eliminarPromoMesBtn);
  }

  // ========== CARGA INICIAL ==========
  await checkSession();

  function loadData() {
    loadServicios();
    loadPromociones();
    loadPromoMes();
  }

  document.querySelector('.admin-tab.active')?.click();
});