// Returns an <img> that falls back to a colored initials badge if file not found
function teamAvatar(name, size = 28) {
  const slug = name.replace(/\s+/g, '_').toLowerCase();
  const color = TEAM_COLORS[name] || '#2d3f50';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `<span class="team-avatar" style="width:${size}px;height:${size}px;background:${color};flex-shrink:0;">
    <img src="img/teams/${slug}.png" alt="" width="${size}" height="${size}"
         onerror="this.style.display='none';this.parentNode.classList.add('av-text')" style="border-radius:50%;object-fit:cover;">
    <span class="av-initials" style="font-size:${Math.round(size*0.36)}px;">${initials}</span>
  </span>`;
}

function abbreviate(name) {
  return name
    .replace('Cabo Guerra', 'C.G.')
    .replace('Tenis Mesa', 'T.M.')
    .replace('Basquete', 'Basq.')
    .replace('Handebol', 'Hand.')
    .replace(' Masc', ' M').replace(' Fem', ' F');
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
  const isMobile = window.innerWidth <= 720;
  if (pill) pill.innerHTML = `<span>${done}</span> / ${SPORT_NAMES.length} ${isMobile ? '' : 'esportes '}concluídos`;

  const podiumRow = document.getElementById('podiumRow');
  const emptyCard = (cls, label) => `
    <div class="podium-card ${cls}">
      <div class="podium-rank">${label}</div>
      <div class="podium-team" style="color:var(--text-dim)">—</div>
      <div class="podium-pts">aguardando resultados</div>
      <div class="medal-bar" style="background:var(--line)"></div>
    </div>`;

  if (!anyPoints) {
    podiumRow.innerHTML = emptyCard('p2','2º Lugar') + emptyCard('p1','Campeão Geral') + emptyCard('p3','3º Lugar');
  } else {
    const top3 = standings.slice(0, 3);
    const order = [top3[1], top3[0], top3[2]];
    const cls = ['p2','p1','p3'];
    const labels = ['2º Lugar','Campeão Geral','3º Lugar'];
    podiumRow.innerHTML = order.map((r, i) => {
      if (!r || r.total === 0) return emptyCard(cls[i], labels[i]);
      return `<div class="podium-card ${cls[i]}">
        <div class="podium-rank">${labels[i]}</div>
        <div class="podium-avatar">${teamAvatar(r.team, 48)}</div>
        <div class="podium-team">${r.team}</div>
        <div class="podium-pts"><b>${r.total}</b> pts</div>
        <div class="medal-bar"></div>
      </div>`;
    }).join('');
  }

  document.getElementById('standingsHead').innerHTML =
    `<th class="rank-col">Pos</th><th class="team-col">Time</th>` +
    SPORT_NAMES.map(s => `<th title="${s}">${abbreviate(s)}</th>`).join('') +
    `<th>Cheer</th><th class="total-col">Total</th>`;

  document.getElementById('standingsBody').innerHTML = standings.map(r => {
    const cells = SPORT_NAMES.map(s => {
      const v = r.perSport[s];
      return `<td class="${v === 0 ? 'zero' : ''}">${v || '–'}</td>`;
    }).join('');
    return `<tr>
      <td class="rank rank-col">${anyPoints ? r.position : '–'}</td>
      <td class="team-col">${teamAvatar(r.team, 24)} ${r.team}</td>
      ${cells}
      <td class="${r.cheer === 0 ? 'zero' : ''}">${r.cheer || '–'}</td>
      <td class="total total-col">${r.total}</td>
    </tr>`;
  }).join('');
}

/* ---------- Hub de esportes ---------- */
const SPORT_GROUPS = [
  { label: 'Cabo de Guerra', sports: ['Cabo Guerra Masc', 'Cabo Guerra Fem'] },
  { label: 'Tênis de Mesa',  sports: ['Tenis Mesa Masc', 'Tenis Mesa Fem'] },
  { label: 'Futebol 7',      sports: ['Fut7'] },
  { label: 'Basquete',       sports: ['Basquete Masc', 'Basquete Fem'] },
  { label: 'Vôlei',          sports: ['Volei Masc', 'Volei Fem'] },
  { label: 'Handebol',       sports: ['Handebol Masc', 'Handebol Fem'] },
  { label: 'Futsal',         sports: ['Futsal Masc', 'Futsal Fem'] },
];

function sportCard(s) {
  const champ = getMatches(s).final.winner;
  const complete = isSportComplete(s);
  const st = state.brackets[s];
  const keys = ['r1','r2a','r2b','r2c','r2d','r3a','r3b','final'];
  const dots = keys.map((k, i) => {
    const filled = !!st[k];
    return `<div class="sp-dot ${filled ? (i === keys.length-1 ? 'gold' : 'done') : ''}"></div>`;
  }).join('');
  return `<button class="sport-card ${complete ? 'done' : ''}" onclick="openBracket('${s.replace(/'/g,"\\'")}')">
    <div class="sport-card-top">
      <span class="sport-icon">${SPORT_ICONS[s] || '🏅'}</span>
      <span class="sport-badge ${complete ? 'done' : ''}">${complete ? 'Concluído' : 'Em aberto'}</span>
    </div>
    <div class="sport-name">${s}</div>
    <div class="sport-champ">${champ ? `Campeão: <b>${champ}</b>` : 'Aguardando'}</div>
    <div class="sport-progress">${dots}</div>
  </button>`;
}

function renderSportGrid() {
  const done = countCompletedSports();
  const pill = document.getElementById('sportsProgressPill');
  if (pill) pill.innerHTML = `<span>${done}</span> / ${SPORT_NAMES.length} concluídos`;

  document.getElementById('sportGrid').innerHTML = SPORT_GROUPS.map(group => {
    const [s1, s2] = group.sports;
    if (!s2) {
      return `<div class="sg-row">
        <div class="sg-label">${group.label}</div>
        <div class="sg-card-full">${sportCard(s1)}</div>
      </div>`;
    }
    return `<div class="sg-row">
      <div class="sg-label">${group.label}</div>
      <div class="sg-card">${sportCard(s1)}</div>
      <div class="sg-card">${sportCard(s2)}</div>
    </div>`;
  }).join('');
}

/* ---------- Bracket ---------- */
window.__handleSelect = function(sel) {
  const idx = sel.id.indexOf('||');
  const sport = sel.id.slice(0, idx);
  const key = sel.id.slice(idx + 2);
  setWinner(sport, key, sel.value);
};

function bSlot(team, winner) {
  if (!team) return `<div class="b-slot empty"><span class="b-slot-name">—</span></div>`;
  const isWin = winner && winner === team;
  return `<div class="b-slot ${isWin ? 'winner' : ''}">${teamAvatar(team, 22)}<span class="b-slot-name">${team}</span></div>`;
}

function bSelectOrResult(slots, current, id) {
  const valid = slots.filter(Boolean);
  if (!isAdmin) {
    if (!valid.length) return `<div class="b-awaiting">—</div>`;
    if (current) return `<div class="b-result">✓ ${current}</div>`;
    return `<div class="b-awaiting">Aguardando…</div>`;
  }
  if (valid.length < 2) return `<div class="b-awaiting">aguardando rodada anterior…</div>`;
  const opts = valid.map(t => `<option value="${t}" ${t===current?'selected':''}>${t}</option>`).join('');
  return `<select id="${id}" onchange="window.__handleSelect(this)">
    <option value="">(escolha)</option>${opts}
  </select>`;
}

function bMatch(sportName, matchKey, slots) {
  const current = state.brackets[sportName][matchKey];
  const id = `${sportName}||${matchKey}`;
  return `<div class="b-match">
    ${bSlot(slots[0], current)}
    ${bSlot(slots[1], current)}
    <div class="b-select-wrap">${bSelectOrResult(slots, current, id)}</div>
  </div>`;
}

// ── Bracket dimensions ────────────────────────────────────────────────────────
const MATCH_H   = 108;                         // height of one match card
const MATCH_GAP = 40;                          // gap between the two matches per side
const BODY_H    = 2 * MATCH_H + MATCH_GAP;    // 192px — height of the flex body
const LABEL_H   = 30;                          // label row height (used by SVG offset)

const C0  = MATCH_H / 2;                      // 44 — center of top match
const C1  = MATCH_H + MATCH_GAP + MATCH_H/2; // 148 — center of bottom match
const MID = (C0 + C1) / 2;                    // 96 — midpoint → where semi/final sit
const SEMI_TOP = MID - MATCH_H / 2;           // 52 — top offset for a centered single match

// ── Column helpers ─────────────────────────────────────────────────────────────
function bCol2(label, items) {
  return `<div class="b-round">
    <div class="b-round-label">${label}</div>
    <div class="b-round-body" style="position:relative;height:${BODY_H}px;">
      <div style="position:absolute;top:0;left:8px;right:8px;">${bMatch(currentSport, items[0].key, items[0].slots)}</div>
      <div style="position:absolute;top:${MATCH_H+MATCH_GAP}px;left:8px;right:8px;">${bMatch(currentSport, items[1].key, items[1].slots)}</div>
    </div>
  </div>`;
}

function bCol1(label, key, slots) {
  return `<div class="b-round">
    <div class="b-round-label">${label}</div>
    <div class="b-round-body" style="position:relative;height:${BODY_H}px;">
      <div style="position:absolute;top:${SEMI_TOP}px;left:8px;right:8px;">${bMatch(currentSport, key, slots)}</div>
    </div>
  </div>`;
}

// ── SVG connectors ─────────────────────────────────────────────────────────────
// connFork: vertical bar on one side, horizontal line to center
// side='right' → bar on right edge (R2-left → Semi-left)
// side='left'  → bar on left edge  (R2-right → Semi-right)
function connFork(side) {
  const W = 28, H = BODY_H;
  const xBar = side === 'right' ? W - 1 : 1;
  const xH0  = side === 'right' ? 0 : 1;
  const xH1  = side === 'right' ? W - 1 : W;
  const color = 'var(--line-strong)';
  return `<div style="flex-shrink:0;width:${W}px;margin-top:${LABEL_H}px;">
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible;">
      <line x1="${xBar}" y1="${C0}" x2="${xBar}" y2="${C1}" stroke="${color}" stroke-width="1.5"/>
      <line x1="${xH0}" y1="${MID}" x2="${xH1}" y2="${MID}" stroke="${color}" stroke-width="1.5"/>
    </svg>
  </div>`;
}

// connLine: straight horizontal at MID
function connLine() {
  const W = 32, H = BODY_H;
  return `<div style="flex-shrink:0;width:${W}px;margin-top:${LABEL_H}px;">
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;">
      <line x1="0" y1="${MID}" x2="${W}" y2="${MID}" stroke="var(--line-strong)" stroke-width="1.5"/>
    </svg>
  </div>`;
}

// ── R1 feeder (rendered separately below bracket) ─────────────────────────────
function renderR1Feeder(sportName, b, m) {
  const current = m.r1.winner;
  const id = `${sportName}||r1`;
  const inner = isAdmin
    ? `<select id="${id}" onchange="window.__handleSelect(this)" style="background:var(--bg-panel);border:1px solid var(--line);color:var(--text);font-size:12px;padding:4px 8px;border-radius:4px;cursor:pointer;min-width:200px;">
        <option value="">(escolha o vencedor)</option>
        <option value="${b.B4}" ${current===b.B4?'selected':''}>${b.B4}</option>
        <option value="${b.B5}" ${current===b.B5?'selected':''}>${b.B5}</option>
       </select>`
    : `<span style="font-size:13px;color:${current?'var(--accent)':'var(--text-dim)'};">${current ? '✓ '+current : 'Aguardando…'}</span>`;

  return `<div style="background:var(--bg-card);border:1px solid var(--line);border-radius:8px;padding:12px 16px;margin-bottom:20px;max-width:560px;">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:${isAdmin?'10px':'0'};">
      <div style="font-family:var(--font-display);font-size:10px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase;white-space:nowrap;">1ª Rodada</div>
      <div style="flex:1;font-size:13px;color:var(--text-mid);">${b.B4} <span style="color:var(--text-dim);">×</span> ${b.B5}</div>
      ${!isAdmin ? inner : ''}
    </div>
    ${isAdmin ? `<div>${inner}</div>` : ''}
  </div>`;
}

let _bmActiveIdx = 0;

// bSlot variant for mobile: shows a descriptive label when team is unknown
function bSlotHint(team, winner, hint) {
  if (team) {
    const isWin = winner && winner === team;
    return `<div class="b-slot ${isWin ? 'winner' : ''}">${teamAvatar(team, 22)}<span class="b-slot-name">${team}</span></div>`;
  }
  return `<div class="b-slot empty"><span class="b-slot-name" style="font-style:normal;color:var(--text-dim);font-size:11px;">${hint}</span></div>`;
}

function bMatchHint(sportName, matchKey, slots, hints) {
  const current = state.brackets[sportName][matchKey];
  const id = `${sportName}||${matchKey}`;
  return `<div class="b-match">
    ${bSlotHint(slots[0], current, hints[0])}
    ${bSlotHint(slots[1], current, hints[1])}
    <div class="b-select-wrap">${bSelectOrResult(slots, current, id)}</div>
  </div>`;
}

// Mobile bracket layout constants
const BM_MATCH_H  = 140;   // match card height (2 slots ~50px each + select ~34px + borders)
const BM_INNER    = 16;    // gap between the two matches in a pair
const BM_PAIR_H   = BM_MATCH_H * 2 + BM_INNER;  // 296
const BM_PAIR_GAP = 40;                           // gap between the two pairs
const BM_TOTAL    = BM_PAIR_H * 2 + BM_PAIR_GAP; // 632

// Absolute top positions for each match (R2)
const BM_R2 = [
  0,                              // r2a
  BM_MATCH_H + BM_INNER,         // r2b  (156)
  BM_PAIR_H + BM_PAIR_GAP,       // r2c  (336)
  BM_PAIR_H + BM_PAIR_GAP + BM_MATCH_H + BM_INNER, // r2d  (492)
];
// Semi: centered inside each pair
const BM_SEMI_OFF = (BM_PAIR_H - BM_MATCH_H) / 2; // 78
const BM_SEMI = [
  BM_SEMI_OFF,                    // r3a  (78)
  BM_PAIR_H + BM_PAIR_GAP + BM_SEMI_OFF, // r3b  (414)
];
// Final: centered in total height
const BM_FINAL_TOP = (BM_TOTAL - BM_MATCH_H) / 2; // 246

function bmLabel(text, top) {
  return `<div style="position:absolute;top:${top - 18}px;left:0;right:0;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--text-dim);">${text}</div>`;
}

function bmColBody(innerHtml) {
  return `<div style="position:relative;height:${BM_TOTAL}px;">${innerHtml}</div>`;
}

function bmAt(top, html, label = '') {
  return `${label ? bmLabel(label, top) : ''}
    <div style="position:absolute;top:${top}px;left:0;right:0;">${html}</div>`;
}

// ── Mobile bracket (scrollable columns) ───────────────────────────────────────
function renderBracketMobile(s, b, m) {
  // save current column before re-render
  const prevScroll = document.getElementById('bmScroll');
  if (prevScroll) {
    const w = prevScroll.offsetWidth;
    if (w > 0) _bmActiveIdx = Math.round(prevScroll.scrollLeft / w);
  }
  const rounds = [
    {
      label: '1ª Rodada',
      html: bmColBody(bmAt(BM_FINAL_TOP, renderR1Feeder(s, b, m), '1ª Rodada'))
    },
    {
      label: 'Rodada 2',
      html: bmColBody(
        bmAt(BM_R2[0], bMatchHint(s,'r2a',[m.r1.winner,b.D8],['Venc. 1ª Rodada',b.D8]), 'Chave A — Jogo 1') +
        bmAt(BM_R2[1], bMatchHint(s,'r2b',[b.D10,b.D12],[b.D10,b.D12]), 'Chave A — Jogo 2') +
        bmAt(BM_R2[2], bMatchHint(s,'r2c',[b.D14,b.D16],[b.D14,b.D16]), 'Chave B — Jogo 1') +
        bmAt(BM_R2[3], bMatchHint(s,'r2d',[b.D18,b.D20],[b.D18,b.D20]), 'Chave B — Jogo 2')
      )
    },
    {
      label: 'Semifinal',
      html: bmColBody(
        bmAt(BM_SEMI[0], bMatchHint(s,'r3a',[m.r2a.winner,m.r2b.winner],['Venc. Jogo 1','Venc. Jogo 2']), 'Semifinal A') +
        bmAt(BM_SEMI[1], bMatchHint(s,'r3b',[m.r2c.winner,m.r2d.winner],['Venc. Jogo 3','Venc. Jogo 4']), 'Semifinal B')
      )
    },
    {
      label: 'Final',
      html: bmColBody(
        bmAt(BM_FINAL_TOP,
          bMatchHint(s,'final',[m.r3a.winner,m.r3b.winner],['Venc. Semi A','Venc. Semi B']) +
          `<div class="b-champion-badge ${m.final.winner?'has-winner':''}" style="margin-top:10px;">
            <span class="b-champ-trophy">🏆</span>
            <span class="b-champ-name">${m.final.winner||'—'}</span>
          </div>`,
          'Final'
        )
      )
    },
  ];

  const nav = rounds.map((r, i) =>
    `<button class="bm-pill ${i===0?'active':''}" data-idx="${i}" onclick="bmScrollTo(${i})">${r.label}</button>`
  ).join('');

  const cols = rounds.map((r, i) =>
    `<div class="bm-col" id="bmc-${i}">
      <div class="bm-col-label">${r.label}</div>
      ${r.html}
    </div>`
  ).join('');

  document.getElementById('bracketR1').innerHTML = '';
  document.getElementById('bracketTree').innerHTML =
    `<div class="bm-nav" id="bmNav">${nav}</div>
     <div class="bm-scroll" id="bmScroll">${cols}</div>`;

  // restore scroll position instantly (before paint)
  const scroll = document.getElementById('bmScroll');
  requestAnimationFrame(() => {
    scroll.scrollLeft = _bmActiveIdx * scroll.offsetWidth;
    document.querySelectorAll('.bm-pill').forEach((p, i) =>
      p.classList.toggle('active', i === _bmActiveIdx));
  });

  // sync pill on scroll
  scroll.addEventListener('scroll', () => {
    const w = scroll.offsetWidth;
    const idx = Math.round(scroll.scrollLeft / w);
    _bmActiveIdx = idx;
    document.querySelectorAll('.bm-pill').forEach((p, i) =>
      p.classList.toggle('active', i === idx));
  }, { passive: true });
}

window.bmScrollTo = function(idx) {
  const scroll = document.getElementById('bmScroll');
  if (!scroll) return;
  scroll.scrollTo({ left: idx * scroll.offsetWidth, behavior: 'smooth' });
  document.querySelectorAll('.bm-pill').forEach((p, i) =>
    p.classList.toggle('active', i === idx));
};

// ── Main bracket renderer ──────────────────────────────────────────────────────
function renderBracket() {
  const s = currentSport;
  document.getElementById('bracketTitle').textContent = s;
  document.getElementById('bracketIcon').textContent = SPORT_ICONS[s] || '🏅';

  const b = BRACKETS[s];
  const m = getMatches(s);

  if (window.innerWidth <= 720) {
    renderBracketMobile(s, b, m);
    renderBracketStandings(s);
    return;
  }

  // R2-left: top slot feeds from R1 winner
  const r2aSlots = [m.r1.winner, b.D8];
  const r2bSlots = [b.D10, b.D12];
  const r2cSlots = [b.D14, b.D16];
  const r2dSlots = [b.D18, b.D20];

  const bracketHtml = [
    bCol2('Rodada 2', [
      { key:'r2a', slots: r2aSlots },
      { key:'r2b', slots: r2bSlots },
    ]),
    connFork('right'),
    bCol1('Semifinal', 'r3a', [m.r2a.winner, m.r2b.winner]),
    connLine(),

    // Final column (match + champion badge below, all inside .b-round)
    `<div class="b-round">
      <div class="b-round-label">Final</div>
      <div class="b-round-body" style="position:relative;height:${BODY_H}px;">
        <div style="position:absolute;top:${SEMI_TOP}px;left:8px;right:8px;">
          ${bMatch(s,'final',[m.r3a.winner, m.r3b.winner])}
          <div class="b-champion-badge ${m.final.winner ? 'has-winner' : ''}">
            <span class="b-champ-trophy">🏆</span>
            <span class="b-champ-name">${m.final.winner || '—'}</span>
          </div>
        </div>
      </div>
    </div>`,

    connLine(),
    bCol1('Semifinal', 'r3b', [m.r2c.winner, m.r2d.winner]),
    connFork('left'),
    bCol2('Rodada 2', [
      { key:'r2c', slots: r2cSlots },
      { key:'r2d', slots: r2dSlots },
    ]),
  ].join('');

  document.getElementById('bracketTree').innerHTML = bracketHtml;
  document.getElementById('bracketR1').innerHTML = renderR1Feeder(s, b, m);
  renderBracketStandings(s);
}

function renderBracketStandings(s) {
  const stEl = document.getElementById('bracketStandings');
  if (!isSportComplete(s)) {
    stEl.innerHTML = `<p style="color:var(--text-dim);font-size:13px;">A colocação aparece quando o campeão for definido.</p>`;
  } else {
    const rows = computePlacements(s).map(r => `
      <tr>
        <td>${r.placement}º</td>
        <td style="display:flex;align-items:center;gap:8px;">${teamAvatar(r.team, 26)} ${r.team}</td>
        <td>${POINTS_BY_PLACEMENT[r.placement]} pts</td>
      </tr>`).join('');
    stEl.innerHTML = `<table class="bst-table">
      <thead><tr><th>Pos</th><th>Time</th><th>Pts</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }
}

/* ---------- Cheerleading ---------- */
function renderCheer() {
  const grid = document.getElementById('cheerGrid');
  grid.innerHTML = '';
  const usedTeams = Object.entries(state.cheer).filter(([,t]) => t).map(([,t]) => t);

  const MEDALS = { 1:'🥇', 2:'🥈', 3:'🥉' };

  for (let pos = 1; pos <= 9; pos++) {
    const current = state.cheer[pos];
    const pts = POINTS_BY_PLACEMENT[pos];
    const medal = MEDALS[pos] || '';
    const isTop = pos <= 3;

    const avatarHtml = current
      ? teamAvatar(current, isTop ? 52 : 36)
      : `<span class="cheer-avatar-ph" style="width:${isTop?52:36}px;height:${isTop?52:36}px;"></span>`;

    const nameHtml = isAdmin
      ? (() => {
          const opts = TEAMS.map(t => {
            const disabled = usedTeams.includes(t) && t !== current ? 'disabled' : '';
            return `<option value="${t}" ${t===current?'selected':''} ${disabled}>${t}</option>`;
          }).join('');
          return `<select class="cheer-select" onchange="setCheer(${pos}, this.value)">
            <option value="">(escolha)</option>${opts}
          </select>`;
        })()
      : `<span class="cheer-name ${!current ? 'empty' : ''}">${current || '—'}</span>`;

    const row = document.createElement('div');
    row.className = `cheer-item ${isTop ? 'top' : ''} ${pos===1?'gold':pos===2?'silver':pos===3?'bronze':''}`;
    row.innerHTML = `
      <div class="cheer-pos">${medal || pos+'º'}</div>
      <div class="cheer-av">${avatarHtml}</div>
      <div class="cheer-info">
        ${nameHtml}
      </div>
      <div class="cheer-pts">${pts} <span>pts</span></div>`;
    grid.appendChild(row);
  }

  const chosen = Object.values(state.cheer).filter(Boolean);
  const dup = chosen.length !== new Set(chosen).size;
  document.getElementById('cheerWarn').textContent =
    dup ? 'Atenção: há um time em mais de uma posição.' : '';
}

/* ---------- Render geral ---------- */
function renderAll() {
  renderGeral();
  renderSportGrid();
  if (currentSport) renderBracket();
  renderCheer();
}
