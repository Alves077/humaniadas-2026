// Gera js/config.js a partir das variáveis de ambiente do Vercel
const fs = require('fs');
const url  = process.env.SUPABASE_URL;
const key  = process.env.SUPABASE_ANON_KEY;
const id   = process.env.CHAMPIONSHIP_ID;
if (!url || !key || !id) {
  console.error('build.js: SUPABASE_URL, SUPABASE_ANON_KEY e CHAMPIONSHIP_ID precisam estar definidos');
  process.exit(1);
}
fs.writeFileSync('js/config.js',
  `const SUPABASE_URL = '${url}';\nconst SUPABASE_ANON_KEY = '${key}';\nconst CHAMPIONSHIP_ID = ${Number(id)};\n`
);
console.log('js/config.js gerado com sucesso');
