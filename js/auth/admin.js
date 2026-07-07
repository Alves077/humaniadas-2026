let isAdmin = false;

function handleAdminToggle() {
  if (isAdmin) logoutAdmin();
  else openAdminModal();
}

function openAdminModal() {
  document.getElementById('adminModal').classList.add('open');
  document.getElementById('adminEmailInput').value = '';
  document.getElementById('adminPasswordInput').value = '';
  document.getElementById('adminError').textContent = '';
  setTimeout(() => document.getElementById('adminEmailInput').focus(), 100);
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.remove('open');
}

async function submitAdminLogin() {
  const username = document.getElementById('adminEmailInput').value.trim();
  const email = `${username}@humaniadas.com`;
  const password = document.getElementById('adminPasswordInput').value;

  const { data, error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    const err = document.getElementById('adminError');
    err.textContent = 'Credenciais inválidas.';
    setTimeout(() => err.textContent = '', 2500);
    return;
  }

  if (!data.user?.app_metadata?.is_admin) {
    const err = document.getElementById('adminError');
    err.textContent = 'Acesso negado.';
    setTimeout(() => err.textContent = '', 2500);
    await db.auth.signOut();
    return;
  }
  isAdmin = true;
  closeAdminModal();
  window.location.replace(location.pathname);
}

async function logoutAdmin() {
  if (!confirm('Sair do modo admin?')) return;
  await db.auth.signOut();
  window.location.replace(location.pathname);
}

function updateAdminUI() {
  const icon = document.getElementById('adminToggleIcon');
  const label = document.getElementById('adminToggleLabel');
  const btn = document.getElementById('adminToggleBtn');
  const authBtn = document.getElementById('authBtn');
  if (isAdmin) {
    icon.textContent = '🔓';
    label.textContent = 'Admin ativo';
    btn.classList.add('admin-active');
    if (authBtn) authBtn.style.display = 'none';
  } else {
    icon.textContent = '🔒';
    label.textContent = 'Admin';
    btn.classList.remove('admin-active');
    if (authBtn) authBtn.style.display = '';
  }
  const clearBtn = document.getElementById('clearBracketBtn');
  if (clearBtn) clearBtn.style.visibility = isAdmin ? 'visible' : 'hidden';
}

document.getElementById('adminModal').addEventListener('click', function(e) {
  if (e.target === this) closeAdminModal();
});

updateAdminUI();
if (!DB_READY) {
  const btn = document.getElementById('adminToggleBtn');
  if (btn) btn.style.display = 'none';
}
