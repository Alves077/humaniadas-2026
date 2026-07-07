let currentSport = null;

function toggleMobileMenu() {
  document.getElementById('burgerBtn').classList.toggle('open');
  document.getElementById('mobileNav').classList.toggle('open');
  document.getElementById('navBackdrop').classList.toggle('open');
}

function mobileNavTo(view) {
  showView(view);
  if (view === 'simulacoes') onSimulacoesEnter();
  document.getElementById('burgerBtn').classList.remove('open');
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('navBackdrop').classList.remove('open');
}

function showView(name) {
  document.querySelectorAll('section.view').forEach(s => s.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');

  const activeTab = name === 'bracket' ? 'chaveamentos' : name;
  document.querySelectorAll('.tab[data-view]').forEach(b =>
    b.classList.toggle('active', b.dataset.view === activeTab));
  document.querySelectorAll('.mobile-tab[data-view]').forEach(b =>
    b.classList.toggle('active', b.dataset.view === activeTab));

  if (location.hash !== '#' + name) history.pushState(null, '', '#' + name);

  const toggle = document.getElementById('viewToggle');
  if (toggle) {
    toggle.style.display = (name === 'simulacoes' || !currentUser) ? 'none' : '';
  }
}

const VALID_VIEWS = ['geral', 'chaveamentos', 'cheerleading', 'simulacoes', 'bracket'];

function resolveHash() {
  const view = location.hash.slice(1) || 'geral';
  if (!VALID_VIEWS.includes(view)) { showView('geral'); return; }
  if (view === 'bracket') {
    if (currentSport) { showView('bracket'); renderBracket(); }
    else showView('chaveamentos');
    return;
  }
  showView(view);
  if (view === 'simulacoes') onSimulacoesEnter();
}

window.addEventListener('popstate', resolveHash);

function openBracket(sportName) {
  currentSport = sportName;
  showView('bracket');
  renderBracket();
  const btn = document.getElementById('clearBracketBtn');
  if (btn) btn.style.visibility = isAdmin ? 'visible' : 'hidden';
}

function clearBracket() {
  if (!isAdmin || !currentSport) return;
  if (!confirm(`Limpar todos os resultados de ${currentSport}?`)) return;
  state.brackets[currentSport] = {};
  saveState();
  renderAll();
}

document.querySelectorAll('.tab[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    showView(btn.dataset.view);
    if (btn.dataset.view === 'simulacoes') onSimulacoesEnter();
  });
});

renderAll();
resolveHash();
hideLoadingScreen();
loadState().then(() => renderAll()).catch(() => {});
initAuth().catch(() => {});

async function exportRanking() {
  const standings = computeGeneralStandings();
  const anyPoints = standings.some(r => r.total > 0);
  const top3 = standings.slice(0, 3);

  // Build podium HTML
  const podiumColors = { 0: '#f0c040', 1: '#c0c8d0', 2: '#d08050' };
  const podiumLabels = ['🥇 Campeão', '🥈 2º Lugar', '🥉 3º Lugar'];
  const podiumOrder = [1, 0, 2]; // silver, gold, bronze layout
  const podiumHtml = podiumOrder.map(i => {
    const r = top3[i];
    const slug = r ? r.team.replace(/\s+/g, '_').toLowerCase() : null;
    const color = r ? (TEAM_COLORS[r.team] || '#2d3f50') : '#1e2c38';
    return `<div style="flex:1;text-align:center;padding:0 8px;">
      <div style="font-size:11px;color:#6a808e;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">${podiumLabels[i]}</div>
      <div style="width:56px;height:56px;border-radius:50%;overflow:hidden;margin:0 auto 10px;background:${color};display:flex;align-items:center;justify-content:center;">
        ${r ? `<img src="img/teams/${slug}.png" width="56" height="56" style="object-fit:cover;" onerror="this.style.display='none'">` : ''}
      </div>
      <div style="font-size:${i===0?'17px':'14px'};font-weight:700;color:${podiumColors[i] || '#e8eef2'};margin-bottom:4px;">${r ? escHtml(r.team) : '—'}</div>
      <div style="font-size:13px;color:#6a808e;">${r && anyPoints ? r.total + ' pts' : ''}</div>
    </div>`;
  }).join('');

  // Build table rows
  const rowsHtml = standings.map((r, idx) => {
    const slug = r.team.replace(/\s+/g, '_').toLowerCase();
    const color = TEAM_COLORS[r.team] || '#2d3f50';
    const medal = ['🥇','🥈','🥉'][idx] || '';
    return `<tr style="border-bottom:1px solid #1e2c38;">
      <td style="padding:9px 12px;font-size:13px;color:#6a808e;width:36px;">${medal || (anyPoints ? r.position+'º' : '–')}</td>
      <td style="padding:9px 12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:28px;height:28px;border-radius:50%;overflow:hidden;background:${color};flex-shrink:0;">
            <img src="img/teams/${slug}.png" width="28" height="28" style="object-fit:cover;" onerror="this.style.display='none'">
          </div>
          <span style="font-size:14px;font-weight:600;color:#e8eef2;">${escHtml(r.team)}</span>
        </div>
      </td>
      <td style="padding:9px 12px;font-size:14px;font-weight:700;color:#f0c040;text-align:right;">${r.total} pts</td>
    </tr>`;
  }).join('');

  const el = document.getElementById('exportCanvas');
  el.innerHTML = `
    <div style="margin-bottom:24px;text-align:center;">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#6a808e;margin-bottom:4px;">Humaniadas 2026</div>
      <div style="font-size:22px;font-weight:700;color:#e8eef2;">Classificação Geral</div>
    </div>
    <div style="display:flex;align-items:flex-end;justify-content:center;margin-bottom:28px;padding:20px;background:#0e1419;border-radius:12px;border:1px solid #1e2c38;">
      ${podiumHtml}
    </div>
    <table style="width:100%;border-collapse:collapse;background:#0e1419;border-radius:10px;overflow:hidden;border:1px solid #1e2c38;">
      <thead>
        <tr style="background:rgba(255,255,255,0.03);border-bottom:1px solid #1e2c38;">
          <th style="padding:8px 12px;font-size:10px;letter-spacing:1px;color:#6a808e;text-align:left;text-transform:uppercase;">Pos</th>
          <th style="padding:8px 12px;font-size:10px;letter-spacing:1px;color:#6a808e;text-align:left;text-transform:uppercase;">Time</th>
          <th style="padding:8px 12px;font-size:10px;letter-spacing:1px;color:#6a808e;text-align:right;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div style="margin-top:16px;text-align:right;font-size:10px;color:#2d3f50;">humaniadas2026.vercel.app</div>
  `;

  const canvas = await html2canvas(el, {
    backgroundColor: '#080c10',
    scale: 2,
    useCORS: true,
    allowTaint: true,
  });

  const dataUrl = canvas.toDataURL('image/png');

  // Try Web Share API first (native share sheet on mobile / supported browsers)
  if (navigator.canShare) {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'humaniadas2026-ranking.png', { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Humaniadas 2026 — Ranking' });
      return;
    }
  }

  // Fallback: direct download
  const link = document.createElement('a');
  link.download = 'humaniadas2026-ranking.png';
  link.href = dataUrl;
  link.click();
}
