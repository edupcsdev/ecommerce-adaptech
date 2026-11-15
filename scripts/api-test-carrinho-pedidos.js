// Uso normal:   node scripts/api-test-carrinho-pedidos.js   (servidor com a configuração padrão)
// Expiração:    inicie o servidor com RESERVA_MINUTOS=0.05 (3 segundos) e rode com TESTE_EXPIRACAO=1
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

const dormir = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const perto = (a, b) => Math.abs(a - b) < 0.005;
const unico = () => `${Date.now()}${Math.floor(Math.random() * 1e6)}`;

let categoriaId;

async function novoUsuario(dataNascimento = '2000-05-10') {
  const email = `u${unico()}@teste.com`;
  await req('POST', '/usuarios', { nome: 'Teste', email, cpf: gerarCpf(), dataNascimento, senha: '12345678' });
  const login = await req('POST', '/auth/login', { email, senha: '12345678' });
  return login.json.token;
}

async function novoProduto(token, { preco = 100, estoque = 10, altaDemanda = false } = {}) {
  const r = await req(
    'POST',
    '/produtos',
    { nome: `Produto ${unico()}`, descricao: 'teste', preco, estoque, categoriaId, especificacoes: null, altaDemanda },
    token,
  );
  return r.json.id;
}

const adicionar = (token, produtoId, quantidade) =>
  req('POST', '/carrinho/itens', { produtoId, quantidade }, token);

async function testarCarrinho() {
  console.log('\n--- RF05: carrinho ---');
  let r = await req('GET', '/carrinho');
  checar('GET /carrinho sem token retorna 401', r.status === 401, r);
  r = await req('POST', '/carrinho/itens', { produtoId: 'x', quantidade: 1 });
  checar('POST /carrinho/itens sem token retorna 401', r.status === 401, r);

  const token = await novoUsuario();
  const p1 = await novoProduto(token, { preco: 100, estoque: 5 });
  const p2 = await novoProduto(token, { preco: 49.9, estoque: 10 });

  r = await req('GET', '/carrinho', null, token);
  checar('carrinho novo vem vazio, com total 0', r.status === 200 && r.json.itens.length === 0 && r.json.total === 0, r);

  r = await adicionar(token, p1, 2);
  checar('adicionar item dentro do estoque retorna 201', r.status === 201 && r.json.itens.length === 1 && r.json.total === 200, r);
  const itemId = r.json.itens[0] && r.json.itens[0].id;
  checar('item traz nome, preço unitário e subtotal', r.json.itens[0] && r.json.itens[0].nome && r.json.itens[0].precoUnitario === 100 && r.json.itens[0].subtotal === 200, r);

  r = await adicionar(token, p1, 1);
  checar('adicionar produto que já está no carrinho soma a quantidade', r.status === 201 && r.json.itens.length === 1 && r.json.itens[0].quantidade === 3, r);

  r = await adicionar(token, p1, 3);
  checar('adicionar acima do estoque retorna 409 com mensagem', r.status === 409 && typeof r.json.mensagem === 'string', r);

  for (const q of [0, -1, 1.5, '2']) {
    r = await adicionar(token, p1, q);
    checar(`quantidade ${JSON.stringify(q)} retorna 400`, r.status === 400, r);
  }
  r = await adicionar(token, 'inexistente', 1);
  checar('produto inexistente retorna 404', r.status === 404, r);

  r = await req('PUT', `/carrinho/itens/${itemId}`, { quantidade: 5 }, token);
  checar('alterar quantidade dentro do estoque retorna 200', r.status === 200 && r.json.itens[0].quantidade === 5, r);
  r = await req('PUT', `/carrinho/itens/${itemId}`, { quantidade: 6 }, token);
  checar('alterar acima do estoque retorna 409', r.status === 409, r);
  r = await req('PUT', `/carrinho/itens/${itemId}`, { quantidade: 0 }, token);
  checar('alterar para 0 retorna 400', r.status === 400, r);
  r = await req('PUT', '/carrinho/itens/inexistente', { quantidade: 1 }, token);
  checar('alterar item inexistente retorna 404', r.status === 404, r);

  r = await adicionar(token, p2, 3);
  checar('total do carrinho calculado corretamente (5x100 + 3x49,90 = 649,70)', r.status === 201 && perto(r.json.total, 649.7), r);

  r = await req('DELETE', `/carrinho/itens/${itemId}`, null, token);
  checar('remover item retorna 200 sem o item', r.status === 200 && r.json.itens.length === 1, r);
  r = await req('DELETE', `/carrinho/itens/${itemId}`, null, token);
  checar('remover item que não existe retorna 404', r.status === 404, r);

  const outro = await novoUsuario();
  r = await req('GET', '/carrinho', null, outro);
  checar('carrinho é individual (outro usuário vê vazio)', r.status === 200 && r.json.itens.length === 0, r);
}

async function testarPedido() {
  console.log('\n--- RF06: criação de pedido ---');
  const dono = await novoUsuario();
  let r = await req('POST', '/pedidos');
  checar('criar pedido sem token retorna 401', r.status === 401, r);

  r = await req('POST', '/pedidos', null, dono);
  checar('carrinho vazio retorna 400', r.status === 400, r);

  const p = await novoProduto(dono, { preco: 100, estoque: 10 });

  const menor = await novoUsuario(`${new Date().getFullYear() - 10}-01-01`);
  await adicionar(menor, p, 1);
  r = await req('POST', '/pedidos', null, menor);
  checar('usuário menor de 18 anos retorna 403', r.status === 403, r);

  const comprador = await novoUsuario();
  await adicionar(comprador, p, 2);
  r = await req('POST', '/pedidos', null, comprador);
  checar('pedido válido retorna 201 com itens, total e status pendente', r.status === 201 && r.json.status === 'pendente' && r.json.itens.length === 1 && r.json.total === 200, r);
  r = await req('GET', '/carrinho', null, comprador);
  checar('carrinho é esvaziado depois do pedido', r.status === 200 && r.json.itens.length === 0, r);

  // Alta demanda
  const h = await novoProduto(dono, { preco: 500, estoque: 10, altaDemanda: true });
  const c = await novoUsuario();
  r = await adicionar(c, h, 3);
  const itemH = r.json.itens[0].id;
  r = await req('POST', '/pedidos', null, c);
  checar('3 unidades de produto de alta demanda retorna 409', r.status === 409, r);
  await req('PUT', `/carrinho/itens/${itemH}`, { quantidade: 2 }, c);
  r = await req('POST', '/pedidos', null, c);
  checar('2 unidades de produto de alta demanda são permitidas (201)', r.status === 201, r);
  await adicionar(c, h, 1);
  r = await req('POST', '/pedidos', null, c);
  checar('terceira unidade dentro de 30 dias retorna 409', r.status === 409, r);

  // Estoque insuficiente no checkout e reservas no carrinho
  const s = await novoProduto(dono, { preco: 100, estoque: 5 });
  const d = await novoUsuario();
  const e = await novoUsuario();
  const f = await novoUsuario();
  await adicionar(d, s, 3);
  await adicionar(e, s, 4);
  const pedidoE = await req('POST', '/pedidos', null, e);
  await req('POST', `/pedidos/${pedidoE.json.id}/pagamento`, { forma: 'pix' }, e);
  r = await adicionar(f, s, 2);
  checar('carrinho considera reservas ativas de outros pedidos (409)', r.status === 409, r);
  r = await req('POST', '/pedidos', null, d);
  checar('estoque insuficiente no checkout retorna 409', r.status === 409, r);
}

async function testarPagamento() {
  console.log('\n--- RF07: pagamento ---');
  const u = await novoUsuario();
  const p = await novoProduto(u, { preco: 200, estoque: 10 });

  await adicionar(u, p, 1);
  const pedido = await req('POST', '/pedidos', null, u);
  const id = pedido.json.id;

  let r = await req('POST', `/pedidos/${id}/confirmar`, null, u);
  checar('confirmar sem escolher forma de pagamento retorna 409', r.status === 409, r);

  r = await req('POST', `/pedidos/${id}/pagamento`, { forma: 'cartao' }, u);
  checar('forma de pagamento inválida retorna 400', r.status === 400, r);

  r = await req('POST', `/pedidos/${id}/pagamento`, { forma: 'pix' }, u);
  checar('PIX: total com 15% de desconto (200 -> 170)', r.status === 200 && r.json.total === 170 && r.json.desconto === 30 && r.json.formaPagamento === 'pix', r);
  checar('reserva registra data/hora de expiração', r.status === 200 && typeof r.json.expiraEm === 'string', r);
  const expira = r.json.expiraEm;
  const minutos = (new Date(expira).getTime() - Date.now()) / 60000;
  checar('expiração fica em torno de 30 minutos', minutos > 28 && minutos <= 30.1, r);

  r = await req('POST', `/pedidos/${id}/pagamento`, { forma: 'boleto' }, u);
  checar('boleto: total sem desconto e prazo da reserva não é renovado', r.status === 200 && r.json.total === 200 && r.json.desconto === 0 && r.json.expiraEm === expira, r);

  const outro = await novoUsuario();
  r = await req('GET', `/pedidos/${id}`, null, outro);
  checar('pedido de outro usuário retorna 404', r.status === 404, r);

  const antes = await req('GET', `/produtos/${p}`);
  r = await req('POST', `/pedidos/${id}/confirmar`, null, u);
  checar('confirmar dentro do prazo muda o status para pago', r.status === 200 && r.json.status === 'pago' && !!r.json.confirmadoEm, r);
  const depois = await req('GET', `/produtos/${p}`);
  checar('confirmação baixa o estoque definitivamente', depois.json.estoque === antes.json.estoque - 1, depois);

  r = await req('POST', `/pedidos/${id}/pagamento`, { forma: 'pix' }, u);
  checar('pedido pago não aceita novo pagamento (409)', r.status === 409, r);
  r = await req('POST', `/pedidos/${id}/confirmar`, null, u);
  checar('confirmar pedido já pago retorna 409', r.status === 409, r);

  r = await req('GET', '/pedidos', null, u);
  checar('GET /pedidos lista os pedidos do usuário', r.status === 200 && r.json.length >= 1, r);
  r = await req('GET', '/pedidos/inexistente', null, u);
  checar('pedido inexistente retorna 404', r.status === 404, r);
}

async function testarExpiracao() {
  console.log('\n--- Expiração (servidor com RESERVA_MINUTOS=0.05, cerca de 3 s) ---');
  const u = await novoUsuario();
  const p = await novoProduto(u, { preco: 100, estoque: 3 });
  const h = await novoProduto(u, { preco: 100, estoque: 10, altaDemanda: true });

  await adicionar(u, p, 3);
  let r = await req('POST', '/pedidos', null, u);
  const id = r.json.id;
  r = await req('POST', `/pedidos/${id}/pagamento`, { forma: 'pix' }, u);
  checar('pagamento registrado com reserva ativa', r.status === 200, r);

  const outro = await novoUsuario();
  r = await adicionar(outro, p, 1);
  checar('durante a reserva, outro usuário não consegue adicionar (409)', r.status === 409, r);

  const j = await novoUsuario();
  await adicionar(j, h, 2);
  const pj = await req('POST', '/pedidos', null, j);
  await req('POST', `/pedidos/${pj.json.id}/pagamento`, { forma: 'boleto' }, j);

  await dormir(4000);

  r = await req('GET', `/pedidos/${id}`, null, u);
  checar('pedido não confirmado no prazo passa a "expirado"', r.status === 200 && r.json.status === 'expirado', r);
  r = await req('POST', `/pedidos/${id}/confirmar`, null, u);
  checar('confirmar pedido expirado retorna 409', r.status === 409, r);
  r = await adicionar(outro, p, 3);
  checar('após expirar, o estoque é liberado (201)', r.status === 201, r);
  const prod = await req('GET', `/produtos/${p}`);
  checar('estoque físico não foi baixado pelo pedido expirado', prod.json.estoque === 3, prod);

  await adicionar(j, h, 2);
  r = await req('POST', '/pedidos', null, j);
  checar('pedido expirado não conta no limite de alta demanda (201)', r.status === 201, r);
}

(async () => {
  const cats = await req('GET', '/categorias');
  categoriaId = cats.json[0].id;

  if (process.env.TESTE_EXPIRACAO === '1') {
    await testarExpiracao();
  } else {
    await testarCarrinho();
    await testarPedido();
    await testarPagamento();
  }

  console.log(`\nResultado: ${ok} passaram, ${falhas} falharam`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => {
  console.error('\nNão consegui falar com o servidor. Ele está rodando (npm run dev)?\n', e.message);
  process.exit(1);
});