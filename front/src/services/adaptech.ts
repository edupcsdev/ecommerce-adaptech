// Todas as rotas da API AdapTech (ver api.md do repositório do backend).
import { api } from "./api";

export type Usuario = { id: string; nome: string; email: string; cpf?: string; dataNascimento?: string };
export type Categoria = { id: number; nome: string };
export type ApiProduto = {
  id: string; nome: string; descricao?: string | null; preco: number; estoque: number;
  categoriaId: number; especificacoes?: string | Record<string, unknown> | null; altaDemanda?: boolean;
};
export type ItemCarrinho = { id: string; produtoId: string; nome: string; precoUnitario: number; quantidade: number; subtotal: number };
export type Carrinho = { itens: ItemCarrinho[]; total: number };
export type StatusPedido = "pendente" | "pago" | "expirado" | "cancelado";
export type Pedido = {
  id: string; status: StatusPedido; formaPagamento: "pix" | "boleto" | null;
  itens: { produtoId: string; nome: string; quantidade: number; precoUnitario: number; subtotal: number }[];
  subtotal: number; desconto: number; cupom: string | null; descontoCupom: number; total: number;
  criadoEm: string; expiraEm: string | null; confirmadoEm: string | null;
};
export type FiltroProdutos = { busca?: string | undefined; categoria?: number | undefined; precoMin?: number | undefined; precoMax?: number | undefined; ordenar?: "preco_asc" | "preco_desc" | "nome_asc" | "nome_desc" };
export type NovoProduto = Omit<ApiProduto, "id">;

// RF01 / RF02 — usuários e autenticação
export const cadastrarUsuario = (b: { nome: string; email: string; cpf: string; dataNascimento: string; senha: string }) =>
  api<Usuario>("/usuarios", { method: "POST", body: b });
export const login = (b: { email: string; senha: string }) =>
  api<{ token: string; usuario: Usuario }>("/auth/login", { method: "POST", body: b });
export const me = () => api<Usuario>("/auth/me", { auth: true });

// RF03 — categorias
export const listarCategorias = () => api<Categoria[]>("/categorias");
export const criarCategoria = (nome: string) => api<Categoria>("/categorias", { method: "POST", body: { nome }, auth: true });
export const removerCategoria = (id: number) => api<void>(`/categorias/${id}`, { method: "DELETE", auth: true });

// RF03 / RF04 — produtos
export const listarProdutos = (f: FiltroProdutos = {}) => api<ApiProduto[]>("/produtos", { query: f });
export const buscarProduto = (id: string) => api<ApiProduto>(`/produtos/${encodeURIComponent(id)}`);
export const criarProduto = (b: NovoProduto) => api<ApiProduto>("/produtos", { method: "POST", body: b, auth: true });
export const atualizarProduto = (id: string, b: NovoProduto) => api<ApiProduto>(`/produtos/${id}`, { method: "PUT", body: b, auth: true });
export const removerProduto = (id: string) => api<void>(`/produtos/${id}`, { method: "DELETE", auth: true });

// RF05 — carrinho
export const verCarrinho = () => api<Carrinho>("/carrinho", { auth: true });
export const adicionarItem = (produtoId: string, quantidade: number) =>
  api<Carrinho>("/carrinho/itens", { method: "POST", body: { produtoId, quantidade }, auth: true });
export const alterarItem = (itemId: string, quantidade: number) =>
  api<Carrinho>(`/carrinho/itens/${itemId}`, { method: "PUT", body: { quantidade }, auth: true });
export const removerItem = (itemId: string) => api<Carrinho>(`/carrinho/itens/${itemId}`, { method: "DELETE", auth: true });

// RF06 / RF07 / RF08 — pedidos, pagamento e cupom
export const criarPedido = () => api<Pedido>("/pedidos", { method: "POST", auth: true });
export const listarPedidos = () => api<Pedido[]>("/pedidos", { auth: true });
export const buscarPedido = (id: string) => api<Pedido>(`/pedidos/${id}`, { auth: true });
export const escolherPagamento = (id: string, forma: "pix" | "boleto") =>
  api<Pedido>(`/pedidos/${id}/pagamento`, { method: "POST", body: { forma }, auth: true });
export const confirmarPagamento = (id: string) => api<Pedido>(`/pedidos/${id}/confirmar`, { method: "POST", auth: true });
export const aplicarCupom = (id: string, codigo: string) => api<Pedido>(`/pedidos/${id}/cupom`, { method: "POST", body: { codigo }, auth: true });

/** Fluxo completo do checkout: envia o carrinho local, cria o pedido, aplica cupom, escolhe a forma e confirma. */
export async function finalizarCompra(itens: { id: string; qty: number }[], forma: "pix" | "boleto", cupom?: string) {
  const atual = await verCarrinho();
  for (const i of atual.itens) await removerItem(i.id);
  for (const i of itens) await adicionarItem(i.id, i.qty);
  let pedido = await criarPedido();
  if (cupom) pedido = await aplicarCupom(pedido.id, cupom);
  pedido = await escolherPagamento(pedido.id, forma);
  return confirmarPagamento(pedido.id);
}
