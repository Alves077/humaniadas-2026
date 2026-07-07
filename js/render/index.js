/* ---------- Render geral ---------- */
function renderAll() {
  renderGeral();
  renderSportGrid();
  if (currentSport) renderBracket();
  renderCheer();
}
