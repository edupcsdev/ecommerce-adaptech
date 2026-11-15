// Uso: node scripts/api-test-produtos.js   (com o servidor rodando)
// Cria as próprias categorias e produtos, então não depende dos dados de exemplo.
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

const unico = () => `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
const q = (texto) => encodeURIComponent(texto);

const emOrdem = (lista, chave, dir) =>
  lista.every((p, i) => {
    if (i === 0) return true;
    const cmp = chave === 'nome'
      ? lista[i - 1].nome.localeCompare(p.nome, 'pt-BR')
      : lista[i - 1][chave] - p[chave];
    return dir === 'asc' ? cmp <= 0 : cmp >= 0;
  });

(async () => {
  const email = `prod${unico()}@teste.com`;
  await req('POST', '/usuarios', { nome: 'Teste', email, cpf: gerarCpf(), dataNascimento: '2000-05-10', senha: '12345678' });
  const login = await req('POST', '/auth/login', { email, senha: '12345678' });
  const token = login.json && login.json.token;
  if (!token) {
    console.log('Não consegui fazer login para os testes. O servidor está rodando?', login);
    process.exit(1);
  }

  const tag = unico();
  let r;

  console.log('\n--- RF03: categorias ---');
  r = await req('GET', '/categorias');
  checar('GET /categorias é público e retorna 200 com lista', r.status === 200 && Array.isArray(r.json), r);
  r = await req('POST', '/categorias', { nome: `Cat A ${tag}` });
  checar('POST /categorias sem token retorna 401', r.status === 401, r);
  r = await req('POST', '/categorias', { nome: `Cat A ${tag}` }, token);
  checar('POST /categorias com token retorna 201', r.status === 201 && r.json && r.json.id, r);
  const catA = r.json && r.json.id;
  r = await req('POST', '/categorias', { nome: `cat a ${tag}` }, token);
  checar('categoria com nome repetido retorna 409', r.status === 409, r);
  r = await req('POST', '/categorias', { nome: '' }, token);
  checar('categoria sem nome retorna 400', r.status === 400, r);
  r = await req('POST', '/categorias', { nome: `Cat B ${tag}` }, token);
  const catB = r.json && r.json.id;

  const base = (extra) => ({
    descricao: 'teste', preco: 100, estoque: 10, categoriaId: catA, especificacoes: null, altaDemanda: false, ...extra,
  });

  console.log('\n--- RF03: produtos (sem token) ---');
  r = await req('POST', '/produtos', base({ nome: `Mouse Teste ${tag}` }));
  checar('criar sem token retorna 401', r.status === 401, r);
  r = await req('PUT', '/produtos/qualquer', base({ nome: 'Qualquer' }));
  checar('atualizar sem token retorna 401', r.status === 401, r);
  r = await req('DELETE', '/produtos/qualquer');
  checar('remover sem token retorna 401', r.status === 401, r);

  console.log('\n--- RF03: produtos (criação e leitura) ---');
  r = await req('POST', '/produtos', base({ nome: `Mouse Teste ${tag}`, preco: 150, estoque: 20 }), token);
  checar('criar produto válido retorna 201', r.status === 201 && r.json && r.json.id, r);
  const idMouse = r.json && r.json.id;
  r = await req('POST', '/produtos', base({ nome: `Teclado Mecânico ${tag}`, preco: 300, estoque: 10 }), token);
  const idTeclado = r.json && r.json.id;
  r = await req('POST', '/produtos', base({ nome: `Monitor Teste ${tag}`, preco: 1200, estoque: 5, categoriaId: catB }), token);
  const idMonitor = r.json && r.json.id;

  r = await req('GET', `/produtos/${idMouse}`);
  checar('GET /produtos/:id retorna 200 com o produto', r.status === 200 && r.json.id === idMouse && r.json.nome === `Mouse Teste ${tag}`, r);
  r = await req('GET', '/produtos/inexistente');
  checar('produto inexistente retorna 404', r.status === 404, r);

  const invalidos = [
    ['preço zero', { preco: 0 }],
    ['preço negativo', { preco: -10 }],
    ['preço como texto', { preco: '10' }],
    ['estoque negativo', { estoque: -1 }],
    ['estoque decimal', { estoque: 1.5 }],
    ['categoria inexistente', { categoriaId: 'categoria-inexistente' }],
    ['categoriaId numérico', { categoriaId: 1 }],
    ['altaDemanda como texto', { altaDemanda: 'sim' }],
  ];
  for (const [nome, extra] of invalidos) {
    r = await req('POST', '/produtos', base({ nome: `Invalido ${tag}`, ...extra }), token);
    checar(`${nome} retorna 400`, r.status === 400, r);
  }
  r = await req('POST', '/produtos', base({}), token);
  checar('produto sem nome retorna 400', r.status === 400, r);

  console.log('\n--- RF03: atualização ---');
  r = await req('POST', '/produtos', base({ nome: `Editavel ${unico()}` }), token);
  const idEdit = r.json && r.json.id;
  r = await req('PUT', `/produtos/${idEdit}`, base({ nome: 'Editado', preco: 249.9, altaDemanda: true }), token);
  checar('atualizar produto retorna 200 com novo preço', r.status === 200 && r.json.preco === 249.9 && r.json.altaDemanda === true, r);
  r = await req('PUT', '/produtos/inexistente', base({ nome: 'Editado' }), token);
  checar('atualizar produto inexistente retorna 404', r.status === 404, r);
  r = await req('PUT', `/produtos/${idEdit}`, base({ nome: 'Editado', preco: -1 }), token);
  checar('atualizar com preço inválido retorna 400', r.status === 400, r);
  r = await req('DELETE', `/categorias/${catA}`, null, token);
  checar('remover categoria que tem produtos retorna 409', r.status === 409, r);

  console.log('\n--- RF04: busca e filtros ---');
  r = await req('GET', '/produtos');
  checar('sem parâmetros retorna 200 só com produtos ativos (estoque > 0)', r.status === 200 && Array.isArray(r.json) && r.json.every((p) => p.estoque > 0), r);
  checar('sem parâmetros inclui os produtos criados', r.status === 200 && r.json.some((p) => p.id === idMouse), r);
  r = await req('GET', '/produtos?busca=&categoria=&precoMin=&precoMax=&ordenar=');
  checar('parâmetros vazios são ignorados (200)', r.status === 200 && r.json.some((p) => p.id === idMouse), r);

  r = await req('GET', `/produtos?busca=${q(tag)}`);
  checar('busca pelo código único acha os 3 produtos de teste', r.status === 200 && r.json.length === 3, r);
  r = await req('GET', `/produtos?busca=${q('MOUSE TESTE ' + tag)}`);
  checar('busca por parte do nome ignora maiúsculas', r.status === 200 && r.json.length === 1 && r.json[0].id === idMouse, r);
  r = await req('GET', `/produtos?busca=${q('teclado mecanico ' + tag)}`);
  checar('busca ignora acentos ("mecanico" acha "Mecânico")', r.status === 200 && r.json.length === 1 && r.json[0].id === idTeclado, r);

  r = await req('GET', `/produtos?busca=${q(tag)}&categoria=${catA}`);
  checar('filtro por categoria retorna só produtos dela', r.status === 200 && r.json.length === 2 && r.json.every((p) => p.categoriaId === catA), r);
  r = await req('GET', `/produtos?busca=${q(tag)}&precoMin=200&precoMax=2000`);
  checar('filtro por faixa de preço respeita os limites', r.status === 200 && r.json.length === 2 && r.json.every((p) => p.preco >= 200 && p.preco <= 2000), r);
  r = await req('GET', `/produtos?busca=${q(tag)}&categoria=${catA}&precoMax=200`);
  checar('combinação de filtros funciona', r.status === 200 && r.json.length === 1 && r.json[0].id === idMouse, r);

  r = await req('GET', `/produtos?busca=${q(tag)}&ordenar=preco_asc`);
  checar('ordenar por preço crescente', r.status === 200 && r.json.length === 3 && emOrdem(r.json, 'preco', 'asc'), r);
  r = await req('GET', `/produtos?busca=${q(tag)}&ordenar=preco_desc`);
  checar('ordenar por preço decrescente', r.status === 200 && r.json.length === 3 && emOrdem(r.json, 'preco', 'desc'), r);
  r = await req('GET', `/produtos?busca=${q(tag)}&ordenar=nome_asc`);
  checar('ordenar por nome (A-Z)', r.status === 200 && r.json.length === 3 && emOrdem(r.json, 'nome', 'asc'), r);
  r = await req('GET', `/produtos?busca=${q(tag)}&ordenar=nome_desc`);
  checar('ordenar por nome (Z-A)', r.status === 200 && r.json.length === 3 && emOrdem(r.json, 'nome', 'desc'), r);

  r = await req('GET', '/produtos?precoMin=abc');
  checar('precoMin não numérico retorna 400', r.status === 400, r);
  r = await req('GET', '/produtos?ordenar=xyz');
  checar('ordenar inválido retorna 400', r.status === 400, r);
  r = await req('GET', '/produtos?precoMin=500&precoMax=100');
  checar('precoMin maior que precoMax retorna 400', r.status === 400, r);

  const tagZ = unico();
  r = await req('POST', '/produtos', base({ nome: `Zerado ${tagZ}`, estoque: 0 }), token);
  const idZerado = r.json && r.json.id;
  checar('produto com estoque 0 é criado (201)', r.status === 201, r);
  r = await req('GET', `/produtos?busca=${q(tagZ)}`);
  checar('produto com estoque 0 não aparece na busca', r.status === 200 && r.json.length === 0, r);
  r = await req('GET', `/produtos/${idZerado}`);
  checar('mas o detalhe dele continua acessível (200)', r.status === 200, r);

  console.log('\n--- Limpeza ---');
  for (const id of [idMouse, idTeclado, idMonitor, idEdit, idZerado]) {
    r = await req('DELETE', `/produtos/${id}`, null, token);
    checar('remover produto retorna 204', r.status === 204, r);
  }
  r = await req('GET', `/produtos/${idMouse}`);
  checar('produto removido retorna 404', r.status === 404, r);
  r = await req('DELETE', `/produtos/${idMouse}`, null, token);
  checar('remover de novo retorna 404', r.status === 404, r);
  r = await req('DELETE', `/categorias/${catA}`, null, token);
  checar('remover categoria vazia retorna 204', r.status === 204, r);
  r = await req('DELETE', `/categorias/${catB}`, null, token);
  checar('remover a outra categoria vazia retorna 204', r.status === 204, r);

  console.log(`\nResultado: ${ok} passaram, ${falhas} falharam`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => {
  console.error('\nNão consegui falar com o servidor. Ele está rodando (npm run dev)?\n', e.message);
  process.exit(1);
});