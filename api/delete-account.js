const { getSupabaseAdmin } = require('./_lib/supabaseAdmin');
const { deleteUserCascade } = require('./_lib/deleteUserCascade');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (e) {
    // Detalhe (ex: nome da env var ausente) só nos logs do servidor — resposta
    // genérica pro cliente, já que esse erro pode ocorrer antes de qualquer
    // checagem de autenticação.
    console.error('delete-account:', e.message);
    res.status(500).json({ error: 'Erro de configuração do servidor' });
    return;
  }

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

  const { error } = await deleteUserCascade(supabaseAdmin, user.id);
  if (error) {
    res.status(500).json({ error });
    return;
  }

  res.status(200).json({ ok: true });
};
