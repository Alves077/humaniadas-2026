/* ---------- Cheerleading ---------- */
function renderCheer() {
  const grid = document.getElementById('cheerGrid');
  grid.innerHTML = '';
  const usedTeams = Object.entries(state.cheer).filter(([,t]) => t).map(([,t]) => t);

  // Série B: só 6 dos 8 times participam do cheerleading, então só 6 posições.
  const isB = currentSerie === 'B';
  const maxPos = isB ? CHEER_TEAMS_B.length : 9;
  const teamOptions = isB ? CHEER_TEAMS_B : TEAMS;

  for (let pos = 1; pos <= maxPos; pos++) {
    const current = state.cheer[pos];
    const pts = POINTS_BY_PLACEMENT[pos];
    const isTop = pos <= 3;

    const avatarHtml = current
      ? teamAvatar(current, isTop ? 52 : 36)
      : `<span class="cheer-avatar-ph" style="width:${isTop?52:36}px;height:${isTop?52:36}px;"></span>`;

    const nameHtml = (isAdmin || (!!currentUser && !viewingOfficial))
      ? (() => {
          const opts = teamOptions.map(t => {
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
      <div class="cheer-pos">${pos}º</div>
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
