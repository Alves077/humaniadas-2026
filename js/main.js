let currentSport = null;

function showView(name) {
  document.querySelectorAll('section.view').forEach(s => s.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-item[data-view="${name}"]`);
  if (navBtn) {
    navBtn.classList.add('active');
  } else if (name === 'bracket') {
    document.querySelector('.nav-item[data-view="chaveamentos"]').classList.add('active');
  }
}

function openBracket(sportName) {
  currentSport = sportName;
  showView('bracket');
  renderBracket();
}

document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

// Renderiza e mostra a UI imediatamente — sem esperar o banco
renderAll();
hideLoadingScreen();

// Carrega do Supabase em background; quando chegar, re-renderiza
loadState().then(() => renderAll()).catch(() => {});
