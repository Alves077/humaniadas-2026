/* ---------- Simulações de Terceiros ---------- */

let allSimulations = [];
let simFilter      = 'todas';
let openDetailId   = null;

// ─── Utilitários ─────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  if (!hex || hex.length < 7) return '128,128,128';
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',');
}

function countSimSports(brackets) {
  if (!brackets) return 0;
  const keys = ['r1', 'r2a', 'r2b', 'r2c', 'r2d', 'r3a', 'r3b', 'final'];
  return SPORT_NAMES.filter(s => brackets[s] && keys.some(k => !!brackets[s][k])).length;
}

function filledSports(brackets) {
  if (!brackets) return new Set();
  const keys = ['r1', 'r2a', 'r2b', 'r2c', 'r2d', 'r3a', 'r3b', 'final'];
  return new Set(SPORT_NAMES.filter(s => brackets[s] && keys.some(k => !!brackets[s][k])));
}

// Computa standings a partir de dados arbitrários sem modificar o estado global.
// Também retorna quais esportes estavam completos nesse bracket simulado — sem isso,
// "time fez 0 pontos de verdade" e "esporte ainda não simulado" ficam indistinguíveis
// (pointsForSport() retorna 0 pra todo mundo nos dois casos).
// `serie` decide qual motor usar — o dono da simulação sempre pertence a uma
// série só (via TEAM_SERIE do time escolhido no cadastro).
function computeStandingsFrom(brackets, cheer, serie = 'A') {
  const savedBrackets = JSON.parse(JSON.stringify(state.brackets));
  const savedCheer    = JSON.parse(JSON.stringify(state.cheer));
  const isB = serie === 'B';

  SPORT_NAMES.forEach(s => {
    state.brackets[s] = { r1:null, r2a:null, r2b:null, r2c:null, r2d:null, r3a:null, r3b:null, final:null };
    if (brackets?.[s]) Object.assign(state.brackets[s], brackets[s]);
  });
  for (let i = 1; i <= 9; i++) state.cheer[i] = null;
  if (cheer) Object.entries(cheer).forEach(([k, v]) => { state.cheer[Number(k)] = v; });

  const standings       = isB ? computeGeneralStandingsB() : computeGeneralStandings();
  const completedSports = new Set(SPORT_NAMES.filter(s =>
    isB ? isSportCompleteB(s, state.brackets[s]) : isSportComplete(s)));

  SPORT_NAMES.forEach(s => { state.brackets[s] = savedBrackets[s]; });
  Object.keys(savedCheer).forEach(k => { state.cheer[Number(k)] = savedCheer[k]; });

  return { standings, completedSports };
}

// ─── Tabela completa de detalhe ───────────────────────────────────────────────

function simDetailTable(sim) {
  const color       = TEAM_COLORS[sim.atletica] || '#888888';
  const rgb         = hexToRgb(color);
  const headerColor = TEAM_PALETTES[sim.atletica]?.themeAccent || color;

  if (!sim.brackets && !sim.cheer) {
    return '<p class="sim-empty" style="padding:10px 14px 8px;">Sem simulação registrada.</p>';
  }

  const serie = TEAM_SERIE[sim.atletica] || 'A';
  const { standings, completedSports } = computeStandingsFrom(sim.brackets, sim.cheer, serie);
  const anyPoints = standings.some(r => r.total > 0);

  /* thS usa a cor inline do time (headerColor) para respeitar a identidade da atlética
     independente do tema da página (admin vermelho vs. dark atlética) */
  const thS  = `style="color:${headerColor};"`;
  const head =
    `<th class="rank-col" ${thS}>Pos</th><th class="team-col" ${thS}>Time</th>` +
    SPORT_NAMES.map(s => `<th title="${s}" ${thS}>${abbreviate(s)}</th>`).join('') +
    `<th ${thS}>Cheer</th><th class="total-col" ${thS}>Total</th>`;

  const body = standings.map(r => {
    const isOwner  = r.team === sim.atletica;
    const rowStyle = isOwner
      ? `style="background:rgba(${rgb},0.15); outline:2px solid ${color}; outline-offset:-2px;"`
      : '';

    const cells = SPORT_NAMES.map(s => {
      const v      = r.perSport[s];
      const played = completedSports.has(s);
      /* cellS: owner herda var(--text) do tema — #111 no claro, #F0E8DE no escuro.
         Não usa TEAM_TEXT_COLORS que são cores claras projetadas só para bg escuro. */
      const cellS = played
        ? (isOwner
            ? `style="font-weight:600;"`
            : `style="color:var(--text-mid);"`)
        : '';
      return `<td class="${played && v === 0 ? 'zero' : ''}" ${cellS}>${played ? v : '–'}</td>`;
    }).join('');

    const posS   = isOwner ? `style="font-weight:700;"` : `style="color:var(--text-mid);"`;
    const teamS  = isOwner ? `style="font-weight:700;"` : '';
    const cheerS = r.cheer
      ? (isOwner ? `style="font-weight:600;"` : `style="color:var(--text-mid);"`)
      : '';
    /* totS do owner: cor inline do time, não var(--accent) do tema da página */
    const totS   = isOwner
      ? `style="color:${headerColor}; font-weight:700;"`
      : `style="color:var(--text-mid); font-weight:600;"`;

    return `<tr ${rowStyle}>
      <td class="rank rank-col" ${posS}>${anyPoints ? r.position : '–'}</td>
      <td class="team-col" ${teamS}>${teamAvatar(r.team, 22)} ${escHtml(r.team)}</td>
      ${cells}
      <td class="${r.cheer === 0 ? 'zero' : ''}" ${cheerS}>${r.cheer || '–'}</td>
      <td class="total total-col" ${totS}>${r.total}</td>
    </tr>`;
  }).join('');

  return `<div class="sim-detail-scroll">
    <table class="sim-detail-table standings">
      <thead style="background:rgba(${rgb},0.12);"><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
}

// ─── Card + painel expansível ─────────────────────────────────────────────────

function simUserCard(sim) {
  const color  = TEAM_COLORS[sim.atletica] || '#888888';
  const rgb    = hexToRgb(color);
  const sports = countSimSports(sim.brackets);
  const sub    = sports === 0              ? 'Sem simulação' :
                 sports === SPORT_NAMES.length ? 'Todos os esportes simulados' :
                 `${sports}/${SPORT_NAMES.length} esportes simulados`;
  const uid      = sim.user_id;
  const isOpen   = uid === openDetailId;
  const filled   = filledSports(sim.brackets);

  const dots = SPORT_NAMES.map(s =>
    `<span class="sim-sport-dot${filled.has(s) ? ' filled' : ''}" title="${s}"></span>`
  ).join('');

  const deleteBtn = isAdmin
    ? `<button class="sim-delete-btn" title="Excluir usuário" data-uid="${uid}" data-username="${escHtml(sim.username)}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      </button>`
    : '';

  return `<div class="sim-entry" data-uid="${uid}">
    <div class="sim-user-card${isOpen ? ' open' : ''}"
      style="border-left-color:${color}; background:rgba(${rgb},0.07);"
      role="button" tabindex="0"
      onclick="toggleSimDetail('${uid}')"
      onkeydown="if(event.target===event.currentTarget&&(event.key==='Enter'||event.key===' ')){event.preventDefault();toggleSimDetail('${uid}');}">
      ${teamAvatar(sim.atletica, 34)}
      <div class="sim-user-info">
        <div class="sim-user-name">${escHtml(sim.username) || '—'}</div>
        <div class="sim-user-sub">${sub}</div>
      </div>
      <div class="sim-sport-dots" aria-hidden="true">${dots}</div>
      ${deleteBtn}
      <span class="sim-user-arrow${isOpen ? ' open' : ''}">›</span>
    </div>
    <div class="sim-user-detail" id="sdd-${uid}" style="display:none;"
      data-accent="${color}"></div>
  </div>`;
}

function toggleSimDetail(userId) {
  const panel = document.getElementById('sdd-' + userId);
  const isOpen = openDetailId === userId;

  if (openDetailId) {
    const prev      = document.getElementById('sdd-' + openDetailId);
    const prevEntry = document.querySelector(`.sim-entry[data-uid="${openDetailId}"]`);
    if (prev) prev.style.display = 'none';
    if (prevEntry) {
      prevEntry.querySelector('.sim-user-card')?.classList.remove('open');
      const arr = prevEntry.querySelector('.sim-user-arrow');
      if (arr) arr.classList.remove('open');
    }
    openDetailId = null;
  }

  if (isOpen) return;

  const sim = allSimulations.find(s => s.user_id === userId);
  if (!sim || !panel) return;

  const color = TEAM_COLORS[sim.atletica] || '#888888';
  const rgb   = hexToRgb(color);

  panel.innerHTML = simDetailTable(sim);
  panel.style.display = 'block';
  panel.style.borderLeftColor = color;
  panel.style.background = `rgba(${rgb},0.06)`;

  const entry = document.querySelector(`.sim-entry[data-uid="${userId}"]`);
  if (entry) {
    entry.querySelector('.sim-user-card')?.classList.add('open');
    const arr = entry.querySelector('.sim-user-arrow');
    if (arr) arr.classList.add('open');
  }

  openDetailId = userId;
}

// ─── Render principal ─────────────────────────────────────────────────────────

function renderSimulacoes() {
  const grid     = document.getElementById('simulacoesGrid');
  const filterEl = document.getElementById('simFilter');
  if (!grid) return;

  if (!currentUser && !isAdmin) {
    grid.innerHTML = '<p class="sim-empty">Faça login para ver as simulações de outros usuários.</p>';
    if (filterEl) filterEl.innerHTML = '';
    return;
  }

  // Só mostra simulações de times da série ativa — misturar A e B na mesma
  // lista sem distinção visual seria confuso.
  const bySerie = allSimulations.filter(s => (TEAM_SERIE[s.atletica] || 'A') === currentSerie);

  if (!bySerie.length) {
    grid.innerHTML = '<p class="sim-empty">Nenhuma simulação encontrada.</p>';
    if (filterEl) filterEl.innerHTML = '';
    return;
  }

  if (filterEl) {
    const atleticas = [...new Set(bySerie.map(s => s.atletica).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'pt'));
    filterEl.innerHTML =
      `<div class="sim-pills">` +
      `<button class="sim-pill ${simFilter === 'todas' ? 'active' : ''}" onclick="setSimFilter('todas')">Todas as Atléticas</button>` +
      atleticas.map(a => {
        const ea = escHtml(a);
        return `<button class="sim-pill ${simFilter === a ? 'active' : ''}" data-atletica="${ea}">${ea}</button>`;
      }).join('') +
      `</div>` +
      `<select class="sim-filter-select cheer-select" id="simFilterSelect">
        <option value="todas" ${simFilter === 'todas' ? 'selected' : ''}>Todas as Atléticas</option>
        ${atleticas.map(a => { const ea = escHtml(a); return `<option value="${ea}" ${simFilter === a ? 'selected' : ''}>${ea}</option>`; }).join('')}
      </select>`;

    filterEl.querySelector('#simFilterSelect')
      ?.addEventListener('change', e => setSimFilter(e.target.value));
    filterEl.querySelectorAll('.sim-pill[data-atletica]').forEach(btn =>
      btn.addEventListener('click', () => setSimFilter(btn.dataset.atletica)));
    filterEl.querySelector('.sim-pill:not([data-atletica])')
      ?.addEventListener('click', () => setSimFilter('todas'));
  }

  const list = simFilter === 'todas'
    ? bySerie
    : bySerie.filter(s => s.atletica === simFilter);

  const groups = {};
  list.forEach(sim => {
    const key = sim.atletica || 'Sem atlética';
    if (!groups[key]) groups[key] = [];
    groups[key].push(sim);
  });
  Object.values(groups).forEach(g => g.sort((a, b) =>
    (a.username || '').localeCompare(b.username || '', 'pt')));

  openDetailId = null;

  grid.innerHTML = Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b, 'pt'))
    .map(([atletica, users]) =>
      `<div class="sim-group">
        <div class="sim-group-label">${escHtml(atletica)}</div>
        <div class="sim-group-cards">${users.map(simUserCard).join('')}</div>
      </div>`
    ).join('');

  grid.querySelectorAll('.sim-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      adminDeleteUser(btn.dataset.uid, btn.dataset.username);
    });
  });
}

function setSimFilter(value) {
  simFilter = value;
  if (value === 'todas') {
    currentUser?.atletica ? applyTeamTheme(currentUser.atletica) : resetTeamTheme();
  } else {
    applyTeamTheme(value);
  }
  renderSimulacoes();
}

// ─── Carga de dados ───────────────────────────────────────────────────────────

async function loadAllSimulations() {
  if (!DB_READY || (!currentUser && !isAdmin)) return;
  const [{ data: profiles, error: e1 }, { data: sims, error: e2 }] = await Promise.all([
    db.from('profiles').select('id, username, atletica'),
    db.from('simulations').select('user_id, brackets, cheer'),
  ]);
  if (e1 || e2) { console.error('Erro ao carregar simulações', e1 || e2); return; }

  const simMap = {};
  (sims || []).forEach(s => { simMap[s.user_id] = s; });

  allSimulations = (profiles || []).map(p => ({
    user_id:  p.id,
    username: p.username,
    atletica: p.atletica,
    brackets: simMap[p.id]?.brackets || null,
    cheer:    simMap[p.id]?.cheer    || null,
  }));
}

async function onSimulacoesEnter() {
  if (!currentUser && !isAdmin) { renderSimulacoes(); return; }
  if (!allSimulations.length) {
    const grid = document.getElementById('simulacoesGrid');
    if (grid) grid.innerHTML = '<p class="sim-empty">Carregando…</p>';
    await loadAllSimulations();
  }
  renderSimulacoes();
}
