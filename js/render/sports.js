/* ---------- Hub de esportes ---------- */
let genderFilter = 'masc';

function setGenderFilter(g) {
  genderFilter = g;
  document.querySelectorAll('#genderToggle .gtab').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.g === g));
  renderSportGrid();
}

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
  const isB = currentSerie === 'B';
  const st = state.brackets[s];
  const champ = isB ? getMatchesB(s, st).final.winner : getMatches(s).final.winner;
  const complete = isB ? isSportCompleteB(s, st) : isSportComplete(s);
  // Sem prévia (r1) na Série B — quartas é a primeira rodada de fato.
  const keys = isB ? ['r2a','r2b','r2c','r2d','r3a','r3b','final'] : ['r1','r2a','r2b','r2c','r2d','r3a','r3b','final'];
  const filledCount = keys.filter(k => !!st[k]).length;
  const pct = Math.round((filledCount / keys.length) * 100);
  return `<button class="sport-card ${complete ? 'done' : ''}" data-fill="${filledCount}" onclick="openBracket('${s.replace(/'/g,"\\'")}')">
    <div class="sport-card-top">
      <span class="sport-badge ${complete ? 'done' : ''}">${complete ? 'Concluído' : 'Em aberto'}</span>
    </div>
    <div class="sport-name">${s}</div>
    <div class="sport-champ">${champ ? `Campeão: <b>${champ}</b>` : 'Aguardando'}</div>
    <div class="sport-progress">
      <div class="sport-progress-fill ${complete ? 'gold' : ''}" style="width:${pct}%"></div>
    </div>
  </button>`;
}

function renderSportGrid() {
  const done = countCompletedSports();
  const pill = document.getElementById('sportsProgressPill');
  if (pill) pill.innerHTML = `<span>${done}</span> / ${SPORT_NAMES.length} concluídos`;

  const isMobile = window.innerWidth <= 720;

  document.getElementById('sportGrid').innerHTML = SPORT_GROUPS.map(group => {
    if (isMobile) {
      const visible = group.sports.filter(s => {
        if (genderFilter === 'masc') return s.endsWith('Masc') || (!s.endsWith('Fem') && !s.endsWith('Masc'));
        return s.endsWith('Fem');
      });
      if (!visible.length) return '';
      return `<div class="sg-row">
        <div class="sg-label">${group.label}</div>
        <div class="sg-card-full">${sportCard(visible[0])}</div>
      </div>`;
    }
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
