// ============================================================
// MENÚ HAMBURGUESA
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const closeMenuBtn = document.getElementById('closeMenu');
  const menuLinks = document.querySelectorAll('.menu-link');

  function toggleMenu(open) {
    if (open === undefined) {
      const isOpen = mobileMenu.classList.contains('open');
      open = !isOpen;
    }
    mobileMenu.classList.toggle('open', open);
    menuOverlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleMenu(true));
  }
  if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', () => toggleMenu(false));
  }
  if (menuOverlay) {
    menuOverlay.addEventListener('click', () => toggleMenu(false));
  }
  menuLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });
});

// ============================================================
// SLIDER ANTES / DESPUÉS (CORREGIDO)
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  const comparison = document.querySelector('.comparison');
  if (!comparison) return;

  const slider = comparison.querySelector('input[type="range"]');
  const before = comparison.querySelector('.before-img');
  const beforeImg = before ? before.querySelector('img') : null;
  const divider = comparison.querySelector('.divider');
  const btn = comparison.querySelector('.slider-btn');

  if (!slider || !before || !beforeImg) return;

  // Fija el ancho de la imagen interna al ancho total del contenedor
  function setFixedWidth() {
    const width = comparison.offsetWidth;
    beforeImg.style.width = width + 'px';
  }

  // Actualiza la posición del slider y los elementos
  function updateSlider(value) {
    const percent = value + '%';
    before.style.width = percent;
    divider.style.left = percent;
    btn.style.left = percent;
  }

  // Inicializar
  setFixedWidth();
  updateSlider(slider.value);

  // Evento del slider
  slider.addEventListener('input', function() {
    updateSlider(this.value);
  });

  // Recalcular en resize
  window.addEventListener('resize', function() {
    setFixedWidth();
    // Asegurar que la posición se mantiene
    updateSlider(slider.value);
  });
});

// ============================================================
// PARTÍCULAS DE FLOR DE CEREZO (generación)
// ============================================================
(function() {
  const container = document.getElementById('flower-particles');
  if (!container) return;
  const count = 20;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'flower-particle';
    el.textContent = '🌸';
    const size = 12 + Math.random() * 14;
    const duration = 25 + Math.random() * 35;
    const delay = Math.random() * 25;
    el.style.fontSize = size + 'px';
    el.style.left = Math.random() * 100 + '%';
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = delay + 's';
    el.style.opacity = 0.15 + Math.random() * 0.2;
    container.appendChild(el);
  }
})();