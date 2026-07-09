// ─── Motor de bracket genérico (quartas -> semi -> final) ─────────────────────
// Compartilhado pelas duas séries. Série A tem uma prévia opcional (r1) que
// alimenta uma das quartas; Série B entra direto nas quartas.
//
// resolveMatch NUNCA infere vencedor sozinho — sempre usa o que está salvo.
// Um slot nulo aqui pode significar "aguardando rodada anterior" (Série A,
// ex: r1 ainda não decidido) e nesse caso não é bye nenhum.
//
// Bye é outra coisa: existe só na Série B, é uma característica ESTÁTICA da
// topologia (BRACKETS_B tem null fixo pra aquele time não ter adversário,
// nunca vai ter), resolvido separadamente em resolveQuarterB — nunca aqui.

function resolveMatch(slots, storedWinner) {
  return { slots, winner: storedWinner || null };
}

function buildKnockoutMatches(quarterMatches, savedState) {
  const [r2a, r2b, r2c, r2d] = quarterMatches;
  const r3a = resolveMatch([r2a.winner, r2b.winner], savedState.r3a);
  const r3b = resolveMatch([r2c.winner, r2d.winner], savedState.r3b);
  const final = resolveMatch([r3a.winner, r3b.winner], savedState.final);
  return { r2a, r2b, r2c, r2d, r3a, r3b, final };
}

// Colocação 1..N a partir de matches já resolvidos. N = 9 se tiver prévia
// (Série A), 8 se não (Série B) — sem prévia não existe "perdedor da 1ª rodada".
function placementsFromMatches(matches, teams) {
  const loser = (match) =>
    match && match.winner ? match.slots.find(t => t && t !== match.winner) : null;

  const findR2 = (bracket, winner) =>
    winner ? bracket.find(r => r.winner === winner) : null;

  const p = {};

  // 1º e 2º — final
  p[1] = matches.final.winner;
  p[2] = loser(matches.final);

  // 3º e 4º — semis
  const champSemi = matches.r3a.winner === p[1] ? matches.r3a : matches.r3b;
  const viceSemi  = matches.r3a.winner === p[2] ? matches.r3a : matches.r3b;
  p[3] = loser(champSemi);
  p[4] = loser(viceSemi);

  // 5º a 8º — quartas, ordenados pelo placement de quem os eliminou
  const champBracket = matches.r3a.winner === p[1] ? [matches.r2a, matches.r2b] : [matches.r2c, matches.r2d];
  const viceBracket  = matches.r3a.winner === p[2] ? [matches.r2a, matches.r2b] : [matches.r2c, matches.r2d];

  p[5] = loser(findR2(champBracket, p[1]));
  p[6] = loser(findR2(viceBracket,  p[2]));
  p[7] = loser(findR2(champBracket, p[3]));
  p[8] = loser(findR2(viceBracket,  p[4]));

  // 9º — perdedor da 1ª rodada (só existe se o esporte tiver prévia)
  const maxPlacement = matches.r1 ? 9 : 8;
  if (matches.r1) p[9] = loser(matches.r1);

  const placed = new Set();
  const rows = [];
  for (let placement = 1; placement <= maxPlacement; placement++) {
    if (p[placement]) {
      rows.push({ team: p[placement], placement });
      placed.add(p[placement]);
    }
  }

  // Times sem colocação (bracket incompleto)
  teams.forEach(team => {
    if (!placed.has(team)) rows.push({ team, placement: null });
  });

  return rows;
}

// ─── Série A (9 times, com prévia) ─────────────────────────────────────────────
// Mesma assinatura e comportamento de sempre — nada muda pra quem já chama isso.

function getMatches(sportName) {
  const b  = BRACKETS[sportName];
  const st = state.brackets[sportName];
  const r1 = resolveMatch([b.B4, b.B5], st.r1);
  const quarterMatches = [
    resolveMatch([r1.winner, b.D8], st.r2a),
    resolveMatch([b.D10, b.D12],    st.r2b),
    resolveMatch([b.D14, b.D16],    st.r2c),
    resolveMatch([b.D18, b.D20],    st.r2d),
  ];
  return { r1, ...buildKnockoutMatches(quarterMatches, st) };
}

function isSportComplete(sportName) {
  return !!getMatches(sportName).final.winner;
}

function computePlacements(sportName) {
  return placementsFromMatches(getMatches(sportName), TEAMS);
}

// Pontos de cada time em um esporte (só conta quando o campeão está definido)
function pointsForSport(sportName) {
  const pts = {};
  TEAMS.forEach(t => pts[t] = 0);
  if (!isSportComplete(sportName)) return pts;
  computePlacements(sportName).forEach(r => {
    pts[r.team] = POINTS_BY_PLACEMENT[r.placement] || 0;
  });
  return pts;
}

// Classificação geral somando todos os esportes + cheerleading
function computeGeneralStandings() {
  const totals = {};
  TEAMS.forEach(t => totals[t] = { team: t, perSport: {}, total: 0, cheer: 0 });

  SPORT_NAMES.forEach(sport => {
    const pts = pointsForSport(sport);
    TEAMS.forEach(t => {
      totals[t].perSport[sport] = pts[t] || 0;
      totals[t].total += pts[t] || 0;
    });
  });

  for (let pos = 1; pos <= 9; pos++) {
    const team = state.cheer[pos];
    if (team && totals[team]) {
      totals[team].cheer = POINTS_BY_PLACEMENT[pos];
      totals[team].total += POINTS_BY_PLACEMENT[pos];
    }
  }

  const arr = Object.values(totals);
  arr.sort((a, b) => b.total - a.total);
  arr.forEach((r, i) => r.position = i + 1);
  return arr;
}

// ─── Série B (8 times, direto nas quartas, com suporte a bye) ──────────────────
// `st` é o estado salvo daquele esporte ({r2a,r2b,r2c,r2d,r3a,r3b,final}) —
// passado explicitamente pelo chamador em vez de ler de um global, já que o
// namespace de estado da Série B ainda vai ser definido na Fase 3.

// Bye só existe aqui: os dois slots de uma quarta na Série B vêm sempre
// prontos da topologia estática (BRACKETS_B), nunca dependem de outra
// partida — diferente da Série A, onde um slot nulo é só "pendente".
function resolveQuarterB(slots, storedWinner) {
  const valid = slots.filter(Boolean);
  if (valid.length === 1) return { slots, winner: valid[0] }; // bye
  return resolveMatch(slots, storedWinner);
}

function getMatchesB(sportName, st) {
  const quarterSlots = BRACKETS_B[sportName];
  const quarterMatches = [
    resolveQuarterB(quarterSlots[0], st.r2a),
    resolveQuarterB(quarterSlots[1], st.r2b),
    resolveQuarterB(quarterSlots[2], st.r2c),
    resolveQuarterB(quarterSlots[3], st.r2d),
  ];
  return buildKnockoutMatches(quarterMatches, st);
}

function isSportCompleteB(sportName, st) {
  return !!getMatchesB(sportName, st).final.winner;
}

function computePlacementsB(sportName, st) {
  // Usa os times que de fato estão nesse chaveamento, não TEAMS_B inteiro —
  // esportes com bye (ex: Futsal Fem) têm menos de 8 participantes, e um time
  // de fora não deve aparecer como "sem colocação" num esporte que ele nem joga.
  const teamsInBracket = BRACKETS_B[sportName].flat().filter(Boolean);
  return placementsFromMatches(getMatchesB(sportName, st), teamsInBracket);
}

function pointsForSportB(sportName, st) {
  const pts = {};
  TEAMS_B.forEach(t => pts[t] = 0);
  if (!isSportCompleteB(sportName, st)) return pts;
  computePlacementsB(sportName, st).forEach(r => {
    pts[r.team] = POINTS_BY_PLACEMENT[r.placement] || 0;
  });
  return pts;
}

// Classificação geral da Série B — mesma ideia de computeGeneralStandings(),
// mas com TEAMS_B/CHEER_TEAMS_B e só 6 posições de cheer (só 6 dos 8 times
// participam do cheerleading da Série B).
function computeGeneralStandingsB() {
  const totals = {};
  TEAMS_B.forEach(t => totals[t] = { team: t, perSport: {}, total: 0, cheer: 0 });

  SPORT_NAMES.forEach(sport => {
    const pts = pointsForSportB(sport, state.brackets[sport]);
    TEAMS_B.forEach(t => {
      totals[t].perSport[sport] = pts[t] || 0;
      totals[t].total += pts[t] || 0;
    });
  });

  for (let pos = 1; pos <= CHEER_TEAMS_B.length; pos++) {
    const team = state.cheer[pos];
    if (team && totals[team]) {
      totals[team].cheer = POINTS_BY_PLACEMENT[pos];
      totals[team].total += POINTS_BY_PLACEMENT[pos];
    }
  }

  const arr = Object.values(totals);
  arr.sort((a, b) => b.total - a.total);
  arr.forEach((r, i) => r.position = i + 1);
  return arr;
}
