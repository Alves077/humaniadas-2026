// Ordem obrigatória: sem ON DELETE CASCADE no schema (simulations -> profiles -> auth.users)
async function deleteUserCascade(supabaseAdmin, userId) {
  const { error: simError } = await supabaseAdmin.from('simulations').delete().eq('user_id', userId);
  if (simError) return { error: 'Erro ao apagar simulação' };

  const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
  if (profileError) return { error: 'Erro ao apagar perfil' };

  // A partir daqui simulations/profiles já foram apagados de forma irreversível.
  // Não existe transação cruzando Postgres + Auth Admin API, então uma falha aqui
  // deixa o login órfão sem chance de rollback. Tenta mais vezes antes de desistir
  // (essa é a etapa mais sujeita a falha transitória, por ser uma chamada separada),
  // e se ainda assim falhar, avisa que o estado ficou parcial em vez de sugerir que
  // nada aconteceu.
  let userError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = await supabaseAdmin.auth.admin.deleteUser(userId);
    userError = result.error;
    if (!userError) break;
    if (attempt < 3) await new Promise(r => setTimeout(r, 300 * attempt));
  }
  if (userError) {
    return { error: 'Perfil e simulação já foram apagados, mas o login não pôde ser removido. Contate o suporte para concluir a exclusão.' };
  }

  return { error: null };
}

module.exports = { deleteUserCascade };
