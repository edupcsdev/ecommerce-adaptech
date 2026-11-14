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