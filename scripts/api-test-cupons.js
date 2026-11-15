// Uso: node scripts/api-test-cupons.js   (servidor com a configuração padrão)
// Usa os cupons de exemplo: BEMVINDO10 (10%), DESCONTO50 (R$ 50), EXPIRADO, ESGOTADO e INATIVO
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

const perto = (a, b) => Math.abs(a - b) < 0.005;
const unico = () => `${Date.now()}${Math.floor(Math.random() * 1e6)}`;

let categoriaId;

async function novoUsuario() {
  const email = `u${unico()}@teste.com`;
  await req('POST', '/usuarios', { nome: 'Teste', email, cpf: gerarCpf(), dataNascimento: '2000-05-10', senha: '12345678' });
  const login = await req('POST', '/auth/login', { email, senha: '12345678' });
  return login.json.token;
}

async function novoProduto(token, preco) {
  const r = await req(
    'POST',
    '/produtos',
    { nome: `Produto ${unico()}`, descricao: 'teste', preco, estoque: 50, categoriaId, especificacoes: null, altaDemanda: false },
    token,
  );
  return r.json.id;
}

async function novoPedido(token, produtoId) {
  await req('POST', '/carrinho/itens', { produtoId, quantidade: 1 }, token);
  const r = await req('POST', '/pedidos', null, token);
  return r.json.id;
}

const cupom = (token, id, codigo) => req('POST', `/pedidos/${id}/cupom`, { codigo }, token);
const pagar = (token, id, forma) => req('POST', `/pedidos/${id}/pagamento`, { forma }, token);

(async () => {
  const cats = await req('GET', '/categorias');
  categoriaId = cats.json[0].id;

  const u = await novoUsuario();
  const p200 = await novoProduto(u, 200);
  const p30 = await novoProduto(u, 30);
  let r;

  console.log('\n--- RF08: aplicar cupom ---');
  let id = await novoPedido(u, p200);
  r = await req('POST', `/pedidos/${id}/cupom`, { codigo: 'BEMVINDO10' });
  checar('sem token retorna 401', r.status === 401, r);

  r = await cupom(u, id, 'BEMVINDO10');
  checar('cupom percentual válido reduz o total (200 -> 180)', r.status === 200 && perto(r.json.total, 180) && perto(r.json.descontoCupom, 20) && r.json.cupom === 'BEMVINDO10', r);

  r = await cupom(u, id, 'DESCONTO50');
  checar('segundo cupom no mesmo pedido retorna 409', r.status === 409, r);
  r = await cupom(u, id, 'BEMVINDO10');
  checar('repetir o mesmo cupom no mesmo pedido retorna 409', r.status === 409, r);

  id = await novoPedido(u, p200);
  r = await cupom(u, id, 'bemvindo10');
  checar('código do cupom não diferencia maiúsculas e minúsculas', r.status === 200 && perto(r.json.total, 180), r);

  id = await novoPedido(u, p200);
  r = await cupom(u, id, 'DESCONTO50');
  checar('cupom de valor fixo reduz o total (200 -> 150)', r.status === 200 && perto(r.json.total, 150), r);

  id = await novoPedido(u, p30);
  r = await cupom(u, id, 'DESCONTO50');
  checar('cupom fixo maior que o subtotal zera o total, sem ficar negativo', r.status === 200 && perto(r.json.total, 0) && perto(r.json.desconto, 30), r);

  console.log('\n--- RF08: validações ---');
  id = await novoPedido(u, p200);
  r = await cupom(u, id, 'NAOEXISTE');
  checar('cupom inexistente retorna 404', r.status === 404, r);
  r = await cupom(u, id, 'EXPIRADO');
  checar('cupom expirado retorna 409', r.status === 409, r);
  r = await cupom(u, id, 'ESGOTADO');
  checar('cupom esgotado retorna 409', r.status === 409, r);
  r = await cupom(u, id, 'INATIVO');
  checar('cupom inativo retorna 409', r.status === 409, r);
  r = await req('POST', `/pedidos/${id}/cupom`, {}, u);
  checar('sem o campo codigo retorna 400', r.status === 400, r);
  const outro = await novoUsuario();
  r = await cupom(outro, id, 'BEMVINDO10');
  checar('pedido de outro usuário retorna 404', r.status === 404, r);
  r = await req('GET', `/pedidos/${id}`, null, u);
  checar('pedido com cupom inválido continua sem desconto', r.status === 200 && perto(r.json.total, 200) && r.json.cupom === null, r);

  console.log('\n--- RF08: acumulação com PIX ---');
  id = await novoPedido(u, p200);
  await cupom(u, id, 'BEMVINDO10');
  r = await pagar(u, id, 'pix');
  checar('cupom aplicado antes do PIX: 200 - 20 - 30 = 150', r.status === 200 && perto(r.json.total, 150) && perto(r.json.desconto, 50), r);

  id = await novoPedido(u, p200);
  await pagar(u, id, 'pix');
  r = await cupom(u, id, 'BEMVINDO10');
  checar('PIX escolhido antes do cupom: mesmo resultado (150)', r.status === 200 && perto(r.json.total, 150) && perto(r.json.desconto, 50), r);

  id = await novoPedido(u, p200);
  await cupom(u, id, 'BEMVINDO10');
  r = await pagar(u, id, 'boleto');
  checar('cupom com boleto: só o desconto do cupom (180)', r.status === 200 && perto(r.json.total, 180), r);
  r = await pagar(u, id, 'pix');
  checar('trocar boleto por PIX mantém o cupom e soma o PIX (150)', r.status === 200 && perto(r.json.total, 150), r);

  console.log('\n--- RF08: só em pedido pendente ---');
  id = await novoPedido(u, p200);
  await pagar(u, id, 'boleto');
  await req('POST', `/pedidos/${id}/confirmar`, null, u);
  r = await cupom(u, id, 'BEMVINDO10');
  checar('cupom em pedido já pago retorna 409', r.status === 409, r);

  console.log(`\nResultado: ${ok} passaram, ${falhas} falharam`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => {
  console.error('\nNão consegui falar com o servidor. Ele está rodando (npm run dev)?\n', e.message);
  process.exit(1);
});