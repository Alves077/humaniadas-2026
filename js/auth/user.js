// Usuário comum logado: { id, username, atletica } ou null
let currentUser = null;

// ─── Session ──────────────────────────────────────────────────────────────────

async function initAuth() {
  if (!DB_READY) return;

  const { data: { session } } = await db.auth.getSession();
  if (session) await onSignIn(session.user);

  db.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') await onSignIn(session.user);
    if (event === 'SIGNED_OUT') onSignOut();
  });
}

async function onSignIn(user) {
  // Admin: restaura isAdmin pelo app_metadata
  if (user.app_metadata?.is_admin) {
    isAdmin = true;
    updateAdminUI();
    renderAll();
    if (location.hash === '#simulacoes') onSimulacoesEnter();
    return;
  }

  const { data: profile } = await db
    .from('profiles')
    .select('username, atletica')
    .eq('id', user.id)
    .single();

  if (profile) {
    currentUser = { id: user.id, ...profile };
    viewingOfficial = false;
    applyTeamTheme(profile.atletica);
    updateAuthUI();
    updateViewToggleUI();
    await loadSimulation();
    renderAll();
    if (location.hash === '#simulacoes') onSimulacoesEnter();
  }
}

function onSignOut() {
  if (isAdmin) {
    isAdmin = false;
    updateAdminUI();
  }
  currentUser = null;
  viewingOfficial = false;
  resetTeamTheme();
  updateAuthUI();
  updateViewToggleUI();
  loadState().then(() => renderAll()).catch(() => renderAll());
}

// ─── Cadastro ─────────────────────────────────────────────────────────────────

async function submitRegister() {
  const username = document.getElementById('regUsername').value.trim();
  const atletica = document.getElementById('regAtletica').value;
  const password = document.getElementById('regPassword').value;
  const errEl = document.getElementById('authError');

  if (!username || !atletica || !password) {
    errEl.textContent = 'Preencha todos os campos.';
    return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Senha deve ter ao menos 6 caracteres.';
    return;
  }

  const email = `${username}@humaniadas.com`;

  // Verifica se username já existe
  const { data: existing } = await db
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (existing) {
    errEl.textContent = 'Este usuário já existe.';
    return;
  }

  const { data, error } = await db.auth.signUp({ email, password });

  if (error) {
    errEl.textContent = 'Erro ao criar conta: ' + error.message;
    return;
  }

  // Cria perfil
  const { error: profileError } = await db
    .from('profiles')
    .insert({ id: data.user.id, username, atletica });

  if (profileError) {
    errEl.textContent = 'Erro ao salvar perfil: ' + profileError.message;
    return;
  }

  closeAuthModal();
  window.location.replace(location.pathname);
}

// ─── Login ────────────────────────────────────────────────────────────────────

async function submitLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('authError');

  if (!username || !password) {
    errEl.textContent = 'Preencha todos os campos.';
    return;
  }

  const email = `${username}@humaniadas.com`;
  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    errEl.textContent = 'Usuário ou senha incorretos.';
    return;
  }

  closeAuthModal();
  window.location.replace(location.pathname);
}

// ─── Logout ───────────────────────────────────────────────────────────────────

async function logoutUser() {
  await db.auth.signOut();
  window.location.replace(location.pathname);
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function openAuthModal(tab = 'login') {
  document.getElementById('authModal').classList.add('open');
  switchAuthTab(tab);
  document.getElementById('authError').textContent = '';
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('open');
}

function switchAuthTab(tab) {
  document.getElementById('authError').textContent = '';
  document.getElementById('authTabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('authTabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('authFormLogin').style.display = tab === 'login' ? '' : 'none';
  document.getElementById('authFormRegister').style.display = tab === 'register' ? '' : 'none';
  const btn = document.getElementById('authSubmitBtn');
  btn.textContent = tab === 'login' ? 'Entrar' : 'Cadastrar';
  btn.onclick = tab === 'login' ? submitLogin : submitRegister;
}

document.getElementById('authModal').addEventListener('click', function(e) {
  if (e.target === this) closeAuthModal();
});

// ─── UI ───────────────────────────────────────────────────────────────────────

function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  const avatarWrap = document.getElementById('userAvatar');
  const adminBtn = document.getElementById('adminToggleBtn');

  if (currentUser) {
    // Usuário comum logado: mostra avatar, esconde entrar e botão admin
    authBtn.style.display = 'none';
    adminBtn.style.display = 'none';
    const initials = escHtml(currentUser.username.slice(0, 2).toUpperCase());
    avatarWrap.innerHTML = `
      <div class="user-avatar" onclick="toggleUserMenu()">
        <span class="user-avatar-initials">${initials}</span>
      </div>
      <div class="user-menu" id="userMenu" style="display:none;">
        <div class="user-menu-name">${escHtml(currentUser.username)}</div>
        <div class="user-menu-sub">${escHtml(currentUser.atletica)}</div>
        <hr class="user-menu-sep">
        <button class="user-menu-btn" onclick="logoutUser()">Sair</button>
      </div>`;
    avatarWrap.style.display = '';
  } else {
    // Visitante: mostra entrar, esconde avatar
    authBtn.style.display = '';
    avatarWrap.style.display = 'none';
    avatarWrap.innerHTML = '';
    // Botão admin: só mostra se DB_READY (modo com banco real)
    if (DB_READY) adminBtn.style.display = '';
  }
}

function toggleUserMenu() {
  const menu = document.getElementById('userMenu');
  if (menu) menu.style.display = menu.style.display === 'none' ? '' : 'none';
}

// Fecha menu ao clicar fora
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('userAvatar');
  if (wrap && !wrap.contains(e.target)) {
    const menu = document.getElementById('userMenu');
    if (menu) menu.style.display = 'none';
  }
});
