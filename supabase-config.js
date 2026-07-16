// supabase-config.js
const SUPABASE_URL = 'https://drccftmzmqhcezbdekkx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyY2NmdG16bXFoY2V6YmRla2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMzQwNjcsImV4cCI6MjA5OTcxMDA2N30.bfD-RpL-bdd_ibC1_YFLBBOuYuMVh_feb9wINxSa2nE';

let cachedWhatsApp = null;

async function getWhatsAppNumber() {
  if (cachedWhatsApp) return cachedWhatsApp;
  
  try {
    const { createClient } = supabase;
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await client
      .from('configuracion')
      .select('valor')
      .eq('clave', 'whatsapp')
      .maybeSingle(); // ✅ Usa maybeSingle() en vez de single() para evitar error si no hay fila
      
    if (error) throw error;
    
    // Si data es null, usa el número por defecto
    cachedWhatsApp = data?.valor || '5519826003';
    return cachedWhatsApp;
  } catch (e) {
    console.warn('Error cargando WhatsApp, usando fallback:', e);
    return '5519826003'; // fallback
  }
}
