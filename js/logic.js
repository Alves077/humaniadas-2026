// Retorna os 8 confrontos de um esporte com slots e vencedor atual
function getMatches(sportName) {
  const b = BRACKETS[sportName];
  const st = state.brackets[sportName];
  return {
    r1:    { slots: [b.B4,    b.B5  ], winner: st.r1    },
    r2a:   { slots: [st.r1,  b.D8  ], winner: st.r2a   },
    r2b:   { slots: [b.D10,  b.D12 ], winner: st.r2b   },
    r2c:   { slots: [b.D14,  b.D16 ], winner: st.r2c   },
    r2d:   { slots: [b.D18,  b.D20 ], winner: st.r2d   },
    r3a:   { slots: [st.r2a, st.r2b], winner: st.r3a   },
    r3b:   { slots: [st.r2c, st.r2d], winner: st.r3b   },
    final: { slots: [st.r3a, st.r3b], winner: st.final },
  };
}

function isSportComplete(sportName) {
  return !!getMatches(sportName).final.winner;
}

// Colocação 1..9: cada place determinado por quem eliminou quem, em cascata
function computePlacements(sportName) {
  const m = getMatches(sportName);

  const loser = (match) =>
    match && match.winner ? match.slots.find(t => t && t !== match.winner) : null;

  const findR2 = (bracket, winner) =>
    winner ? bracket.find(r => r.winner === winner) : null;

  const p = {};

  // 1º e 2º — final
  p[1] = m.final.winner;
  p[2] = loser(m.final);

  // 3º e 4º — semis
  const champSemi = m.r3a.winner === p[1] ? m.r3a : m.r3b;
  const viceSemi  = m.r3a.winner === p[2] ? m.r3a : m.r3b;
  p[3] = loser(champSemi);
  p[4] = loser(viceSemi);

  // 5º a 8º — quartas, ordenados pelo placement de quem os eliminou
  // r3a vem de r2a+r2b; r3b vem de r2c+r2d
  const champBracket = m.r3a.winner === p[1] ? [m.r2a, m.r2b] : [m.r2c, m.r2d];
  const viceBracket  = m.r3a.winner === p[2] ? [m.r2a, m.r2b] : [m.r2c, m.r2d];

  p[5] = loser(findR2(champBracket, p[1]));
  p[6] = loser(findR2(viceBracket,  p[2]));
  p[7] = loser(findR2(champBracket, p[3]));
  p[8] = loser(findR2(viceBracket,  p[4]));

  // 9º — perdedor da 1ª rodada
  p[9] = loser(m.r1);

  // Monta array
  const placed = new Set();
  const rows = [];
  for (let placement = 1; placement <= 9; placement++) {
    if (p[placement]) {
      rows.push({ team: p[placement], placement });
      placed.add(p[placement]);
    }
  }

  // Times sem colocação (bracket incompleto)
  TEAMS.forEach(team => {
    if (!placed.has(team)) rows.push({ team, placement: null });
  });

  return rows;
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