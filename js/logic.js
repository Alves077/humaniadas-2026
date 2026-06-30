// Retorna os 8 confrontos de um esporte com slots e vencedor atual
function getMatches(sportName) {
  const b = BRACKETS[sportName];
  const st = state.brackets[sportName];
  return {
    r1:    { slots: [b.B4,       b.B5      ], winner: st.r1    },
    r2a:   { slots: [st.r1,      b.D8      ], winner: st.r2a   },
    r2b:   { slots: [b.D10,      b.D12     ], winner: st.r2b   },
    r2c:   { slots: [b.D14,      b.D16     ], winner: st.r2c   },
    r2d:   { slots: [b.D18,      b.D20     ], winner: st.r2d   },
    r3a:   { slots: [st.r2a,     st.r2b    ], winner: st.r3a   },
    r3b:   { slots: [st.r2c,     st.r2d    ], winner: st.r3b   },
    final: { slots: [st.r3a,     st.r3b    ], winner: st.final },
  };
}

// Qual fase cada time atingiu (0 = não participou, 1..5)
function computeFases(sportName) {
  const m = getMatches(sportName);
  const fases = {};
  TEAMS.forEach(team => {
    let fase = 0;
    if (m.final.winner === team) {
      fase = 5;
    } else if (m.r3a.winner === team || m.r3b.winner === team) {
      fase = 4;
    } else if ([m.r2a, m.r2b, m.r2c, m.r2d].some(match => match.winner === team)) {
      fase = 3;
    } else if ([m.r2a, m.r2b, m.r2c, m.r2d].some(match => match.slots.includes(team))) {
      fase = 2;
    } else if (m.r1.slots.includes(team)) {
      fase = 1;
    }
    fases[team] = fase;
  });
  return fases;
}

// Quem eliminou cada time
function computeAlgozes(sportName) {
  const m = getMatches(sportName);
  const algoz = {};
  TEAMS.forEach(team => {
    let a = null;
    const rounds = [m.r1, m.r2a, m.r2b, m.r2c, m.r2d, m.r3a, m.r3b, m.final];
    for (const match of rounds) {
      if (match.slots.includes(team) && match.winner && match.winner !== team) {
        a = match.winner;
        break;
      }
    }
    algoz[team] = a;
  });
  return algoz;
}

function isSportComplete(sportName) {
  return !!getMatches(sportName).final.winner;
}

// Colocação 1..9 com desempate pelo algoz mais avançado
function computePlacements(sportName) {
  const fases = computeFases(sportName);
  const algozes = computeAlgozes(sportName);

  const rows = TEAMS.map((team, idx) => {
    const fase = fases[team];
    let algozFase = fase === 5 ? 6 : (algozes[team] ? fases[algozes[team]] || 0 : 0);
    const tiebreak = fase * 10 + algozFase - idx * 0.0001;
    return { team, fase, algoz: algozes[team], algozFase, tiebreak };
  });

  rows.sort((a, b) => b.tiebreak - a.tiebreak);
  rows.forEach((r, i) => r.placement = i + 1);
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
