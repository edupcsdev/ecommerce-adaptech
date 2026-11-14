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