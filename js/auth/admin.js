let isAdmin = false;

async function logoutAdmin() {
  if (!confirm('Sair do modo admin?')) return;
  await db.auth.signOut();
  window.location.replace(location.pathname);
}

function updateAdminUI() {
  const hasCurrentUser = typeof currentUser !== 'undefined' && !!currentUser;
  const authBtn = document.getElementById('authBtn');
  if (authBtn) authBtn.style.display = (isAdmin || hasCurrentUser) ? 'none' : '';

  const canEdit = typeof canEditBrackets === 'function' ? canEditBrackets() : isAdmin;
  const clearBtn = document.getElementById('clearBracketBtn');
  if (clearBtn) clearBtn.style.visibility = canEdit ? 'visible' : 'hidden';
  const clearAllBtn = document.getElementById('clearAllBracketsBtn');
  if (clearAllBtn) clearAllBtn.style.display = canEdit ? '' : 'none';
}

updateAdminUI();

// ─── Excluir usuário (admin) ───────────────────────────────────────────────────

async function adminDeleteUser(userId, username) {
  if (!confirm(`Excluir a conta de "${username}"? Ação irreversível — perfil, simulação e login serão apagados.`)) return;

  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    alert('Sessão expirada. Faça login novamente.');
    return;
  }

  try {
    const res = await fetch('/api/admin-delete-user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetId: userId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Erro ${res.status}`);
    }
  } catch (e) {
    alert(e.message || 'Erro ao excluir usuário.');
    return;
  }

  allSimulations = allSimulations.filter(s => s.user_id !== userId);
  renderSimulacoes();
  alert(`Conta de "${username}" excluída com sucesso.`);
}
