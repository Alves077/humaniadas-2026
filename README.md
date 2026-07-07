# Humaniadas 2026

Painel de acompanhamento do campeonato Humaniadas 2026 — chaveamento eliminatório, classificação geral, cheerleading e simulações por atlética.

## Stack

- HTML/CSS/JS estático — sem build step, sem npm, sem bundler
- [Supabase](https://supabase.com) como backend (auth + banco de dados) via CDN
- Deploy via Vercel (hospedagem de arquivos estáticos)

## Funcionalidades

| Aba | Descrição |
|-----|-----------|
| **Geral** | Classificação geral com pódio e tabela de pontos por esporte |
| **Chaveamentos** | Bracket eliminatório por esporte; admin preenche os resultados |
| **Cheerleading** | Ranking de colocações de cheerleading; admin preenche |
| **Simulações** | Cada usuário simula um cenário; painel mostra todas as simulações com expansão inline e paleta da atlética |

### Theming por atlética

Ao fazer login, o tema visual da página inteira muda para as cores da atlética do usuário. Cada uma das 9 atléticas tem paleta própria definida em `js/data.js` (backgrounds, accent, gold, textDim, textMid).

### Segurança

- Dados do banco escapados com `escHtml()` antes de qualquer `innerHTML`
- Admin verificado via `app_metadata.is_admin` no JWT (não apenas pela presença de sessão)
- RLS (Row Level Security) ativo em todas as tabelas Supabase
- SRI (Subresource Integrity) nos dois scripts CDN externos
- `js/config.js` no `.gitignore` — não vai ao repositório

## Estrutura de arquivos

```
index.html              # Entrada única; define ordem de carregamento dos scripts
js/
  config.js             # SUPABASE_URL, SUPABASE_ANON_KEY, CHAMPIONSHIP_ID (não commitado)
  data.js               # TEAM_PALETTES, TEAM_COLORS, TEAM_TEXT_COLORS, BRACKETS, SPORT_NAMES
  state.js              # Estado global, Supabase client, applyTeamTheme(), save/load
  logic.js              # computeGeneralStandings(), isSportComplete(), POINTS_BY_PLACEMENT
  main.js               # Roteamento de views, exportRanking(), clearBracket()
  auth/
    admin.js            # isAdmin, submitAdminLogin() com verificação de app_metadata
    user.js             # Login de usuário normal, currentUser, menu avatar
  render/
    utils.js            # escHtml(), teamAvatar(), abbreviate() — carregado primeiro
    standings.js        # renderGeral(): pódio + tabela classificação
    bracket.js          # renderBracket(): chaveamento eliminatório
    cheer.js            # renderCheerleading(): posições de cheerleading
    sports.js           # renderChaveamentos(): lista de esportes
    simulacoes.js       # renderSimulacoes(): cards + expansão inline com tabela por atlética
    index.js            # renderAll(): chama todos os renders
css/
  variables.css         # CSS custom properties padrão (tema default terracota)
  reset.css             # Reset base
  layout.css            # Shell, views, isolation: isolate
  components.css        # Header, mobile nav, modais, avatar dropdown
  podium.css            # Pódio e tabela de classificação geral
  bracket.css           # Chaveamento eliminatório
  sports.css            # Cards de esporte
  cheerleading.css      # Aba cheerleading
  simulacoes.css        # Cards e tabela de simulações
img/
  teams/                # Logos das atléticas (nome_com_underscore.png)
```

## Configuração local

1. Crie `js/config.js` com as credenciais do projeto Supabase:

```js
const SUPABASE_URL   = 'https://SEU_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY';
const CHAMPIONSHIP_ID = 1;
```

2. Abra `index.html` com Live Server (VS Code) ou qualquer servidor HTTP local.  
   Não funciona abrindo o arquivo diretamente (`file://`) por conta de CORS.

## Ordem dos scripts em `index.html`

A ordem é crítica — não há bundler para resolver dependências:

```
config.js → data.js → state.js → logic.js
→ render/utils.js → render/standings.js → render/bracket.js
→ render/cheer.js → render/sports.js → render/simulacoes.js → render/index.js
→ auth/admin.js → auth/user.js → main.js
```

## Atléticas participantes

| Atlética | Cor primária | themeAccent |
|----------|-------------|-------------|
| SPUFF | #5a3cb3 | #ffdd00 |
| RI UFRJ | #003374 | #e8f0ff |
| GPDES | #b43000 | #e56423 |
| GEMEL | #d7093a | #f4c123 |
| PSICO PUC | #c80000 | #ffe700 |
| PSICO UFRJ | #4a1a72 | #a2d14a |
| AECS | #8a6800 | #d7ae26 |
| HOTUR UFF | #020684 | #f0e0e0 |
| RI UFF | #1a3a6a | #c4c4c6 |

## Convenções importantes

- **`themeAccent`** (não `accent`) é o valor aplicado ao CSS `--accent`. `accent` pode ser escuro demais para texto.
- **`TEAM_TEXT_COLORS`** é a cor do texto na linha destacada da atlética na tabela de simulações — diferente de `themeAccent`.
- **`escHtml()`** obrigatório em todo dado do banco antes de `innerHTML`. A injeção via `onclick` não é segura com escaping simples — usar `data-*` + `addEventListener`.
- **SRI**: se atualizar versão de `@supabase/supabase-js` ou `html2canvas`, recalcular SHA-384 e atualizar `integrity=` em `index.html`.
- **`isolation: isolate` no `.shell`** — não remover; garante que conteúdo da página fique abaixo dos overlays do menu mobile.
- **`.mobile-nav` fora do `<header>`** — não mover; `backdrop-filter` no header quebra `position: fixed`.

## Admin

Para marcar um usuário como admin, atualize `app_metadata` via Supabase Dashboard ou SQL:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'
WHERE email = 'admin@exemplo.com';
```
