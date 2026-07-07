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
  return `<div class="b-slot ${isWin ? 'winner' : ''}">${teamAvatar(team, 22)}<span class="b-slot-name">${escHtml(team)}</span></div>`;
}

function bSelectOrResult(slots, current, id) {
  const valid = slots.filter(Boolean);
  const canEdit = isAdmin || (!!currentUser && !viewingOfficial);
  if (!canEdit) {
    if (!valid.length) return `<div class="b-awaiting">—</div>`;
    if (current) return `<div class="b-result">✓ ${escHtml(current)}</div>`;
    return `<div class="b-awaiting">Aguardando…</div>`;
  }
  if (valid.length < 2) return `<div class="b-awaiting">aguardando rodada anterior…</div>`;
  const opts = valid.map(t => `<option value="${escHtml(t)}" ${t===current?'selected':''}>${escHtml(t)}</option>`).join('');
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
const MATCH_H   = 108;
const MATCH_GAP = 40;
const BODY_H    = 2 * MATCH_H + MATCH_GAP;
const LABEL_H   = 30;

const C0  = MATCH_H / 2;
const C1  = MATCH_H + MATCH_GAP + MATCH_H/2;
const MID = (C0 + C1) / 2;
const SEMI_TOP = MID - MATCH_H / 2;

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
  const selectOrResult = (isAdmin || (!!currentUser && !viewingOfficial))
    ? `<select id="${id}" onchange="window.__handleSelect(this)" style="background:var(--bg-panel);border:1px solid var(--line);color:var(--text);font-size:11px;padding:3px 6px;border-radius:4px;cursor:pointer;width:100%;">
        <option value="">(escolha)</option>
        <option value="${b.B4}" ${current===b.B4?'selected':''}>${b.B4}</option>
        <option value="${b.B5}" ${current===b.B5?'selected':''}>${b.B5}</option>
       </select>`
    : `<span style="font-size:11px;color:${current?'var(--accent)':'var(--text-dim)'};">${current ? '✓ '+current : 'Aguardando…'}</span>`;

  return `<div style="display:flex;align-items:stretch;gap:0;max-width:360px;margin-bottom:16px;background:var(--bg-card);border:1px solid var(--line);border-radius:8px;overflow:hidden;">
    <div style="flex:1;">
      <div class="b-slot ${current===b.B4?'winner':''}">${teamAvatar(b.B4,22)}<span class="b-slot-name">${b.B4}</span></div>
      <div class="b-slot ${current===b.B5?'winner':''}">${teamAvatar(b.B5,22)}<span class="b-slot-name">${b.B5}</span></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:center;padding:8px 10px;border-left:1px solid var(--line);min-width:110px;">
      ${selectOrResult}
    </div>
  </div>`;
}

// ── Mobile bracket ─────────────────────────────────────────────────────────────
let _bmActiveIdx = 0;

function bSlotHint(team, winner, hint) {
  if (team) {
    const isWin = winner && winner === team;
    return `<div class="b-slot ${isWin ? 'winner' : ''}">${teamAvatar(team, 22)}<span class="b-slot-name">${escHtml(team)}</span></div>`;
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

// Mobile bracket layout constants — calibrados para card de ~140px; não alterar sem recalibrar
const BM_MATCH_H  = 140;
const BM_INNER    = 16;
const BM_PAIR_H   = BM_MATCH_H * 2 + BM_INNER;  // 296
const BM_PAIR_GAP = 40;
const BM_TOTAL    = BM_PAIR_H * 2 + BM_PAIR_GAP; // 632

const BM_R2 = [
  0,
  BM_MATCH_H + BM_INNER,
  BM_PAIR_H + BM_PAIR_GAP,
  BM_PAIR_H + BM_PAIR_GAP + BM_MATCH_H + BM_INNER,
];
const BM_SEMI_OFF = (BM_PAIR_H - BM_MATCH_H) / 2; // 78
const BM_SEMI = [
  BM_SEMI_OFF,
  BM_PAIR_H + BM_PAIR_GAP + BM_SEMI_OFF,
];
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

function renderBracketMobile(s, b, m) {
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

  const scroll = document.getElementById('bmScroll');
  requestAnimationFrame(() => {
    scroll.scrollLeft = _bmActiveIdx * scroll.offsetWidth;
    document.querySelectorAll('.bm-pill').forEach((p, i) =>
      p.classList.toggle('active', i === _bmActiveIdx));
  });

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
