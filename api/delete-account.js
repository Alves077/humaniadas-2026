const { createClient } = require('@supabase/supabase-js');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  // Fallback local: `vercel dev` às vezes não injeta .env.local nas functions
  // (e o cwd da function não é necessariamente a raiz do projeto). Em produção
  // as vars já vêm setadas pela plataforma, então isso não roda lá.
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      !process.env.SUPABASE_URL && 'SUPABASE_URL',
      !process.env.SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean).join(', ');
    res.status(500).json({ error: `Env var ausente no servidor: ${missing}` });
    return;
  }

  // Cliente admin (service_role) — nunca exposto ao browser, só roda no servidor.
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Token ausente' });
    return;
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    res.status(401).json({ error: 'Sessão inválida' });
    return;
  }

  // Ordem obrigatória: sem ON DELETE CASCADE no schema (simulations -> profiles -> auth.users)
  const { error: simError } = await supabaseAdmin.from('simulations').delete().eq('user_id', user.id);
  if (simError) {
    res.status(500).json({ error: 'Erro ao apagar simulação' });
    return;
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', user.id);
  if (profileError) {
    res.status(500).json({ error: 'Erro ao apagar perfil' });
    return;
  }

  const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (userError) {
    res.status(500).json({ error: 'Erro ao apagar conta' });
    return;
  }

  res.status(200).json({ ok: true });
};
