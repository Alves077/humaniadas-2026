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
  // Ao sair de simulações com filtro ativo, restaura o tema do usuário logado
  if (name !== 'simulacoes' && simFilter !== 'todas') {
    simFilter = 'todas';
    currentUser?.atletica ? applyTeamTheme(currentUser.atletica) : resetTeamTheme();
  }
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

function canEditBrackets() {
  return isAdmin || (!!currentUser && !viewingOfficial);
}

function openBracket(sportName) {
  currentSport = sportName;
  showView('bracket');
  renderBracket();
  const btn = document.getElementById('clearBracketBtn');
  if (btn) btn.style.visibility = canEditBrackets() ? 'visible' : 'hidden';
}

function clearBracket() {
  if (!canEditBrackets() || !currentSport) return;
  if (!confirm(`Limpar todos os resultados de ${currentSport}?`)) return;
  state.brackets[currentSport] = {};
  isAdmin ? saveState() : saveSimulation();
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

  const podiumMedal = ['#C8870A', '#607080', '#8A5020'];
  const podiumLabels = ['Campeão Geral', '2º Lugar', '3º Lugar'];
  const podiumOrder = [1, 0, 2];
  const podiumHtml = podiumOrder.map(i => {
    const r = top3[i];
    const slug = r ? r.team.replace(/\s+/g, '_').toLowerCase() : null;
    const color = r ? (TEAM_COLORS[r.team] || '#CCCCCC') : '#EEEEEE';
    return `<div style="flex:1;text-align:center;padding:0 8px;">
      <div style="font-size:10px;color:#909099;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">${podiumLabels[i]}</div>
      <div style="width:52px;height:52px;border-radius:50%;overflow:hidden;margin:0 auto 8px;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid ${podiumMedal[i]};">
        ${r ? `<img src="img/teams/${slug}.png" width="52" height="52" style="object-fit:cover;" onerror="this.style.display='none'">` : ''}
      </div>
      <div style="font-size:${i===0?'16px':'13px'};font-weight:700;color:#111111;margin-bottom:3px;">${r ? escHtml(r.team) : '—'}</div>
      <div style="font-size:12px;color:${podiumMedal[i]};font-weight:600;">${r && anyPoints ? r.total + ' pts' : ''}</div>
    </div>`;
  }).join('');

  const rowsHtml = standings.map((r, idx) => {
    const slug = r.team.replace(/\s+/g, '_').toLowerCase();
    const color = TEAM_COLORS[r.team] || '#CCCCCC';
    const isFirst = idx === 0;
    const rowBg = isFirst ? 'rgba(204,16,32,0.04)' : (idx % 2 === 0 ? '#FFFFFF' : '#F9F9F9');
    const borderLeft = isFirst ? 'border-left:3px solid #CC1020;' : '';
    return `<tr style="background:${rowBg};${borderLeft}border-bottom:1px solid rgba(204,16,32,0.08);">
      <td style="padding:9px 12px;font-size:13px;color:#909099;width:36px;text-align:center;">${anyPoints ? r.position : '–'}</td>
      <td style="padding:9px 14px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:26px;height:26px;border-radius:50%;overflow:hidden;background:${color};flex-shrink:0;">
            <img src="img/teams/${slug}.png" width="26" height="26" style="object-fit:cover;" onerror="this.style.display='none'">
          </div>
          <span style="font-size:14px;font-weight:600;color:#111111;">${escHtml(r.team)}</span>
        </div>
      </td>
      <td style="padding:9px 14px;font-size:14px;font-weight:700;color:#CC1020;text-align:right;">${r.total}</td>
    </tr>`;
  }).join('');

  const el = document.getElementById('exportCanvas');
  el.innerHTML = `
    <div style="background:#FFFFFF;border-radius:16px;padding:28px;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <img src="img/logo.jpg" width="40" height="40" style="border-radius:50%;object-fit:cover;">
        <div>
          <div style="font-size:18px;font-weight:700;color:#111111;line-height:1.1;">Humaniadas</div>
          <div style="font-size:11px;color:#909099;letter-spacing:2px;">2026</div>
        </div>
        <div style="margin-left:auto;font-size:11px;color:#CC1020;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Classificação Geral</div>
      </div>
      <div style="height:2px;background:linear-gradient(90deg,#CC1020,rgba(204,16,32,0.1));border-radius:1px;margin-bottom:20px;"></div>
      <div style="display:flex;align-items:flex-end;justify-content:center;margin-bottom:20px;padding:16px;background:#F4F4F6;border-radius:10px;">
        ${podiumHtml}
      </div>
      <table style="width:100%;border-collapse:collapse;border-top:2px solid #CC1020;">
        <thead>
          <tr style="background:rgba(204,16,32,0.06);">
            <th style="padding:8px 12px;font-size:10px;letter-spacing:1px;color:#CC1020;text-align:center;text-transform:uppercase;font-weight:700;">Pos</th>
            <th style="padding:8px 14px;font-size:10px;letter-spacing:1px;color:#CC1020;text-align:left;text-transform:uppercase;font-weight:700;">Time</th>
            <th style="padding:8px 14px;font-size:10px;letter-spacing:1px;color:#CC1020;text-align:right;text-transform:uppercase;font-weight:700;">Total</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(204,16,32,0.10);display:flex;flex-direction:column;align-items:center;gap:4px;">
        <img src="img/teams/spuff.png" width="26" height="26" style="border-radius:50%;object-fit:cover;opacity:0.7;">
        <span style="font-size:11px;color:#909099;">Feito pela <strong style="color:#555560;">AAASP UFF</strong></span>
        <span style="font-size:11px;color:#909099;">Patrocinado pelo <strong style="color:#555560;">Morro do Dendê</strong></span>
      </div>
    </div>
  `;

  const canvas = await html2canvas(el, {
    backgroundColor: '#F4F4F6',
    scale: 2,
    useCORS: true,
    allowTaint: true,
  });

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const file = new File([blob], 'humaniadas2026-ranking.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      // No mobile abre a folha nativa de compartilhamento (WhatsApp, Salvar em Fotos, etc.)
      await navigator.share({ files: [file], title: 'Humaniadas 2026 — Ranking' });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // usuário cancelou o compartilhamento
      // qualquer outro erro cai no fallback de download abaixo
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'humaniadas2026-ranking.png';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

function clearAllBrackets() {
  if (!canEditBrackets()) return;
  const msg = isAdmin
    ? 'Limpar os resultados de TODOS os esportes? Esta ação não pode ser desfeita.'
    : 'Limpar todos os resultados da sua simulação? Esta ação não pode ser desfeita.';
  if (!confirm(msg)) return;
  SPORT_NAMES.forEach(s => { state.brackets[s] = {}; });
  for (let i = 1; i <= 9; i++) state.cheer[i] = null;
  isAdmin ? saveState() : saveSimulation();
  renderAll();
}
