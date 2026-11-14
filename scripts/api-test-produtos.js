// Uso: node scripts/api-test-produtos.js
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

const emOrdem = (lista, chave, dir) =>
  lista.every((p, i) => {
    if (i === 0) return true;
    const cmp = chave === 'nome'
      ? lista[i - 1].nome.localeCompare(p.nome, 'pt-BR')
      : lista[i - 1][chave] - p[chave];
    return dir === 'asc' ? cmp <= 0 : cmp >= 0;
  });

(async () => {
  const stamp = Date.now();
  const email = `prod${stamp}@teste.com`;
  await req('POST', '/usuarios', { nome: 'Teste', email, cpf: gerarCpf(), dataNascimento: '2000-05-10', senha: '12345678' });
  const login = await req('POST', '/auth/login', { email, senha: '12345678' });
  const token = login.json && login.json.token;
  if (!token) {
    console.log('Não consegui fazer login para os testes. O servidor está rodando?', login);
    process.exit(1);
  }

  const produto = {
    nome: `Headset ${stamp}`, descricao: 'Headset USB', preco: 199.9, estoque: 7,
    categoriaId: 1, especificacoes: { conexao: 'USB' }, altaDemanda: false,
  };
  let r;

  console.log('\n--- RF03: categorias ---');
  r = await req('GET', '/categorias');
  checar('GET /categorias é público e retorna 200 com lista', r.status === 200 && Array.isArray(r.json) && r.json.length >= 3, r);
  r = await req('POST', '/categorias', { nome: `Cat ${stamp}` });
  checar('POST /categorias sem token retorna 401', r.status === 401, r);
  r = await req('POST', '/categorias', { nome: `Cat ${stamp}` }, token);
  checar('POST /categorias com token retorna 201', r.status === 201 && r.json && r.json.id, r);
  const catNovaId = r.json && r.json.id;
  r = await req('POST', '/categorias', { nome: `cat ${stamp}` }, token);
  checar('categoria com nome repetido retorna 409', r.status === 409, r);
  r = await req('POST', '/categorias', { nome: '' }, token);
  checar('categoria sem nome retorna 400', r.status === 400, r);

  console.log('\n--- RF03: produtos (leitura) ---');
  r = await req('GET', '/produtos');
  checar('GET /produtos retorna 200 com lista', r.status === 200 && Array.isArray(r.json), r);
  r = await req('GET', '/produtos/1');
  checar('GET /produtos/1 retorna 200', r.status === 200 && r.json && r.json.id === 1, r);
  r = await req('GET', '/produtos/9999');
  checar('produto inexistente retorna 404', r.status === 404, r);
  r = await req('GET', '/produtos/abc');
  checar('id inválido retorna 404', r.status === 404, r);

  console.log('\n--- RF03: produtos (escrita) ---');
  r = await req('POST', '/produtos', produto);
  checar('criar sem token retorna 401', r.status === 401, r);
  r = await req('PUT', '/produtos/1', produto);
  checar('atualizar sem token retorna 401', r.status === 401, r);
  r = await req('DELETE', '/produtos/1');
  checar('remover sem token retorna 401', r.status === 401, r);

  r = await req('POST', '/produtos', produto, token);
  checar('criar produto válido retorna 201', r.status === 201 && r.json && r.json.id, r);
  const id = r.json && r.json.id;
  r = await req('GET', `/produtos/${id}`);
  checar('produto criado aparece no detalhe', r.status === 200 && r.json.nome === produto.nome, r);

  r = await req('POST', '/produtos', { ...produto, preco: 0 }, token);
  checar('preço zero retorna 400', r.status === 400, r);
  r = await req('POST', '/produtos', { ...produto, preco: -10 }, token);
  checar('preço negativo retorna 400', r.status === 400, r);
  r = await req('POST', '/produtos', { ...produto, preco: '10' }, token);
  checar('preço como texto retorna 400', r.status === 400, r);
  r = await req('POST', '/produtos', { ...produto, estoque: -1 }, token);
  checar('estoque negativo retorna 400', r.status === 400, r);
  r = await req('POST', '/produtos', { ...produto, estoque: 1.5 }, token);
  checar('estoque decimal retorna 400', r.status === 400, r);
  r = await req('POST', '/produtos', { ...produto, categoriaId: 9999 }, token);
  checar('categoria inexistente retorna 400', r.status === 400, r);
  const semNome = { ...produto };
  delete semNome.nome;
  r = await req('POST', '/produtos', semNome, token);
  checar('produto sem nome retorna 400', r.status === 400, r);

  r = await req('PUT', `/produtos/${id}`, { ...produto, preco: 249.9, altaDemanda: true }, token);
  checar('atualizar produto retorna 200 com novo preço', r.status === 200 && r.json.preco === 249.9 && r.json.altaDemanda === true, r);
  r = await req('PUT', '/produtos/9999', produto, token);
  checar('atualizar produto inexistente retorna 404', r.status === 404, r);
  r = await req('PUT', `/produtos/${id}`, { ...produto, preco: -1 }, token);
  checar('atualizar com preço inválido retorna 400', r.status === 400, r);

  r = await req('DELETE', '/categorias/1', null, token);
  checar('remover categoria que tem produtos retorna 409', r.status === 409, r);

  console.log('\n--- RF04: busca e filtros ---');
  r = await req('GET', '/produtos');
  checar('sem parâmetros retorna só produtos ativos (estoque > 0)', r.status === 200 && r.json.length >= 4 && r.json.every((p) => p.estoque > 0), r);
  r = await req('GET', '/produtos?busca=&categoria=&precoMin=&precoMax=&ordenar=');
  checar('parâmetros vazios são ignorados (200)', r.status === 200 && r.json.length >= 4, r);
  r = await req('GET', '/produtos?busca=MOUSE');
  checar('busca por parte do nome, sem diferenciar maiúsculas', r.status === 200 && r.json.length >= 1 && r.json.every((p) => p.nome.toLowerCase().includes('mouse')), r);
  r = await req('GET', '/produtos?busca=mecanico');
  checar('busca ignora acentos ("mecanico" acha "Mecânico")', r.status === 200 && r.json.some((p) => p.id === 2), r);
  r = await req('GET', '/produtos?categoria=1');
  checar('filtro por categoria retorna só dela', r.status === 200 && r.json.length >= 2 && r.json.every((p) => p.categoriaId === 1), r);
  r = await req('GET', '/produtos?precoMin=1000&precoMax=2000');
  checar('filtro de faixa de preço respeita os limites', r.status === 200 && r.json.some((p) => p.id === 3) && r.json.every((p) => p.preco >= 1000 && p.preco <= 2000), r);
  r = await req('GET', '/produtos?categoria=1&precoMax=200&busca=mouse');
  checar('combinação de filtros funciona', r.status === 200 && r.json.length >= 1 && r.json.every((p) => p.categoriaId === 1 && p.preco <= 200), r);
  r = await req('GET', '/produtos?ordenar=preco_asc');
  checar('ordenar por preço crescente', r.status === 200 && emOrdem(r.json, 'preco', 'asc'), r);
  r = await req('GET', '/produtos?ordenar=preco_desc');
  checar('ordenar por preço decrescente', r.status === 200 && emOrdem(r.json, 'preco', 'desc'), r);
  r = await req('GET', '/produtos?ordenar=nome_asc');
  checar('ordenar por nome', r.status === 200 && emOrdem(r.json, 'nome', 'asc'), r);

  r = await req('GET', '/produtos?precoMin=abc');
  checar('precoMin não numérico retorna 400', r.status === 400, r);
  r = await req('GET', '/produtos?categoria=abc');
  checar('categoria não numérica retorna 400', r.status === 400, r);
  r = await req('GET', '/produtos?ordenar=xyz');
  checar('ordenar inválido retorna 400', r.status === 400, r);
  r = await req('GET', '/produtos?precoMin=500&precoMax=100');
  checar('precoMin maior que precoMax retorna 400', r.status === 400, r);

  const zerado = { ...produto, nome: `Zerado ${stamp}`, estoque: 0 };
  r = await req('POST', '/produtos', zerado, token);
  const idZerado = r.json && r.json.id;
  checar('produto com estoque 0 é criado (201)', r.status === 201, r);
  r = await req('GET', `/produtos?busca=${encodeURIComponent(zerado.nome)}`);
  checar('produto com estoque 0 não aparece na busca', r.status === 200 && r.json.length === 0, r);
  r = await req('GET', `/produtos/${idZerado}`);
  checar('mas o detalhe dele continua acessível (200)', r.status === 200, r);

  console.log('\n--- Limpeza ---');
  r = await req('DELETE', `/produtos/${idZerado}`, null, token);
  checar('remover produto retorna 204', r.status === 204, r);
  r = await req('DELETE', `/produtos/${id}`, null, token);
  checar('remover outro produto retorna 204', r.status === 204, r);
  r = await req('GET', `/produtos/${id}`);
  checar('produto removido retorna 404', r.status === 404, r);
  r = await req('DELETE', `/produtos/${id}`, null, token);
  checar('remover de novo retorna 404', r.status === 404, r);
  r = await req('DELETE', `/categorias/${catNovaId}`, null, token);
  checar('remover categoria vazia retorna 204', r.status === 204, r);

  console.log(`\nResultado: ${ok} passaram, ${falhas} falharam`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => {
  console.error('\nNão consegui falar com o servidor. Ele está rodando (npm run dev)?\n', e.message);
  process.exit(1);
});