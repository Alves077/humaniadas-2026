// ─── Theming por atlética ────────────────────────────────────────────────────

function _themeHexRgb(hex) {
  if (!hex || hex.length < 7) return '200,112,42';
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',');
}

function applyTeamTheme(atletica) {
  const p      = TEAM_PALETTES[atletica];
  if (!p) return;
  const accent = p.themeAccent || p.accent || '#C8702A';
  const gold   = p.gold        || accent;
  const rgb    = _themeHexRgb(accent);
  const rgbG   = _themeHexRgb(gold);
  const r      = document.documentElement;
  r.style.setProperty('--accent-rgb',    rgb);
  r.style.setProperty('--bg',            p.bg          || '#14100D');
  r.style.setProperty('--bg-end',        p.bg          || '#14100D');
  r.style.setProperty('--bg-panel',      p.bgPanel     || '#1A1208');
  r.style.setProperty('--bg-card',       p.bgCard      || '#1E160E');
  r.style.setProperty('--bg-card-hover', p.bgCardHover || '#261C12');
  r.style.setProperty('--accent',        accent);
  r.style.setProperty('--accent-dim',    `rgba(${rgb},0.10)`);
  r.style.setProperty('--accent-dark',   p.accentDark  || accent);
  r.style.setProperty('--line',          `rgba(${rgb},0.15)`);
  r.style.setProperty('--line-strong',   `rgba(${rgb},0.28)`);
  r.style.setProperty('--gold',          gold);
  r.style.setProperty('--gold-dim',      p.goldDim     || `rgba(${rgbG},0.15)`);
  r.style.setProperty('--gold-glow',     `rgba(${rgbG},0.18)`);
  r.style.setProperty('--text',          '#F0E8DE');
  r.style.setProperty('--text-dim',      p.textDim     || '#7A6050');
  r.style.setProperty('--text-mid',      p.textMid     || '#B89A80');
}

function resetTeamTheme() {
  ['--accent-rgb',
   '--bg', '--bg-end', '--bg-panel', '--bg-card', '--bg-card-hover',
   '--accent', '--accent-dim', '--accent-dark', '--line', '--line-strong',
   '--gold', '--gold-dim', '--gold-glow', '--text', '--text-dim', '--text-mid']
    .forEach(v => document.documentElement.style.removeProperty(v));
}

// ─── Estado em memória ───────────────────────────────────────────────────────

// Estado em memória
const state = { brackets: {}, cheer: {} };
// Cópia do estado oficial sempre em memória (Série A)
const officialState = { brackets: {}, cheer: {} };
// Cópia do estado oficial da Série B — mesma ideia de officialState, em paralelo.
// Não migra nada: Série A continua toda em officialState/championship_state
// como sempre foi.
const officialStateB = { brackets: {}, cheer: {} };
// true = usuário está vendo o oficial, false = vendo a própria simulação
let viewingOfficial = false;
// 'A' | 'B' — ainda não trocado por nenhuma UI (isso é Fase 6). Enquanto
// nada define currentSerie = 'B', todo código condicionado a ela é inerte.
let currentSerie = 'A';

function initState(target = state) {
  SPORT_NAMES.forEach(s => {
    target.brackets[s] = { r1: null, r2a: null, r2b: null, r2c: null, r2d: null, r3a: null, r3b: null, final: null };
  });
  for (let i = 1; i <= 9; i++) target.cheer[i] = null;
}

function switchView(official) {
  viewingOfficial = official;
  if (official) {
    // Copia estado oficial (da série ativa) para state (read-only p/ usuário comum)
    const source = currentSerie === 'B' ? officialStateB : officialState;
    SPORT_NAMES.forEach(s => {
      state.brackets[s] = { ...source.brackets[s] };
    });
    Object.keys(source.cheer).forEach(k => {
      state.cheer[k] = source.cheer[k];
    });
  } else {
    updateViewToggleUI();
    updateAdminUI();
    loadSimulation().then(() => renderAll());
    return;
  }
  renderAll();
  updateViewToggleUI();
  updateAdminUI();
}

function updateViewToggleUI() {
  const toggle = document.getElementById('viewToggle');
  if (!toggle) return;
  const onSimulacoes = location.hash === '#simulacoes';
  toggle.style.display = (currentUser && !onSimulacoes) ? '' : 'none';
  toggle.querySelectorAll('.vtab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === (viewingOfficial ? 'oficial' : 'sim'));
  });
}

initState();
initState(officialState);
initState(officialStateB);

// Cliente Supabase — só inicializa se as credenciais forem reais
const DB_READY = !SUPABASE_URL.includes('SEU_PROJECT_ID') && !SUPABASE_ANON_KEY.includes('SUA_ANON');
const db = DB_READY ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Linha separada em championship_state pro resultado oficial da Série B —
// mesma tabela, mesmo formato jsonb, id diferente. Sem migração de schema.
const CHAMPIONSHIP_ID_B = CHAMPIONSHIP_ID + '-B';

let saveTimeout = null;

function setSyncStatus(msg, cls = '') {
  const el = document.getElementById('syncStatus');
  if (!el) return;
  el.textContent = msg;
  el.className = 'sync-status ' + cls;
}

// Carrega o estado salvo no Supabase
function hideLoadingScreen() {
  const el = document.getElementById('loadingScreen');
  if (!el) return;
  el.classList.add('hidden');
  setTimeout(() => el.remove(), 500);
}

async function loadState() {
  if (!DB_READY) return;
  setSyncStatus('Carregando…');
  try {
    const { data, error } = await db
      .from('championship_state')
      .select('state')
      .eq('id', CHAMPIONSHIP_ID)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data?.state) {
      const saved = data.state;
      if (saved.brackets) {
        SPORT_NAMES.forEach(s => {
          if (saved.brackets[s]) {
            state.brackets[s] = { ...state.brackets[s], ...saved.brackets[s] };
            officialState.brackets[s] = { ...state.brackets[s] };
          }
        });
      }
      if (saved.cheer) {
        Object.entries(saved.cheer).forEach(([pos, team]) => {
          state.cheer[Number(pos)] = team;
          officialState.cheer[Number(pos)] = team;
        });
      }
    }
    setSyncStatus('');
  } catch (e) {
    console.error('Erro ao carregar estado:', e);
    setSyncStatus('Sem conexão', 'error');
  }
}

function scheduleSave() {
  if (!DB_READY) return;
  clearTimeout(saveTimeout);
  setSyncStatus('Salvando…', 'saving');
  saveTimeout = setTimeout(saveState, 800);
}

async function saveState() {
  try {
    const { error } = await db
      .from('championship_state')
      .upsert({ id: CHAMPIONSHIP_ID, state: { brackets: state.brackets, cheer: state.cheer }, updated_at: new Date().toISOString() });

    if (error) throw error;
    setSyncStatus('Salvo ✓');
    setTimeout(() => setSyncStatus(''), 2000);
  } catch (e) {
    console.error('Erro ao salvar estado:', e);
    setSyncStatus('Erro ao salvar', 'error');
  }
}

// ─── Resultado oficial da Série B — mesmo padrão de loadState/saveState,
// linha separada (CHAMPIONSHIP_ID_B) na mesma tabela ────────────────────────

async function loadStateB() {
  if (!DB_READY) return;
  setSyncStatus('Carregando…');
  try {
    const { data, error } = await db
      .from('championship_state')
      .select('state')
      .eq('id', CHAMPIONSHIP_ID_B)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data?.state) {
      const saved = data.state;
      if (saved.brackets) {
        SPORT_NAMES.forEach(s => {
          if (saved.brackets[s]) {
            state.brackets[s] = { ...state.brackets[s], ...saved.brackets[s] };
            officialStateB.brackets[s] = { ...state.brackets[s] };
          }
        });
      }
      if (saved.cheer) {
        Object.entries(saved.cheer).forEach(([pos, team]) => {
          state.cheer[Number(pos)] = team;
          officialStateB.cheer[Number(pos)] = team;
        });
      }
    }
    setSyncStatus('');
  } catch (e) {
    console.error('Erro ao carregar estado (Série B):', e);
    setSyncStatus('Sem conexão', 'error');
  }
}

function scheduleSaveB() {
  if (!DB_READY) return;
  clearTimeout(saveTimeout);
  setSyncStatus('Salvando…', 'saving');
  saveTimeout = setTimeout(saveStateB, 800);
}

async function saveStateB() {
  try {
    const { error } = await db
      .from('championship_state')
      .upsert({ id: CHAMPIONSHIP_ID_B, state: { brackets: state.brackets, cheer: state.cheer }, updated_at: new Date().toISOString() });

    if (error) throw error;
    setSyncStatus('Salvo ✓');
    setTimeout(() => setSyncStatus(''), 2000);
  } catch (e) {
    console.error('Erro ao salvar estado (Série B):', e);
    setSyncStatus('Erro ao salvar', 'error');
  }
}

// ─── Simulação do usuário ─────────────────────────────────────────────────────

async function loadSimulation() {
  if (!DB_READY || !currentUser) return;
  const { data } = await db
    .from('simulations')
    .select('brackets, cheer')
    .eq('user_id', currentUser.id)
    .single();

  initState();
  if (data) {
    if (data.brackets) {
      SPORT_NAMES.forEach(s => {
        if (data.brackets[s]) state.brackets[s] = { ...state.brackets[s], ...data.brackets[s] };
      });
    }
    if (data.cheer) {
      Object.entries(data.cheer).forEach(([pos, team]) => {
        state.cheer[Number(pos)] = team;
      });
    }
  }
}

async function saveSimulation() {
  if (!DB_READY || !currentUser) return;
  setSyncStatus('Salvando…', 'saving');
  try {
    const { error } = await db
      .from('simulations')
      .upsert({ user_id: currentUser.id, brackets: state.brackets, cheer: state.cheer, updated_at: new Date().toISOString() });
    if (error) throw error;
    setSyncStatus('Salvo ✓');
    setTimeout(() => setSyncStatus(''), 2000);
  } catch (e) {
    setSyncStatus('Erro ao salvar', 'error');
  }
}

function scheduleSimulationSave() {
  if (!DB_READY || !currentUser) return;
  clearTimeout(saveTimeout);
  setSyncStatus('Salvando…', 'saving');
  saveTimeout = setTimeout(saveSimulation, 800);
}

// ─── Atualiza o vencedor de um confronto e propaga cascata ───────────────────
function setWinner(sportName, matchKey, team) {
  if (!isAdmin && !currentUser) return;
  if (!isAdmin && viewingOfficial) return;
  state.brackets[sportName][matchKey] = team || null;

  const deps = {
    r1: ['r2a'], r2a: ['r3a'], r2b: ['r3a'],
    r2c: ['r3b'], r2d: ['r3b'], r3a: ['final'], r3b: ['final'], final: []
  };

  function cascade(k) {
    (deps[k] || []).forEach(dep => {
      state.brackets[sportName][dep] = null;
      cascade(dep);
    });
  }
  cascade(matchKey);

  renderAll();
  isAdmin ? (currentSerie === 'B' ? scheduleSaveB() : scheduleSave()) : scheduleSimulationSave();
}

// Atualiza colocação no cheerleading
function setCheer(pos, team) {
  if (!isAdmin && !currentUser) return;
  if (!isAdmin && viewingOfficial) return;
  state.cheer[pos] = team || null;
  renderAll();
  isAdmin ? (currentSerie === 'B' ? scheduleSaveB() : scheduleSave()) : scheduleSimulationSave();
}

// Zera tudo
function resetAll() {
  if (!isAdmin) return;
  if (!confirm('Isso vai zerar todos os resultados. Continuar?')) return;
  initState();
  currentSport = null;
  renderAll();
  currentSerie === 'B' ? scheduleSaveB() : scheduleSave();
}
