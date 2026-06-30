// Estado de autenticação — dura só a sessão do navegador
let isAdmin = sessionStorage.getItem('humaniadas_admin') === 'true';

function handleAdminToggle() {
  if (isAdmin) {
    logoutAdmin();
  } else {
    openAdminModal();
  }
}

function openAdminModal() {
  document.getElementById('adminModal').classList.add('open');
  document.getElementById('adminPasswordInput').value = '';
  document.getElementById('adminError').textContent = '';
  setTimeout(() => document.getElementById('adminPasswordInput').focus(), 100);
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.remove('open');
}

function submitAdminLogin() {
  const val = document.getElementById('adminPasswordInput').value;
  if (val === ADMIN_PASSWORD) {
    isAdmin = true;
    sessionStorage.setItem('humaniadas_admin', 'true');
    closeAdminModal();
    updateAdminUI();
    renderAll();
  } else {
    const err = document.getElementById('adminError');
    err.textContent = 'Senha incorreta.';
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('adminPasswordInput').focus();
    setTimeout(() => err.textContent = '', 2500);
  }
}

function logoutAdmin() {
  if (!confirm('Sair do modo admin?')) return;
  isAdmin = false;
  sessionStorage.removeItem('humaniadas_admin');
  updateAdminUI();
  renderAll();
}

function updateAdminUI() {
  const icon = document.getElementById('adminToggleIcon');
  const label = document.getElementById('adminToggleLabel');
  const btn = document.getElementById('adminToggleBtn');
  const resetBtn = document.getElementById('resetBtn');

  if (isAdmin) {
    icon.textContent = '🔓';
    label.textContent = 'Admin ativo';
    btn.classList.add('admin-active');
    resetBtn.style.display = 'block';
  } else {
    icon.textContent = '🔒';
    label.textContent = 'Modo Admin';
    btn.classList.remove('admin-active');
    resetBtn.style.display = 'none';
  }
}

// Fecha modal ao clicar fora
document.getElementById('adminModal').addEventListener('click', function (e) {
  if (e.target === this) closeAdminModal();
});

// Aplica estado inicial
updateAdminUI();
