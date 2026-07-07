// Utilitários compartilhados por todos os módulos de render

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
