const TEAMS = [
  "GPDES",
  "SPUFF",
  "PSICO UFRJ",
  "PSICO PUC",
  "GEMEL",
  "AECS",
  "RI UFF",
  "HOTUR UFF",
  "RI UFRJ",
];

// Arquivo de logo em img/teams/<key>.png — adicione o arquivo e aparece automaticamente
// Cor primária usada em bordas, tints de thead e cards na aba Simulações
const TEAM_COLORS = {
  GPDES:        "#e56423",
  SPUFF:        "#5a3cb3",
  "PSICO UFRJ": "#32114e",
  "PSICO PUC":  "#c00100",
  GEMEL:        "#d7093a",
  AECS:         "#d7ae26",
  "RI UFF":     "#ffe700",
  "HOTUR UFF":  "#020684",
  "RI UFRJ":    "#003374",
};

// Cor do texto usado sobre a linha destacada da atlética na tabela de simulação
const TEAM_TEXT_COLORS = {
  GPDES:        "#ffffff",
  SPUFF:        "#ffdd00",
  "PSICO UFRJ": "#a2d14a",
  "PSICO PUC":  "#fe9b00",
  GEMEL:        "#f4c123",
  AECS:         "#feea75",
  "RI UFF":     "#ffffff",
  "HOTUR UFF":  "#ffffff",
  "RI UFRJ":    "#c4c4c6",
};

// Paleta completa por atlética — usada no theming global do site
// accent      = cor primária da atlética (usada em TEAM_COLORS: bordas, tints de cards)
// themeAccent = cor usada como --accent no CSS (links, active states, destaque interativo)
// accentDark  = variante escura do themeAccent (para --accent-dark)
// bg/bgPanel/bgCard/bgCardHover = superfícies com temperatura de cor da atlética
// text        = cor do texto destacado na linha da atlética na sim table
const TEAM_PALETTES = {
  SPUFF: {
    bg:          "#0d0820",
    bgPanel:     "#130e2c",
    bgCard:      "#1a1438",
    bgCardHover: "#221c45",
    accent:      "#5a3cb3",
    themeAccent: "#ffdd00",
    accentDark:  "#c4aa00",
    gold:        "#ffdd00",
    goldDim:     "#332800",
    textDim:     "#a090c8",   /* 6.8:1 no bg #0d0820 */
    textMid:     "#cfc0e8",
    text:        "#ffdd00",
    aux:         ["#ffffff"],
  },
  "HOTUR UFF": {
    bg:          "#020215",
    bgPanel:     "#050832",
    bgCard:      "#0a0d44",
    bgCardHover: "#0f1256",
    accent:      "#020684",
    themeAccent: "#e8f0ff",
    accentDark:  "#b0c8ff",
    gold:        "#b0c8ff",
    goldDim:     "#080e3a",
    textDim:     "#8090d0",   /* 5.9:1 no bg #020215 */
    textMid:     "#a8b8e0",
    text:        "#ffffff",
    aux:         ["#21201e"],
  },
  GPDES: {
    bg:          "#0a1525",
    bgPanel:     "#0f1c30",
    bgCard:      "#142238",
    bgCardHover: "#1a2a44",
    accent:      "#e56423",
    themeAccent: "#e56423",
    accentDark:  "#b84e1a",
    gold:        "#e56423",
    goldDim:     "#2a1800",
    textDim:     "#7090b8",   /* 5.2:1 no bg #0a1525 */
    textMid:     "#98b0d0",
    text:        "#ffffff",
    aux:         ["#133163"],
  },
  GEMEL: {
    bg:          "#140004",
    bgPanel:     "#200008",
    bgCard:      "#2a000c",
    bgCardHover: "#340010",
    accent:      "#d7093a",
    themeAccent: "#f4c123",
    accentDark:  "#c29b1c",
    gold:        "#f4c123",
    goldDim:     "#2e1e08",
    textDim:     "#b88090",   /* 5.0:1 no bg #140004 */
    textMid:     "#d0a0b0",
    text:        "#f4c123",
    aux:         ["#151419"],
  },
  "RI UFF": {
    bg:          "#050500",
    bgPanel:     "#090800",
    bgCard:      "#0e0d00",
    bgCardHover: "#141200",
    accent:      "#ffe700",
    themeAccent: "#ffe700",
    accentDark:  "#c4b400",
    gold:        "#ffe700",
    goldDim:     "#282200",
    textDim:     "#a09870",   /* 6.3:1 no bg #0c0b00 */
    textMid:     "#c8c098",
    text:        "#ffffff",
    aux:         ["#1a1a1a"],
  },
  "PSICO UFRJ": {
    bg:          "#0a0518",
    bgPanel:     "#100b26",
    bgCard:      "#160f32",
    bgCardHover: "#1e1540",
    accent:      "#32114e",
    themeAccent: "#a2d14a",
    accentDark:  "#82a83a",
    gold:        "#a2d14a",
    goldDim:     "#142008",
    textDim:     "#7890a0",   /* 5.9:1 no bg #0a0518 */
    textMid:     "#a0b8c8",
    text:        "#a2d14a",
    aux:         ["#101419"],
  },
  AECS: {
    bg:          "#0e0900",
    bgPanel:     "#1c1400",
    bgCard:      "#261c00",
    bgCardHover: "#302400",
    accent:      "#d7ae26",
    themeAccent: "#d7ae26",
    accentDark:  "#a88820",
    gold:        "#d7ae26",
    goldDim:     "#2a1e00",
    textDim:     "#a09840",   /* 6.3:1 no bg #100c00 */
    textMid:     "#c0b870",
    text:        "#feea75",
    aux:         ["#feea75"],
  },
  "PSICO PUC": {
    bg:          "#120000",
    bgPanel:     "#1e0000",
    bgCard:      "#280000",
    bgCardHover: "#330000",
    accent:      "#c00100",
    themeAccent: "#f0e0e0",   /* branco-rosado: nav, bordas, thead */
    accentDark:  "#c8a0a0",
    gold:        "#ffc200",   /* amarelo só nos detalhes: concluído, campeão, pts */
    goldDim:     "#2e1a00",
    textDim:     "#c08080",   /* 6.5:1 no bg #120000 */
    textMid:     "#d0a0a0",
    text:        "#f0e0e0",
    aux:         ["#fcfcfc", "#000301"],
  },
  "RI UFRJ": {
    bg:          "#090c10",
    bgPanel:     "#0e1318",
    bgCard:      "#141b22",
    bgCardHover: "#1b2430",
    accent:      "#003374",
    themeAccent: "#c4c4c6",
    accentDark:  "#9898a0",
    gold:        "#c4c4c6",
    goldDim:     "#181c20",
    textDim:     "#7a8a96",   /* 5.2:1 no bg #090c10 */
    textMid:     "#a0b0bc",
    text:        "#c4c4c6",
    aux:         ["#1b254a"],
  },
};

const POINTS_BY_PLACEMENT = {
  1: 16,
  2: 13,
  3: 10,
  4: 9,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
};

const SPORT_ICONS = {
  "Cabo Guerra Masc": "💪",
  "Cabo Guerra Fem": "💪",
  "Tenis Mesa Masc": "🏓",
  "Tenis Mesa Fem": "🏓",
  Fut7: "⚽",
  "Basquete Masc": "🏀",
  "Basquete Fem": "🏀",
  "Volei Masc": "🏐",
  "Volei Fem": "🏐",
  "Handebol Masc": "🤾",
  "Handebol Fem": "🤾",
  "Futsal Masc": "🥅",
  "Futsal Fem": "🥅",
};

// Chaveamento de cada esporte: B4 e B5 jogam na 1ª rodada;
// D8..D20 entram direto na rodada 2 (byes)
const BRACKETS = {
  "Cabo Guerra Masc": {
    B4: "PSICO PUC",
    B5: "PSICO UFRJ",
    D8: "RI UFF",
    D10: "RI UFRJ",
    D12: "AECS",
    D14: "HOTUR UFF",
    D16: "GEMEL",
    D18: "SPUFF",
    D20: "GPDES",
  },
  "Cabo Guerra Fem": {
    B4: "AECS",
    B5: "GEMEL",
    D8: "PSICO UFRJ",
    D10: "SPUFF",
    D12: "RI UFRJ",
    D14: "PSICO PUC",
    D16: "RI UFF",
    D18: "GPDES",
    D20: "HOTUR UFF",
  },
  "Tenis Mesa Masc": {
    B4: "SPUFF",
    B5: "HOTUR UFF",
    D8: "GEMEL",
    D10: "RI UFF",
    D12: "PSICO PUC",
    D14: "GPDES",
    D16: "AECS",
    D18: "PSICO UFRJ",
    D20: "RI UFRJ",
  },
  "Tenis Mesa Fem": {
    B4: "GPDES",
    B5: "RI UFF",
    D8: "RI UFRJ",
    D10: "PSICO PUC",
    D12: "SPUFF",
    D14: "AECS",
    D16: "GEMEL",
    D18: "PSICO UFRJ",
    D20: "HOTUR UFF",
  },
  Fut7: {
    B4: "SPUFF",
    B5: "RI UFRJ",
    D8: "AECS",
    D10: "PSICO UFRJ",
    D12: "PSICO PUC",
    D14: "RI UFF",
    D16: "HOTUR UFF",
    D18: "GPDES",
    D20: "GEMEL",
  },
  "Basquete Masc": {
    B4: "PSICO PUC",
    B5: "RI UFRJ",
    D8: "GPDES",
    D10: "PSICO UFRJ",
    D12: "AECS",
    D14: "RI UFF",
    D16: "GEMEL",
    D18: "SPUFF",
    D20: "HOTUR UFF",
  },
  "Basquete Fem": {
    B4: "RI UFRJ",
    B5: "SPUFF",
    D8: "HOTUR UFF",
    D10: "GPDES",
    D12: "AECS",
    D14: "PSICO PUC",
    D16: "RI UFF",
    D18: "PSICO UFRJ",
    D20: "GEMEL",
  },
  "Volei Masc": {
    B4: "GEMEL",
    B5: "SPUFF",
    D8: "RI UFRJ",
    D10: "HOTUR UFF",
    D12: "RI UFF",
    D14: "GPDES",
    D16: "PSICO UFRJ",
    D18: "PSICO PUC",
    D20: "AECS",
  },
  "Volei Fem": {
    B4: "AECS",
    B5: "GEMEL",
    D8: "RI UFF",
    D10: "PSICO UFRJ",
    D12: "HOTUR UFF",
    D14: "RI UFRJ",
    D16: "SPUFF",
    D18: "PSICO PUC",
    D20: "GPDES",
  },
  "Handebol Masc": {
    B4: "AECS",
    B5: "PSICO UFRJ",
    D8: "GPDES",
    D10: "RI UFF",
    D12: "GEMEL",
    D14: "PSICO PUC",
    D16: "RI UFRJ",
    D18: "SPUFF",
    D20: "HOTUR UFF",
  },
  "Handebol Fem": {
    B4: "RI UFF",
    B5: "GPDES",
    D8: "GEMEL",
    D10: "SPUFF",
    D12: "RI UFRJ",
    D14: "PSICO PUC",
    D16: "HOTUR UFF",
    D18: "PSICO UFRJ",
    D20: "AECS",
  },
  "Futsal Masc": {
    B4: "HOTUR UFF",
    B5: "GPDES",
    D8: "AECS",
    D10: "GEMEL",
    D12: "RI UFF",
    D14: "PSICO UFRJ",
    D16: "SPUFF",
    D18: "PSICO PUC",
    D20: "RI UFRJ",
  },
  "Futsal Fem": {
    B4: "HOTUR UFF",
    B5: "RI UFF",
    D8: "PSICO PUC",
    D10: "PSICO UFRJ",
    D12: "GPDES",
    D14: "AECS",
    D16: "RI UFRJ",
    D18: "SPUFF",
    D20: "GEMEL",
  },
};

const SPORT_NAMES = Object.keys(BRACKETS);

// ═════════════════════════════════════════════════════════════════════════════
// SÉRIE B — dados aditivos, não alteram nada da Série A acima
// ═════════════════════════════════════════════════════════════════════════════

const TEAMS_B = [
  "MONARCAS",
  "RI UERJ",
  "DGEI UFRJ",
  "GEO UFF",
  "HIST UFF",
  "GALUDA DE CP",
  "HIST UNIRIO",
  "CORUJAS UERJ",
];

// Mapa time -> série ('A' | 'B'). Não exige coluna nova no banco — deriva
// sempre client-side a partir do nome do time (profiles.atletica).
const TEAM_SERIE = {};
TEAMS.forEach(t => { TEAM_SERIE[t] = 'A'; });
TEAMS_B.forEach(t => { TEAM_SERIE[t] = 'B'; });

// Time do Cheerleading da Série B — só 6 dos 8 times participam
const CHEER_TEAMS_B = [
  "CORUJAS UERJ",
  "HIST UNIRIO",
  "GEO UFF",
  "GALUDA DE CP",
  "DGEI UFRJ",
  "HIST UFF",
];

Object.assign(TEAM_COLORS, {
  MONARCAS:        "#294E95",
  "RI UERJ":       "#F6510C",
  "DGEI UFRJ":     "#A9496C",
  "GEO UFF":       "#39626E",
  "HIST UFF":      "#D10905",
  "GALUDA DE CP":  "#283D68",
  "HIST UNIRIO":   "#184E44",
  "CORUJAS UERJ":  "#3D3B76",
});

Object.assign(TEAM_PALETTES, {
  MONARCAS: {
    bg:          "#050818",
    bgPanel:     "#0a1024",
    bgCard:      "#101a34",
    bgCardHover: "#152140",
    accent:      "#294E95",
    themeAccent: "#E0B229",
    accentDark:  "#a8841c",
    gold:        "#E0B229",
    goldDim:     "#3a2c0a",
    textDim:     "#8ba3d6",   /* 7.9:1 no bg #050818 */
    textMid:     "#b8c8e8",
    text:        "#E0B229",
    aux:         ["#030416"],
  },
  "RI UERJ": {
    bg:          "#1a0a08",
    bgPanel:     "#241012",
    bgCard:      "#2e1618",
    bgCardHover: "#381c1e",
    accent:      "#F6510C",
    themeAccent: "#FF7920",
    accentDark:  "#c25a10",
    gold:        "#FF7920",
    goldDim:     "#3a1d08",
    textDim:     "#c88060",   /* 6.2:1 no bg #1a0a08 */
    textMid:     "#e0a880",
    text:        "#FF7920",
    aux:         ["#9A3650"],
  },
  "DGEI UFRJ": {
    bg:          "#12050a",
    bgPanel:     "#1c0810",
    bgCard:      "#261018",
    bgCardHover: "#301620",
    accent:      "#A9496C",
    themeAccent: "#B8B6C1",
    accentDark:  "#7a3350",
    gold:        "#B8B6C1",
    goldDim:     "#2a2530",
    textDim:     "#c090a0",   /* 7.4:1 no bg #12050a */
    textMid:     "#d8b0c0",
    text:        "#B8B6C1",
    aux:         ["#ffffff"],
  },
  "GEO UFF": {
    bg:          "#050f10",
    bgPanel:     "#0a1a1c",
    bgCard:      "#0f2428",
    bgCardHover: "#152e32",
    accent:      "#39626E",
    themeAccent: "#DEA83B",
    accentDark:  "#a87d1c",
    gold:        "#DEA83B",
    goldDim:     "#2e2000",
    textDim:     "#7fa8b0",   /* 7.5:1 no bg #050f10 */
    textMid:     "#a8c8d0",
    text:        "#DEA83B",
    aux:         ["#294954"],
  },
  "HIST UFF": {
    bg:          "#1c0605",
    bgPanel:     "#280a08",
    bgCard:      "#33100c",
    bgCardHover: "#3e1610",
    accent:      "#D10905",
    themeAccent: "#FAB420",
    accentDark:  "#b8850e",
    gold:        "#FAB420",
    goldDim:     "#3a2600",
    textDim:     "#d0a080",   /* 8.4:1 no bg #1c0605 */
    textMid:     "#e8c0a0",
    text:        "#FAB420",
    aux:         ["#E8A988"],
  },
  "GALUDA DE CP": {
    bg:          "#050a18",
    bgPanel:     "#0a1228",
    bgCard:      "#0f1a38",
    bgCardHover: "#152248",
    accent:      "#283D68",
    themeAccent: "#D4AF6A",
    accentDark:  "#a8863f",
    gold:        "#D4AF6A",
    goldDim:     "#2e2410",
    textDim:     "#8fa0c8",   /* 7.6:1 no bg #050a18 */
    textMid:     "#b8c4e0",
    text:        "#D4AF6A",
    aux:         ["#132A4C"],
  },
  "HIST UNIRIO": {
    bg:          "#050d0a",
    bgPanel:     "#0a1712",
    bgCard:      "#10211a",
    bgCardHover: "#162b22",
    accent:      "#184E44",
    themeAccent: "#E8C468",   /* dourado do troféu "H" da atlética — distinto do --text padrão (o off-white do brasão colidia com o cinza-claro de texto comum, sumindo o destaque de 1º lugar) */
    accentDark:  "#a8863f",
    gold:        "#E8C468",
    goldDim:     "#2e2410",
    textDim:     "#7fa89a",   /* 7.5:1 no bg #050d0a */
    textMid:     "#b8d0c6",
    text:        "#E8C468",
    aux:         ["#353D41"],
  },
  "CORUJAS UERJ": {
    /* time é "o SPUFF invertido" (mesmo par roxo+amarelo do uniforme, só que
       lá o roxo domina e o amarelo é detalhe; aqui é o oposto) — paleta
       original usava fundo roxo-azulado + amarelo quase idêntico ao SPUFF.
       Fundo/accent atualizados com as cores de referência passadas
       (#2F253E, #371B5D, #EFC117), mantendo o roxo mais quente/magenta
       (distinto do índigo do SPUFF) e o amarelo do uniforme, num tom
       dourado que não repete o amarelo-limão neon do SPUFF. */
    bg:          "#1a1422",
    bgPanel:     "#2f253e",
    bgCard:      "#371b5d",
    bgCardHover: "#553d75",
    accent:      "#3D3B76",
    themeAccent: "#EFC117",
    accentDark:  "#a88a10",
    gold:        "#EFC117",
    goldDim:     "#3a3010",
    textDim:     "#b89ad0",   /* 7.3:1 no bg #1a1422 */
    textMid:     "#d8c6ec",
    text:        "#E0A83C",
    aux:         ["#6C5790"],
  },
});

// Chaveamento da Série B: direto pras quartas (sem prévia, diferente da Série A).
// Cada esporte é um array de 4 confrontos de quartas [timeA, timeB].
// timeB === null indica bye — o time já avança pra semifinal sem interação manual.
const BRACKETS_B = {
  "Futsal Masc": [
    ["MONARCAS", "RI UERJ"],
    ["HIST UNIRIO", "DGEI UFRJ"],
    ["HIST UFF", "GALUDA DE CP"],
    ["GEO UFF", "CORUJAS UERJ"],
  ],
  "Futsal Fem": [
    ["DGEI UFRJ", "MONARCAS"],
    ["GEO UFF", "HIST UNIRIO"],
    ["CORUJAS UERJ", "HIST UFF"],
    ["GALUDA DE CP", null],
  ],
  Fut7: [
    ["GEO UFF", "MONARCAS"],
    ["HIST UNIRIO", "HIST UFF"],
    ["RI UERJ", "GALUDA DE CP"],
    ["DGEI UFRJ", "CORUJAS UERJ"],
  ],
  "Handebol Fem": [
    ["GEO UFF", "HIST UFF"],
    ["HIST UNIRIO", "RI UERJ"],
    ["DGEI UFRJ", "MONARCAS"],
    ["CORUJAS UERJ", "GALUDA DE CP"],
  ],
  "Handebol Masc": [
    ["HIST UFF", "MONARCAS"],
    ["CORUJAS UERJ", "GEO UFF"],
    ["HIST UNIRIO", "RI UERJ"],
    ["DGEI UFRJ", "GALUDA DE CP"],
  ],
  "Volei Fem": [
    ["CORUJAS UERJ", "DGEI UFRJ"],
    ["HIST UFF", "GEO UFF"],
    ["GALUDA DE CP", "HIST UNIRIO"],
    ["RI UERJ", "MONARCAS"],
  ],
  "Volei Masc": [
    ["HIST UFF", "DGEI UFRJ"],
    ["MONARCAS", "RI UERJ"],
    ["HIST UNIRIO", "GALUDA DE CP"],
    ["GEO UFF", "CORUJAS UERJ"],
  ],
  "Basquete Fem": [
    ["GEO UFF", "CORUJAS UERJ"],
    ["MONARCAS", "RI UERJ"],
    ["GALUDA DE CP", "HIST UFF"],
    ["DGEI UFRJ", "HIST UNIRIO"],
  ],
  "Basquete Masc": [
    ["DGEI UFRJ", "GALUDA DE CP"],
    ["HIST UNIRIO", "CORUJAS UERJ"],
    ["MONARCAS", "GEO UFF"],
    ["HIST UFF", "RI UERJ"],
  ],
  "Tenis Mesa Fem": [
    ["DGEI UFRJ", "MONARCAS"],
    ["HIST UFF", "GALUDA DE CP"],
    ["GEO UFF", "CORUJAS UERJ"],
    ["RI UERJ", "HIST UNIRIO"],
  ],
  "Tenis Mesa Masc": [
    ["HIST UFF", "GEO UFF"],
    ["GALUDA DE CP", "RI UERJ"],
    ["CORUJAS UERJ", "DGEI UFRJ"],
    ["HIST UNIRIO", "MONARCAS"],
  ],
  "Cabo Guerra Fem": [
    ["GALUDA DE CP", "GEO UFF"],
    ["RI UERJ", "CORUJAS UERJ"],
    ["HIST UFF", "DGEI UFRJ"],
    ["HIST UNIRIO", "MONARCAS"],
  ],
  "Cabo Guerra Masc": [
    ["CORUJAS UERJ", "RI UERJ"],
    ["HIST UNIRIO", "DGEI UFRJ"],
    ["HIST UFF", "GEO UFF"],
    ["GALUDA DE CP", "MONARCAS"],
  ],
};
