const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Fallback local: `vercel dev` às vezes não injeta .env.local nas functions
// (e o cwd da function não é necessariamente a raiz do projeto). Em produção
// as vars já vêm setadas pela plataforma, então isso não roda lá.
function getSupabaseAdmin() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      !process.env.SUPABASE_URL && 'SUPABASE_URL',
      !process.env.SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean).join(', ');
    throw new Error(`Env var ausente no servidor: ${missing}`);
  }

  // Cliente admin (service_role) — nunca exposto ao browser, só roda no servidor.
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

module.exports = { getSupabaseAdmin };
