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
