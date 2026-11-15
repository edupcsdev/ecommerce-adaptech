# API AdapTech

Base URL: `http://localhost:3000/api`

## Convenções
- Corpo e respostas em JSON.
- Rotas protegidas exigem o header `Authorization: Bearer <token>`.
- Erros: `{ "mensagem": "texto explicando o erro" }`.
- Status usados: 200, 201, 400 (dados inválidos), 401 (sem token ou token inválido), 403 (sem permissão), 404 (não encontrado), 409 (conflito).

## RF01 — Cadastro de usuário
`POST /api/usuarios` (pública)

Corpo:
```json
{
  "nome": "Eduardo",
  "email": "edu@teste.com",
  "cpf": "529.982.247-25",
  "dataNascimento": "2000-05-10",
  "senha": "12345678"
}
```
- `cpf` aceita com ou sem pontuação. `dataNascimento` no formato `AAAA-MM-DD`, não pode ser futura. `senha` com no mínimo 8 caracteres.

Respostas:
- `201`: dados do usuário, sem a senha.
- `400`: campo ausente ou inválido (CPF, e-mail, data, senha).
- `409`: e-mail ou CPF já cadastrado.

## RF02 — Login
`POST /api/auth/login` (pública)

Corpo: `{ "email": "edu@teste.com", "senha": "12345678" }`

Respostas:
- `200`: `{ "token": "...", "usuario": { ... } }`. O token expira em 2 horas.
- `401`: e-mail ou senha inválidos (mesma mensagem nos dois casos).

`GET /api/auth/me` (protegida): devolve o usuário do token. `401` sem token, ou com token inválido/expirado.

## RF03 — Produtos e categorias

Consultas são públicas. Criar, alterar e remover exigem `Authorization: Bearer <token>` (sem token: `401`).

### Campos do produto
| Campo | Tipo | Regra |
|---|---|---|
| nome | texto | obrigatório, mínimo 2 caracteres |
| descricao | texto | opcional |
| preco | número | obrigatório, maior que 0 |
| estoque | inteiro | obrigatório, maior ou igual a 0 |
| categoriaId | inteiro | obrigatório, categoria precisa existir |
| especificacoes | texto ou objeto JSON | opcional |
| altaDemanda | booleano | opcional (padrão `false`), usado no limite de compra da RF06 |

### Endpoints
- `GET /api/produtos/:id` → `200` com o produto; `404` se não existir.
- `POST /api/produtos` → `201` com o produto criado; `400` (preço, estoque ou campos inválidos, categoria inexistente); `401`.
- `PUT /api/produtos/:id` → `200` com o produto atualizado (envie todos os campos); `400`; `401`; `404`.
- `DELETE /api/produtos/:id` → `204` sem corpo; `401`; `404`.
- `GET /api/categorias` → `200` com a lista `[{ "id": 1, "nome": "Periféricos" }]`.
- `POST /api/categorias` com `{ "nome": "Cabos" }` → `201`; `400`; `401`; `409` (nome repetido).
- `DELETE /api/categorias/:id` → `204`; `401`; `404`; `409` se ainda houver produtos na categoria.

## RF04 — Busca de produtos com filtros
`GET /api/produtos?busca=&categoria=&precoMin=&precoMax=&ordenar=` (pública)

| Parâmetro | Descrição |
|---|---|
| busca | parte do nome, sem diferenciar maiúsculas/minúsculas nem acentos |
| categoria | **id** da categoria |
| precoMin / precoMax | limites de preço (números maiores ou iguais a 0; `precoMin` não pode passar de `precoMax`) |
| ordenar | `preco_asc`, `preco_desc`, `nome_asc` ou `nome_desc` |

- Todos são opcionais, combináveis, e parâmetros vazios são ignorados.
- Só retorna produtos **ativos** (estoque maior que 0). Sem parâmetros, retorna todos os ativos. `GET /api/produtos/:id` retorna o produto mesmo com estoque 0.
- `200` com a lista (pode ser vazia); `400` se algum parâmetro for inválido.

## RF05 — Carrinho (todas as rotas exigem token; sem token: `401`)

Todas as respostas de carrinho têm o formato:
```json
{
  "itens": [
    { "id": "uuid-do-item", "produtoId": "uuid", "nome": "Mouse Gamer", "precoUnitario": 150, "quantidade": 2, "subtotal": 300 }
  ],
  "total": 300
}
```

- `GET /api/carrinho` → `200`.
- `POST /api/carrinho/itens` com `{ "produtoId": "...", "quantidade": 2 }` → `201` com o carrinho. Se o produto já está no carrinho, as quantidades somam.
  - `400` quantidade zero, negativa, decimal ou não numérica.
  - `404` produto inexistente.
  - `409` quantidade total maior que o estoque disponível (estoque menos reservas ativas de outros pedidos).
- `PUT /api/carrinho/itens/:id` com `{ "quantidade": 3 }` → `200` com o carrinho. `:id` é o **id do item** (campo `id` de cada item), não o do produto. `400`, `404` (item inexistente) e `409` como acima.
- `DELETE /api/carrinho/itens/:id` → `200` com o carrinho atualizado. `404` se o item não existir.

## RF06 — Criação de pedido (checkout)
`POST /api/pedidos` (exige token, sem corpo). Transforma o carrinho em pedido e esvazia o carrinho.

Respostas:
- `201` com o pedido (formato abaixo), com status `pendente`.
- `400` carrinho vazio.
- `401` sem token, ou usuário do token não existe mais.
- `403` usuário menor de 18 anos (calculado pela data de nascimento).
- `409` estoque insuficiente no momento do pedido, ou limite de alta demanda: no máximo 2 unidades do mesmo produto com `altaDemanda` a cada 30 dias, somando pedidos anteriores pendentes ou pagos (cancelados e expirados não contam).

Formato do pedido:
```json
{
  "id": "uuid",
  "status": "pendente",
  "formaPagamento": null,
  "itens": [{ "produtoId": "uuid", "nome": "Mouse Gamer", "quantidade": 2, "precoUnitario": 150, "subtotal": 300 }],
  "subtotal": 300,
  "desconto": 0,
  "total": 300,
  "criadoEm": "2026-11-14T18:00:00.000Z",
  "expiraEm": null,
  "confirmadoEm": null
}
```
Status possíveis: `pendente`, `pago`, `expirado`, `cancelado`. `total` é o valor a pagar, já com desconto.

Consultas (também exigem token; pedido de outro usuário retorna `404`):
- `GET /api/pedidos` → `200` com a lista dos pedidos do usuário (mais recentes primeiro).
- `GET /api/pedidos/:id` → `200`; `404`.

## RF07 — Pagamento (simulado, sem gateway real)

- `POST /api/pedidos/:id/pagamento` com `{ "forma": "pix" }` ou `{ "forma": "boleto" }`.
  - PIX: 15% de desconto sobre o total. Boleto: sem desconto.
  - Registra a forma e **cria a reserva de estoque por 30 minutos** (`expiraEm` no pedido). Enquanto o pedido estiver pendente, dá para trocar a forma; o prazo da reserva não é renovado.
  - `200` com o pedido atualizado. `400` forma inválida. `404` pedido inexistente.
  - `409` pedido já pago, expirado ou cancelado, ou estoque que deixou de estar disponível.
- `POST /api/pedidos/:id/confirmar` (simula a confirmação do pagamento).
  - Dentro do prazo: status vira `pago`, `confirmadoEm` é preenchido e o estoque é baixado definitivamente. `200`.
  - `409` pedido expirado, já pago, cancelado, ou sem forma de pagamento escolhida. `404` pedido inexistente.
- Expiração: pedido pendente sem confirmação até `expiraEm` passa a `expirado` e a reserva é liberada (as unidades voltam a ficar disponíveis). Pedido pendente que nunca teve pagamento registrado expira 30 minutos após a criação.