const { getSupabaseAdmin } = require('./_lib/supabaseAdmin');
const { deleteUserCascade } = require('./_lib/deleteUserCascade');
const { authenticateRequest } = require('./_lib/authenticate');

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

  const user = await authenticateRequest(supabaseAdmin, req, res);
  if (!user) return;

  const { error } = await deleteUserCascade(supabaseAdmin, user.id);
  if (error) {
    res.status(500).json({ error });
    return;
  }

  res.status(200).json({ ok: true });
};
