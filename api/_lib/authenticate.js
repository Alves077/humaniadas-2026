// Extrai o Bearer token do request e valida via supabaseAdmin.auth.getUser().
// Em caso de falha já escreve a resposta 401 e retorna null — o caller só
// precisa checar `if (!user) return;`.
async function authenticateRequest(supabaseAdmin, req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Token ausente' });
    return null;
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    res.status(401).json({ error: 'Sessão inválida' });
    return null;
  }

  return user;
}

module.exports = { authenticateRequest };
