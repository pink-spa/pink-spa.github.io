document.addEventListener('DOMContentLoaded', async () => {
  const { createClient } = supabase;
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const container = document.getElementById('promociones-container');

  try {
    const [{ data: promociones, error: errorPromos }, { data: configRow, error: errorConfig }] = await Promise.all([
      supabaseClient.from('promociones').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('configuracion').select('valor').eq('clave', 'whatsapp_numero').maybeSingle()
    ]);

    if (errorPromos) throw errorPromos;
    if (errorConfig) throw errorConfig;

    const whatsappNumero = configRow?.valor || '5519826003';

    if (promociones && promociones.length > 0) {
      container.innerHTML = promociones.map(promo => `
        <div class="bg-white rounded-2xl overflow-hidden shadow-md border border-outline-variant/20 hover:shadow-xl transition-shadow flex flex-col h-full">
          <div class="h-48 overflow-hidden">
            <img src="${promo.imagen_url || 'https://via.placeholder.com/400x200?text=Promoción'}" alt="${promo.titulo}" class="w-full h-full object-cover" loading="lazy" />
          </div>
          <div class="p-5 flex flex-col flex-1">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">${promo.titulo}</h3>
            ${promo.descripcion ? `<p class="text-sm text-on-surface-variant mt-1 flex-1">${promo.descripcion}</p>` : ''}
            <div class="flex items-center gap-3 text-sm mt-3 flex-wrap">
              ${promo.descuento ? `<span class="bg-primary text-white px-3 py-1 rounded-full font-bold">${promo.descuento}</span>` : ''}
              <span class="text-on-surface-variant text-xs">
                ${promo.fecha_inicio ? 'Válido del ' + new Date(promo.fecha_inicio).toLocaleDateString() : ''}
                ${promo.fecha_fin ? ' al ' + new Date(promo.fecha_fin).toLocaleDateString() : ''}
              </span>
            </div>
            <a href="https://wa.me/${whatsappNumero}" target="_blank" rel="noopener noreferrer" class="mt-4 inline-flex items-center justify-center gap-2 text-primary font-bold hover:gap-4 transition-all duration-300">
              Agenda ahora <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p class="col-span-full text-center text-on-surface-variant">No hay promociones activas.</p>';
    }
  } catch (err) {
    console.error('Error cargando promociones:', err);
    container.innerHTML = '<p class="col-span-full text-center text-error">Error al cargar promociones.</p>';
  }
});