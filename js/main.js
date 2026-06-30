let currentSport = null;

function showView(name) {
  document.querySelectorAll('section.view').forEach(s => s.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('#mainTabs button').forEach(b => b.classList.remove('active'));
  const tabBtn = document.querySelector(`#mainTabs button[data-view="${name}"]`);
  if (tabBtn) {
    tabBtn.classList.add('active');
  } else if (name === 'bracket') {
    document.querySelector('#mainTabs button[data-view="chaveamentos"]').classList.add('active');
  }
}

function openBracket(sportName) {
  currentSport = sportName;
  showView('bracket');
  renderBracket();
}

document.querySelectorAll('#mainTabs button').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

// Inicializa: carrega do Supabase e renderiza
loadState().then(() => renderAll());
