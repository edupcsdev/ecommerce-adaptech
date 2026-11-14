// Uso: node scripts/testar-api.js   (com o servidor rodando)
const BASE = process.env.API_URL || 'http://localhost:3000/api';

function gerarCpf() {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const dv = (base, peso) => {
    const soma = base.reduce((acc, d, i) => acc + d * (peso - i), 0);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  n.push(dv(n, 10));
  n.push(dv(n, 11));
  return n.join('');
}

const comPontos = (c) => c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

async function req(metodo, caminho, corpo, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + caminho, {
    method: metodo,
    headers,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

let ok = 0;
let falhas = 0;
function checar(nome, condicao, r) {
  if (condicao) {
    ok++;
    console.log(`✅ ${nome}`);
  } else {
    falhas++;
    console.log(`❌ ${nome}  → veio ${r ? r.status : '?'} ${r ? JSON.stringify(r.json) : ''}`);
  }
}

(async () => {
  const stamp = Date.now();
  const email = `teste${stamp}@teste.com`;
  const cpf = gerarCpf();
  const valido = { nome: 'Eduardo', email, cpf, dataNascimento: '2000-05-10', senha: '12345678' };
  let r;

  console.log('\n--- RF01: cadastro ---');
  r = await req('POST', '/usuarios', valido);
  checar('cadastro válido retorna 201', r.status === 201, r);
  checar('resposta não traz senha nem hash', r.json && !('senha' in r.json) && !('senhaHash' in r.json), r);

  r = await req('POST', '/usuarios', { ...valido, cpf: gerarCpf() });
  checar('e-mail repetido retorna 409', r.status === 409, r);

  r = await req('POST', '/usuarios', { ...valido, email: `outro${stamp}@teste.com` });
  checar('CPF repetido retorna 409', r.status === 409, r);

  const cpf2 = gerarCpf();
  r = await req('POST', '/usuarios', { ...valido, email: `pontos${stamp}@teste.com`, cpf: comPontos(cpf2) });
  checar('CPF com pontuação é aceito (201)', r.status === 201, r);
  r = await req('POST', '/usuarios', { ...valido, email: `pontos2${stamp}@teste.com`, cpf: cpf2 });
  checar('mesmo CPF sem pontuação é detectado como repetido (409)', r.status === 409, r);

  const novo = (extra) => ({ ...valido, email: `v${Math.random()}@teste.com`, cpf: gerarCpf(), ...extra });
  r = await req('POST', '/usuarios', novo({ cpf: '111.111.111-11' }));
  checar('CPF inválido retorna 400', r.status === 400, r);
  r = await req('POST', '/usuarios', novo({ email: 'invalido' }));
  checar('e-mail inválido retorna 400', r.status === 400, r);
  r = await req('POST', '/usuarios', novo({ dataNascimento: '2099-01-01' }));
  checar('data de nascimento futura retorna 400', r.status === 400, r);
  r = await req('POST', '/usuarios', novo({ dataNascimento: '2000-02-31' }));
  checar('data inexistente retorna 400', r.status === 400, r);
  r = await req('POST', '/usuarios', novo({ senha: '123' }));
  checar('senha curta retorna 400', r.status === 400, r);
  const semCpf = novo({});
  delete semCpf.cpf;
  r = await req('POST', '/usuarios', semCpf);
  checar('campo obrigatório ausente (cpf) retorna 400', r.status === 400, r);
  r = await req('POST', '/usuarios', {});
  checar('corpo vazio retorna 400', r.status === 400, r);

  console.log('\n--- RF02: login ---');
  r = await req('POST', '/auth/login', { email, senha: '12345678' });
  checar('login válido retorna 200 com token', r.status === 200 && typeof (r.json && r.json.token) === 'string', r);
  const token = r.json && r.json.token;

  r = await req('POST', '/auth/login', { email: email.toUpperCase(), senha: '12345678' });
  checar('login com e-mail em maiúsculas funciona', r.status === 200, r);

  const errada = await req('POST', '/auth/login', { email, senha: 'errada123' });
  checar('senha errada retorna 401', errada.status === 401, errada);
  const inexistente = await req('POST', '/auth/login', { email: `nao${stamp}@teste.com`, senha: '12345678' });
  checar('e-mail inexistente retorna 401', inexistente.status === 401, inexistente);
  checar(
    'mesma mensagem para senha errada e e-mail inexistente',
    errada.json && inexistente.json && errada.json.mensagem === inexistente.json.mensagem,
    errada,
  );

  r = await req('POST', '/auth/login', {});
  checar('login sem dados retorna 400', r.status === 400, r);

  console.log('\n--- Rota protegida ---');
  r = await req('GET', '/auth/me', null, token);
  checar('/auth/me com token retorna 200 e o e-mail certo', r.status === 200 && r.json && r.json.email === email, r);
  r = await req('GET', '/auth/me');
  checar('/auth/me sem token retorna 401', r.status === 401, r);
  r = await req('GET', '/auth/me', null, 'token.invalido.aqui');
  checar('/auth/me com token inválido retorna 401', r.status === 401, r);

  console.log('\n--- Rota antiga ---');
  r = await req('GET', '/produtos');
  checar('GET /api/produtos retorna 200 com lista', r.status === 200 && Array.isArray(r.json), r);

  console.log(`\nResultado: ${ok} passaram, ${falhas} falharam`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => {
  console.error('\nNão consegui falar com o servidor. Ele está rodando (npm run dev)?\n', e.message);
  process.exit(1);
});