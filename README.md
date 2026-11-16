# AdapTech — E-commerce de informática e periféricos

Sistema web fullstack de comércio eletrônico especializado em hardware, monitores e periféricos, desenvolvido como Projeto Integrador da disciplina de **Engenharia de Software** (Ciência da Computação — Afya Maceió | Centro Universitário de Maceió).

O repositório tem duas partes:

| Pasta | O que é | Tecnologias |
|---|---|---|
| `/` (raiz) | **Back-end**: API REST | Node.js, Express 5, TypeScript, JWT, bcryptjs, Prisma (PostgreSQL, opcional) |
| `front/` | **Front-end**: loja virtual | React, TanStack Start, Vite, Tailwind CSS |

## Equipe

| Integrante | Responsabilidade |
|---|---|
| Eduardo Henrique Paes Costa da Silva | Back-end |
| Felipe Gabriel de Lemos Aciole Tavares | Front-end |
| Eric Rocha Pessoa | Banco de dados e DevOps |
| José Luiz Jacinto dos Santos | QA e gestão fullstack |

Professor: Ícaro Santos Ferreira.

## Funcionalidades

- Cadastro e login de usuários (JWT).
- Catálogo com 64 produtos em 11 categorias, com busca e filtros (categoria, preço, ordenação).
- Carrinho de compras com controle de estoque.
- Checkout restrito a usuários autenticados e maiores de 18 anos.
- Pagamento simulado via Pix ou boleto, com desconto no Pix e cupons promocionais.
- Reserva temporária de estoque por 30 minutos; pedido não pago expira e libera o estoque.
- Histórico de pedidos.

## Regras de negócio

- Cadastro com e-mail e CPF únicos e data de nascimento válida; senha guardada com bcrypt.
- Navegação pública; carrinho e pedido exigem login (token JWT válido por 2 horas).
- O carrinho respeita o estoque disponível (estoque menos as reservas de outros pedidos).
- Máximo de **2 unidades** do mesmo produto de alta demanda por cliente a cada **30 dias**.
- Pagamento via Pix tem **10% de desconto**; Pix e boleto reservam o estoque por **30 minutos**.
- Cupom promocional: um por pedido, com validade e limite de usos; acumula com o desconto do Pix.

A documentação completa de todas as rotas está em [`docs/api.md`](docs/api.md) e o modelo do banco em [`docs/er-diagram.md`](docs/er-diagram.md).

---

## Como rodar em localhost

### Pré-requisitos

- **Node.js 18 ou mais novo** (confira com `node -v`). Download: https://nodejs.org
- **Git** (opcional, só se for clonar em vez de baixar o ZIP).
- Nenhum banco de dados é necessário: por padrão o back-end guarda os dados **em memória**.

### 1. Obter o projeto

```bash
git clone https://github.com/edupcsdev/ecommerce-adaptech.git
cd ecommerce-adaptech
```

Ou baixe o ZIP pelo GitHub (**Code > Download ZIP**), extraia e abra a pasta que contém o `package.json` e a pasta `front`.

> Se o ZIP criar uma pasta dentro de outra (`ecommerce-adaptech-main/ecommerce-adaptech-main`), entre na de dentro.

Você vai usar **dois terminais** abertos ao mesmo tempo: um para o back-end e outro para o front-end.

### 2. Back-end (terminal 1)

Na pasta que contém o `package.json`:

```bash
npm install
```

Crie o arquivo de configuração:

```bash
# Windows (PowerShell)
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Abra o arquivo `.env` e troque o valor de `JWT_SECRET` por um texto longo qualquer, sem espaços e sem aspas. Exemplo:

```
JWT_SECRET=adaptech-grupo-engenharia-software-afya-2026-chave-demo
```

Deixe `USAR_BANCO=false` (modo em memória). Em seguida:

```bash
npm run dev
```

Deve aparecer `Servidor rodando na porta: 3000`. Para conferir, abra http://localhost:3000/api/produtos no navegador: aparece a lista de produtos em JSON. **Deixe este terminal aberto.**

### 3. Front-end (terminal 2)

Abra um segundo terminal, entre na pasta `front` e rode:

```bash
cd front

# Windows (PowerShell)
copy .env.example .env
# Mac / Linux
# cp .env.example .env

npm install
npm run dev
```

O arquivo `front/.env` já vem com `VITE_API_URL=http://localhost:3000/api`, que liga o site ao back-end. O terminal mostra o endereço do site, normalmente **http://localhost:8080/**. Abra-o no navegador.

> O `npm install` do front pode levar alguns minutos. Os avisos de `deprecated` e `vulnerabilities` podem ser ignorados; não rode `npm audit fix --force`.

### 4. Testar o fluxo completo

1. Abra o site e vá em **Cadastro**. Use um CPF válido, como `123.456.789-09` ou `111.444.777-35`, uma data de nascimento de maior de 18 anos (por exemplo `2000-05-10`) e senha com no mínimo 8 caracteres.
2. Faça **login**.
3. Adicione produtos ao carrinho e vá para o **checkout**.
4. Preencha os dados de entrega e escolha **Pix**.
5. Confirme o pedido e confira o status em **Meus Pedidos**.

Cupons disponíveis no back-end para teste: `BEMVINDO10` e `DESCONTO50`. Para aplicar, acesse o checkout com o cupom na URL, por exemplo `/checkout?cupom=BEMVINDO10`.

### Atenção: dados em memória

Como o back-end usa memória, **todos os dados (usuários, carrinhos, pedidos) somem sempre que o servidor reinicia**. Ele reinicia sozinho ao salvar qualquer arquivo em `src/`. Depois de reiniciar, crie o usuário de novo.

### Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| `JWT_SECRET` não definida | O `.env` não existe ou está vazio. Ele deve estar na mesma pasta do `package.json` e se chamar exatamente `.env`. |
| O site mostra aviso de "produtos de exemplo" ou não conecta | O back-end não está rodando, ou o `front/.env` não existe. Depois de criar ou alterar um `.env`, pare o front (`Ctrl+C`) e rode `npm run dev` de novo. |
| Porta 3000 ou 8080 em uso | Outro programa está usando a porta. Feche-o ou reinicie o computador. |
| `Cannot find module 'scripts/...'` | O terminal está na pasta errada. Entre na pasta que contém `package.json` e `scripts`. |
| Fotos dos produtos não carregam | As fotos apontam para o servidor de arquivos da plataforma onde o front foi gerado e não existem localmente. Não afeta o funcionamento. |
| Erro no `npm install` do front | Apague a pasta `front/node_modules` e rode `npm install` de novo. |

---

## Testes

Com o back-end rodando, abra um **terceiro terminal** na pasta raiz e rode os scripts, **um por vez**:

```bash
node scripts/api-test.js                    # cadastro, login e rota protegida
node scripts/api-test-produtos.js           # produtos, categorias, busca e filtros
node scripts/api-test-carrinho-pedidos.js   # carrinho, pedido e pagamento
node scripts/api-test-cupons.js             # cupons
```

Cada script mostra ✅ ou ❌ por verificação e o total no final. Os scripts criam os próprios produtos e categorias de teste.

**Teste da expiração da reserva** (dura poucos segundos): suba o back-end com `RESERVA_MINUTOS=0.05` e rode o script com `TESTE_EXPIRACAO=1`.

```powershell
# Windows (PowerShell) — terminal do back-end
$env:RESERVA_MINUTOS="0.05"
npm run dev

# em outro terminal
$env:TESTE_EXPIRACAO="1"
node scripts/api-test-carrinho-pedidos.js
```

```bash
# Mac / Linux
RESERVA_MINUTOS=0.05 npm run dev
TESTE_EXPIRACAO=1 node scripts/api-test-carrinho-pedidos.js
```

Front-end: `cd front` e `npm test` (testes unitários com Vitest).

## Variáveis de ambiente (back-end)

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Chave para assinar os tokens (obrigatória) |
| `RESERVA_MINUTOS` | Tempo de reserva do estoque (opcional, padrão 30) |
| `USAR_BANCO` | `false` (padrão) usa memória; `true` usa PostgreSQL com Prisma |
| `DATABASE_URL` | Conexão com o PostgreSQL (só quando `USAR_BANCO=true`) |

O `.env` não vai para o Git. O `.env.example` contém apenas valores de exemplo.

## Usando PostgreSQL (opcional)

Só é necessário se quiser persistir os dados. No `.env`, preencha `DATABASE_URL` com a conexão do seu banco e defina `USAR_BANCO=true`. Depois:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

> O seed do banco (`prisma/seed.ts`) ainda tem um conjunto reduzido de produtos, diferente do catálogo de 64 produtos do modo em memória.

## Arquitetura

O back-end segue arquitetura em camadas, com separação de responsabilidades:

```
src/
├── routes/        mapeia URL + método para um controller e aplica middlewares
├── controllers/   recebe a requisição HTTP, chama o service e devolve a resposta
├── services/      regras de negócio (validações, cálculos, limites)
├── repositories/  acesso aos dados (interface + implementação em memória e Prisma)
├── models/        tipos TypeScript das entidades
├── middlewares/   autenticação JWT e tratamento de erros
├── errors/        AppError (erro com status HTTP)
├── config/        leitura das variáveis de ambiente
├── utils/         funções auxiliares (CPF, datas, valores)
└── server.ts      configura o Express e liga as rotas
```

```
requisição → routes → (autenticação) → controller → service → repository
                                                       │
                          erros (AppError) ───────────→ middleware de erros → resposta
```

Cada camada só conversa com a de baixo. Por isso a origem dos dados pode ser trocada (memória ou PostgreSQL) sem alterar as regras de negócio.

Estrutura do repositório:

```
.
├── src/        back-end (código)
├── prisma/     schema, migrations e seed do banco
├── scripts/    scripts de teste da API
├── docs/       documentação da API e diagrama ER
├── front/      front-end (React + TanStack Start)
└── README.md
```

## Limitações conhecidas e trabalhos futuros

- Pagamento simulado; falta gateway de pagamento real (Pix e boleto de verdade, confirmação por webhook).
- Perfis de usuário: hoje qualquer usuário autenticado pode alterar o catálogo.
- Cadastro e administração de cupons pela API (hoje são pré-cadastrados).
- Cancelamento de pedido pelo cliente e estorno.
- Tarefa agendada para expirar pedidos (hoje o prazo é verificado a cada requisição).
- Paginação na listagem de produtos e pedidos.
- Recuperação de senha, verificação de e-mail e refresh token.
- Cálculo de frete e upload de imagens de produtos.
- Testes automatizados com framework e integração contínua (hoje os testes do back-end são scripts).
- Alinhar o seed do banco ao catálogo completo.
