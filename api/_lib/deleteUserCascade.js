// Ordem obrigatória: sem ON DELETE CASCADE no schema (simulations -> profiles -> auth.users)
async function deleteUserCascade(supabaseAdmin, userId) {
  const { error: simError } = await supabaseAdmin.from('simulations').delete().eq('user_id', userId);
  if (simError) return { error: 'Erro ao apagar simulação' };

  const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
  if (profileError) return { error: 'Erro ao apagar perfil' };

  const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (userError) return { error: 'Erro ao apagar usuário' };

  return { error: null };
}

module.exports = { deleteUserCascade };
