// Estado em memória
const state = { brackets: {}, cheer: {} };

function initState() {
  SPORT_NAMES.forEach(s => {
    state.brackets[s] = { r1: null, r2a: null, r2b: null, r2c: null, r2d: null, r3a: null, r3b: null, final: null };
  });
  for (let i = 1; i <= 9; i++) state.cheer[i] = null;
}

initState();

// Cliente Supabase — só inicializa se as credenciais forem reais
const DB_READY = !SUPABASE_URL.includes('SEU_PROJECT_ID') && !SUPABASE_ANON_KEY.includes('SUA_ANON');
const db = DB_READY ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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
          if (saved.brackets[s]) state.brackets[s] = { ...state.brackets[s], ...saved.brackets[s] };
        });
      }
      if (saved.cheer) {
        Object.entries(saved.cheer).forEach(([pos, team]) => {
          state.cheer[Number(pos)] = team;
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

// Atualiza o vencedor de um confronto e propaga cascata
function setWinner(sportName, matchKey, team) {
  if (!isAdmin) return;
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
  scheduleSave();
}

// Atualiza colocação no cheerleading
function setCheer(pos, team) {
  if (!isAdmin) return;
  state.cheer[pos] = team || null;
  renderAll();
  scheduleSave();
}

// Zera tudo
function resetAll() {
  if (!confirm('Isso vai zerar todos os resultados. Continuar?')) return;
  initState();
  currentSport = null;
  renderAll();
  scheduleSave();
}
