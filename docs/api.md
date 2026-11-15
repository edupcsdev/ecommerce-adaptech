# API AdapTech

Base URL: `http://localhost:3000/api`

## Convenções
- Corpo e respostas em JSON.
- Rotas protegidas exigem o header `Authorization: Bearer <token>`.
- Erros: `{ "mensagem": "texto explicando o erro" }`.
- Status usados: 200, 201, 400 (dados inválidos), 401 (sem token ou token inválido), 403 (sem permissão), 404 (não encontrado), 409 (conflito).

## Resumo das rotas

| Método | URL | Token | Corpo / parâmetros | Sucesso | Erros |
|---|---|---|---|---|---|
| POST | `/api/usuarios` | não | nome, email, cpf, dataNascimento, senha | 201 | 400, 409 |
| POST | `/api/auth/login` | não | email, senha | 200 | 400, 401 |
| GET | `/api/auth/me` | sim | — | 200 | 401 |
| GET | `/api/categorias` | não | — | 200 | — |
| POST | `/api/categorias` | sim | nome | 201 | 400, 401, 409 |
| DELETE | `/api/categorias/:id` | sim | — | 204 | 401, 404, 409 |
| GET | `/api/produtos` | não | query: busca, categoria, precoMin, precoMax, ordenar | 200 | 400 |
| GET | `/api/produtos/:id` | não | — | 200 | 404 |
| POST | `/api/produtos` | sim | nome, descricao, preco, estoque, categoriaId, especificacoes, altaDemanda |   201 | 400, 401 |
| PUT | `/api/produtos/:id` | sim | mesmos campos do POST | 200 | 400, 401, 404 |
| DELETE | `/api/produtos/:id` | sim | — | 204 | 401, 404 |
| GET | `/api/carrinho` | sim | — | 200 | 401 |
| POST | `/api/carrinho/itens` | sim | produtoId, quantidade | 201 | 400, 401, 404, 409 |
| PUT | `/api/carrinho/itens/:id` | sim | quantidade | 200 | 400, 401, 404, 409 |
| DELETE | `/api/carrinho/itens/:id` | sim | — | 200 | 401, 404 |
| POST | `/api/pedidos` | sim | — | 201 | 400, 401, 403, 409 |
| GET | `/api/pedidos` | sim | — | 200 | 401 |
| GET | `/api/pedidos/:id` | sim | — | 200 | 401, 404 |
| POST | `/api/pedidos/:id/pagamento` | sim | forma (`pix` ou `boleto`) | 200 | 400, 401, 404, 409 |
| POST | `/api/pedidos/:id/confirmar` | sim | — | 200 | 401, 404, 409 |
| POST | `/api/pedidos/:id/cupom` | sim | codigo | 200 | 400, 401, 404, 409 |

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
  "cupom": null,
  "descontoCupom": 0,
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

## RF08 — Cupom promocional
`POST /api/pedidos/:id/cupom` (exige token) com `{ "codigo": "BEMVINDO10" }`

Respostas:
- `200` com o pedido atualizado (`cupom`, `descontoCupom`, `desconto` e `total` refletem o cupom).
- `400` campo `codigo` ausente ou vazio.
- `404` cupom inexistente, ou pedido inexistente (ou de outro usuário).
- `409` cupom inativo, fora da validade ou esgotado; pedido que já tem cupom; pedido que não está `pendente`.

Regras:
- O código não diferencia maiúsculas de minúsculas.
- Um único cupom por pedido, e só em pedido `pendente`.
- Limite de usos: contam os pedidos `pendente` ou `pago` com o cupom. Pedido expirado ou cancelado libera o uso.
- Tipos: `percentual` (ex.: 10 = 10% do subtotal) e `fixo` (valor em reais, limitado ao subtotal).
- **Acumulação com o PIX:** o cupom e o desconto do PIX (15%) acumulam. Ambos são calculados sobre o **subtotal** e somados; a soma nunca passa do subtotal (o total nunca fica negativo). Exemplo, subtotal R$ 200: cupom `BEMVINDO10` (R$ 20) + PIX (R$ 30) = R$ 50 de desconto, total R$ 150. O resultado é o mesmo se o cupom for aplicado antes ou depois da escolha da forma de pagamento.

Cupons de exemplo (pré-cadastrados): `BEMVINDO10` (10%), `DESCONTO50` (R$ 50), `EXPIRADO`, `ESGOTADO` e `INATIVO` (estes três retornam 409).