let isAdmin = !DB_READY || false;

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
  const email = `${username}@humaniadas.local`;
  const password = document.getElementById('adminPasswordInput').value;

  const { data, error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    const err = document.getElementById('adminError');
    err.textContent = 'Credenciais inválidas.';
    setTimeout(() => err.textContent = '', 2500);
    return;
  }

  isAdmin = true;
  closeAdminModal();
  updateAdminUI();
  renderAll();
}

async function logoutAdmin() {
  if (!confirm('Sair do modo admin?')) return;
  await db.auth.signOut();
  isAdmin = false;
  updateAdminUI();
  renderAll();
}

function updateAdminUI() {
  const icon = document.getElementById('adminToggleIcon');
  const label = document.getElementById('adminToggleLabel');
  const btn = document.getElementById('adminToggleBtn');
  if (isAdmin) {
    icon.textContent = '🔓';
    label.textContent = 'Admin ativo';
    btn.classList.add('admin-active');
  } else {
    icon.textContent = '🔒';
    label.textContent = 'Admin';
    btn.classList.remove('admin-active');
  }
}

document.getElementById('adminModal').addEventListener('click', function(e) {
  if (e.target === this) closeAdminModal();
});

updateAdminUI();
if (!DB_READY) {
  const btn = document.getElementById('adminToggleBtn');
  if (btn) btn.style.display = 'none';
}
