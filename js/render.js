function abbreviate(name) {
  return name
    .replace('Cabo Guerra', 'C.G.')
    .replace('Tenis Mesa', 'T.M.')
    .replace('Basquete', 'Basq.')
    .replace('Handebol', 'Hand.')
    .replace('Futsal', 'Futsal')
    .replace(' Masc', ' M')
    .replace(' Fem', ' F');
}

function countCompletedSports() {
  return SPORT_NAMES.filter(s => isSportComplete(s)).length;
}

/* ---------- Classificação Geral ---------- */
function renderGeral() {
  const standings = computeGeneralStandings();
  const anyPoints = standings.some(r => r.total > 0);
  const done = countCompletedSports();

  const pill = document.getElementById('progressPill');
  if (pill) pill.innerHTML = `<span>${done}</span> / ${SPORT_NAMES.length} esportes concluídos`;

  // pódio
  const podiumRow = document.getElementById('podiumRow');
  const empty = (cls, label) => `
    <div class="podium-card ${cls}">
      <div class="podium-rank">${label}</div>
      <div class="podium-team" style="color:var(--text-dim)">—</div>
      <div class="podium-pts">aguardando resultados</div>
      <div class="medal-bar" style="background:var(--line)"></div>
    </div>`;

  if (!anyPoints) {
    podiumRow.innerHTML = empty('p2', '2º Lugar') + empty('p1', 'Campeão Geral') + empty('p3', '3º Lugar');
  } else {
    const top3 = standings.slice(0, 3);
    const order = [top3[1], top3[0], top3[2]];
    const cls = ['p2', 'p1', 'p3'];
    const labels = ['2º Lugar', 'Campeão Geral', '3º Lugar'];
    podiumRow.innerHTML = order.map((r, i) => {
      if (!r || r.total === 0) return empty(cls[i], labels[i]);
      return `<div class="podium-card ${cls[i]}">
        <div class="podium-rank">${labels[i]}</div>
        <div class="podium-team">${r.team}</div>
        <div class="podium-pts"><b>${r.total}</b> pts</div>
        <div class="medal-bar"></div>
      </div>`;
    }).join('');
  }

  // tabela
  document.getElementById('standingsHead').innerHTML =
    `<th>Pos</th><th class="team-col">Time</th>` +
    SPORT_NAMES.map(s => `<th title="${s}">${abbreviate(s)}</th>`).join('') +
    `<th>Cheer</th><th>Total</th>`;

  document.getElementById('standingsBody').innerHTML = standings.map(r => {
    const cells = SPORT_NAMES.map(s => {
      const v = r.perSport[s];
      return `<td class="${v === 0 ? 'zero' : ''}">${v || '–'}</td>`;
    }).join('');
    return `<tr>
      <td class="rank">${anyPoints ? r.position : '–'}</td>
      <td class="team-col">${r.team}</td>
      ${cells}
      <td class="${r.cheer === 0 ? 'zero' : ''}">${r.cheer || '–'}</td>
      <td class="total">${r.total}</td>
    </tr>`;
  }).join('');
}

/* ---------- Hub de esportes ---------- */
function renderSportGrid() {
  const done = countCompletedSports();
  const pill = document.getElementById('sportsProgressPill');
  if (pill) pill.innerHTML = `<span>${done}</span> / ${SPORT_NAMES.length} concluídos`;

  document.getElementById('sportGrid').innerHTML = SPORT_NAMES.map(s => {
    const m = getMatches(s);
    const champ = m.final.winner;
    const complete = isSportComplete(s);
    const st = state.brackets[s];

    // contar rodadas feitas (r1, r2a-d, r3a-b, final)
    const keys = ['r1','r2a','r2b','r2c','r2d','r3a','r3b','final'];
    const dotsHtml = keys.map((k, i) => {
      const isLast = i === keys.length - 1;
      const filled = !!st[k];
      return `<div class="sp-dot ${filled ? (isLast ? 'gold' : 'done') : ''}"></div>`;
    }).join('');

    return `<button class="sport-card ${complete ? 'done' : ''}" onclick="openBracket('${s.replace(/'/g, "\\'")}')">
      <div class="sport-card-top">
        <span class="sport-icon">${SPORT_ICONS[s] || '🏅'}</span>
        <span class="sport-badge ${complete ? 'done' : ''}">${complete ? 'Concluído' : 'Em aberto'}</span>
      </div>
      <div class="sport-name">${s}</div>
      <div class="sport-champ">${champ ? `Campeão: <b>${champ}</b>` : 'Aguardando resultados'}</div>
      <div class="sport-progress">${dotsHtml}</div>
    </button>`;
  }).join('');
}

/* ---------- Bracket ---------- */
function selectEl(slots, current, selectId) {
  const valid = slots.filter(Boolean);
  if (!isAdmin) {
    // modo leitura: mostra só o vencedor ou traço
    if (current) return `<span class="result-winner">✓ ${current}</span>`;
    if (valid.length < 2) return `<span class="awaiting">—</span>`;
    return `<span class="awaiting">Aguardando…</span>`;
  }
  if (valid.length < 2) {
    return `<span class="awaiting">aguardando rodada anterior…</span>`;
  }
  const opts = valid.map(t => `<option value="${t}" ${t === current ? 'selected' : ''}>${t}</option>`).join('');
  return `<select id="${selectId}" onchange="window.__handleSelect(this)">
    <option value="">(escolha)</option>${opts}
  </select>`;
}

window.__handleSelect = function (sel) {
  const [sport, key] = sel.id.split('||');
  setWinner(sport, key, sel.value);
};

function matchBlock(sportName, matchKey, slots) {
  const current = state.brackets[sportName][matchKey];
  const id = `${sportName}||${matchKey}`;
  const slotsHtml = slots.map(s => {
    if (!s) return `<div class="slot bye"><span class="name">—</span></div>`;
    const isWinner = current === s;
    return `<div class="slot ${isWinner ? 'winner' : ''}"><span class="name">${s}</span></div>`;
  }).join('');
  return `<div class="match-wrap">
    <div class="match">
      ${slotsHtml}
      <div class="match-select-wrap">${selectEl(slots, current, id)}</div>
    </div>
  </div>`;
}

function renderBracket() {
  const s = currentSport;
  document.getElementById('bracketTitle').textContent = s;
  document.getElementById('bracketIcon').textContent = SPORT_ICONS[s] || '🏅';

  const b = BRACKETS[s];
  const m = getMatches(s);

  // helper: connector column between two rounds with N pairs
  function connectors(n) {
    const pairs = Array.from({length: n}, () => `<div class="connector-pair"></div>`).join('');
    return `<div class="connector-col" style="justify-content:space-around;">${pairs}</div>`;
  }

  document.getElementById('bracketTree').innerHTML = `
    <!-- Rodada 1 -->
    <div class="round-col" style="min-width:190px">
      <div class="round-label">1ª Rodada</div>
      <div class="round-matches" style="justify-content:center;">
        ${matchBlock(s, 'r1', [b.B4, b.B5])}
      </div>
    </div>

    <!-- Conector -->
    ${connectors(1)}

    <!-- Rodada 2 -->
    <div class="round-col" style="min-width:190px">
      <div class="round-label">Rodada 2</div>
      <div class="round-matches">
        ${matchBlock(s, 'r2a', [m.r1.winner, b.D8])}
        ${matchBlock(s, 'r2b', [b.D10, b.D12])}
        ${matchBlock(s, 'r2c', [b.D14, b.D16])}
        ${matchBlock(s, 'r2d', [b.D18, b.D20])}
      </div>
    </div>

    <!-- Conector -->
    ${connectors(2)}

    <!-- Semifinal -->
    <div class="round-col" style="min-width:190px">
      <div class="round-label">Semifinal</div>
      <div class="round-matches">
        ${matchBlock(s, 'r3a', [m.r2a.winner, m.r2b.winner])}
        ${matchBlock(s, 'r3b', [m.r2c.winner, m.r2d.winner])}
      </div>
    </div>

    <!-- Conector -->
    ${connectors(1)}

    <!-- Final -->
    <div class="round-col" style="min-width:190px">
      <div class="round-label">Final</div>
      <div class="round-matches" style="justify-content:center;">
        ${matchBlock(s, 'final', [m.r3a.winner, m.r3b.winner])}
      </div>
    </div>

    <!-- Campeão -->
    <div class="final-block">
      <div class="final-label">🏆 Campeão</div>
      <div class="final-winner">
        ${m.final.winner
          ? `<div class="team-name">${m.final.winner}</div>`
          : `<div class="team-empty">—</div>`}
      </div>
    </div>
  `;

  const stEl = document.getElementById('bracketStandings');
  if (!isSportComplete(s)) {
    stEl.innerHTML = `<div style="color:var(--text-dim);font-size:12.5px;padding:6px 0;">
      A colocação aparece quando o campeão for definido.
    </div>`;
  } else {
    stEl.innerHTML = computePlacements(s).map(r => `
      <div class="mini-item">
        <span class="pos">${r.placement}º</span>
        <span class="name">${r.team}</span>
        <span class="pts">${POINTS_BY_PLACEMENT[r.placement]} pts</span>
      </div>`).join('');
  }
}

/* ---------- Cheerleading ---------- */
function renderCheer() {
  const grid = document.getElementById('cheerGrid');
  grid.innerHTML = '';
  const usedTeams = Object.entries(state.cheer)
    .filter(([, t]) => t).map(([, t]) => t);

  for (let pos = 1; pos <= 9; pos++) {
    const current = state.cheer[pos];
    const row = document.createElement('div');
    row.className = 'cheer-row';

    if (isAdmin) {
      const opts = TEAMS.map(t => {
        const disabled = usedTeams.includes(t) && t !== current ? 'disabled' : '';
        return `<option value="${t}" ${t === current ? 'selected' : ''} ${disabled}>${t}</option>`;
      }).join('');
      row.innerHTML = `
        <span class="pos-badge">${pos}º</span>
        <select onchange="setCheer(${pos}, this.value)">
          <option value="">(escolha)</option>${opts}
        </select>
        <span class="pts-tag">${POINTS_BY_PLACEMENT[pos]} pts</span>
      `;
    } else {
      row.innerHTML = `
        <span class="pos-badge">${pos}º</span>
        <span class="cheer-team-name">${current || '—'}</span>
        <span class="pts-tag">${POINTS_BY_PLACEMENT[pos]} pts</span>
      `;
    }
    grid.appendChild(row);
  }

  const chosen = Object.values(state.cheer).filter(Boolean);
  const dup = chosen.length !== new Set(chosen).size;
  document.getElementById('cheerWarn').textContent =
    dup ? 'Atenção: há um time selecionado em mais de uma posição.' : '';
}

/* ---------- Render geral ---------- */
function renderAll() {
  renderGeral();
  renderSportGrid();
  if (currentSport) renderBracket();
  renderCheer();
}
