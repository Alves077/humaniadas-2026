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
