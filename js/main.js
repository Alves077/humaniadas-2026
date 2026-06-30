let currentSport = null;

function showView(name) {
  document.querySelectorAll('section.view').forEach(s => s.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('.tab[data-view]').forEach(b => b.classList.remove('active'));
  const tab = document.querySelector(`.tab[data-view="${name}"]`);
  if (tab) {
    tab.classList.add('active');
  } else if (name === 'bracket') {
    document.querySelector('.tab[data-view="chaveamentos"]').classList.add('active');
  }
}

function openBracket(sportName) {
  currentSport = sportName;
  showView('bracket');
  renderBracket();
}

document.querySelectorAll('.tab[data-view]').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

renderAll();
hideLoadingScreen();
loadState().then(() => renderAll()).catch(() => {});
