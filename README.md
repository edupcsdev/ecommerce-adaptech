# AdapTech — E-commerce de informática e periféricos

Sistema web fullstack de comércio eletrônico especializado em hardware, monitores e periféricos, desenvolvido como Projeto Integrador da disciplina de **Engenharia de Software** (Ciência da Computação — Afya Maceió | Centro Universitário de Maceió).

## 🔗 Acesse o projeto online

**https://loja-conectada-marketplace.lovable.app**

Não é preciso instalar nada: basta clicar no link e usar a loja pelo navegador (computador ou celular).

### Como testar em 5 passos

1. Abra o link acima e navegue pelo catálogo (use as categorias e a busca).
2. Clique em **Criar minha conta** e faça o cadastro. Use um CPF válido (cada CPF e cada e-mail só podem ser usados uma vez) e uma data de nascimento que indique **mais de 18 anos**; a senha precisa ter no mínimo 8 caracteres.
3. Faça **login** e adicione produtos ao **carrinho**.
4. No **checkout**, preencha os dados de entrega e escolha **Pix** (15% de desconto automático). Para testar o cupom, use `BEMVINDO10`.
5. Confirme o pedido e acompanhe o status em **Meus Pedidos**.

### Regras que você pode verificar na loja

| Para testar | Faça isto | Resultado esperado |
|---|---|---|
| Checkout restrito | Tente finalizar sem estar logado | O sistema pede o login |
| Limite de estoque | Coloque no carrinho mais unidades do que existem em estoque | A compra é bloqueada |
| Alta demanda | Tente comprar 3 unidades do mesmo modelo de placa de vídeo | Bloqueado: máximo de 2 unidades por cliente a cada 30 dias |
| Desconto no Pix | Pague com Pix | 15% de desconto |
| Cupom | Aplique `BEMVINDO10` | 10% de desconto sobre o subtotal |

> Observação: o pagamento é **simulado** (não há cobrança real) e os produtos são fictícios, usados apenas para fins acadêmicos.

---

## Sobre o projeto

Plataforma digital especializada na venda de hardware, monitores e periféricos de alta demanda. Resolve problemas comuns de lojas generalistas: pouca clareza nas especificações técnicas, controle fraco de estoque e risco de revenda abusiva em itens muito procurados.

## Equipe

| Integrante | Responsabilidade |
|---|---|
| Eduardo Henrique Paes Costa da Silva | Back-end |
| Felipe Gabriel de Lemos Aciole Tavares | Front-end |
| Eric Rocha Pessoa | Banco de dados e DevOps |
| José Luiz Jacinto dos Santos | QA e gestão fullstack |

Professor: Ícaro Santos Ferreira.

## Funcionalidades

- Cadastro e login de usuários (autenticação por JWT).
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
- Pagamento via Pix tem **15% de desconto**; Pix e boleto reservam o estoque por **30 minutos**.
- Cupom promocional: um por pedido, com validade e limite de usos; acumula com o desconto do Pix.

A documentação completa das rotas está em [`docs/api.md`](docs/api.md) e o modelo do banco em [`docs/er-diagram.md`](docs/er-diagram.md).

## Tecnologias

| Parte | Tecnologias |
|---|---|
| Back-end (raiz do repositório) | Node.js, Express 5, TypeScript, JWT, bcryptjs, Prisma (PostgreSQL, opcional) |
| Front-end (`front/`) | React, TanStack Start, Vite, Tailwind CSS |

**Versão online:** o front-end está publicado no link acima. O back-end usado nela está hospedado na **Lovable Cloud** (Edge Functions com banco de dados PostgreSQL gerenciado) e é uma **implementação equivalente** do back-end deste repositório, e não o mesmo código-fonte. Para a versão online funcionar sem depender de um computador local ligado, toda a API descrita em [`docs/api.md`](docs/api.md) foi reimplementada em TypeScript, mantendo os mesmos endpoints, contratos de dados e regras de negócio (validação de CPF, idade mínima, estoque, limite de 30 dias para itens de alta demanda, cupons e autenticação por token). O back-end de referência, em Express, é o código desta pasta e pode ser executado localmente (veja a seção "Executar localmente").

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

Cada camada só conversa com a de baixo, então a origem dos dados (memória ou PostgreSQL) pode ser trocada sem alterar as regras de negócio.

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

## Testes

Os scripts abaixo testam o **back-end deste repositório** (Express, rodando localmente em `http://localhost:3000`). Com ele rodando, execute-os **um por vez**, na pasta raiz:

```bash
node scripts/api-test.js                    # cadastro, login e rota protegida
node scripts/api-test-produtos.js           # produtos, categorias, busca e filtros
node scripts/api-test-carrinho-pedidos.js   # carrinho, pedido e pagamento
node scripts/api-test-cupons.js             # cupons
```

Cada script mostra ✅ ou ❌ por verificação e o total no final. Para o teste de expiração da reserva, veja as instruções em `scripts/api-test-carrinho-pedidos.js` (suba o servidor com `RESERVA_MINUTOS=0.05` e rode o script com `TESTE_EXPIRACAO=1`).

---

## Executar localmente (para desenvolvedores)

Só é necessário se quiser rodar o código na sua máquina. Pré-requisito: **Node.js 18 ou mais novo**. Use dois terminais.


```bash
git clone https://github.com/edupcsdev/ecommerce-adaptech
cd ecommerce-adaptech
```

**Back-end** (pasta raiz):

```bash
npm install
cp .env.example .env        # no Windows (PowerShell): copy .env.example .env
```

Abra o `.env` e troque `JWT_SECRET` por um texto longo qualquer, sem espaços. Depois:

```bash
npm run dev                 # sobe em http://localhost:3000
```

Por padrão os dados ficam **em memória** (somem ao reiniciar o servidor).

**Front-end** (pasta `front`):

```bash
cd front
cp .env.example .env        # no Windows (PowerShell): copy .env.example .env
npm install
npm run dev                 # normalmente em http://localhost:8080
```

O `front/.env` aponta para `http://localhost:3000/api`. Se o back-end não estiver rodando, o site cai em um modo de demonstração com produtos de exemplo.

| Variável (back-end) | Descrição |
|---|---|
| `JWT_SECRET` | Chave para assinar os tokens (obrigatória) |
| `RESERVA_MINUTOS` | Tempo de reserva do estoque (opcional, padrão 30) |
| `USAR_BANCO` | `false` (padrão) usa memória; `true` usa PostgreSQL com Prisma |
| `DATABASE_URL` | Conexão com o PostgreSQL (só com `USAR_BANCO=true`) |

Para usar o PostgreSQL: defina `DATABASE_URL` e `USAR_BANCO=true` no `.env` e rode `npx prisma generate`, `npx prisma migrate deploy` e `npx prisma db seed`. O seed ainda tem um conjunto reduzido de produtos, diferente do catálogo completo do modo em memória.

## Limitações conhecidas e trabalhos futuros

- Pagamento simulado; falta gateway de pagamento real (Pix e boleto de verdade, confirmação por webhook).
- Perfis de usuário: hoje qualquer usuário autenticado pode alterar o catálogo.
- Administração de cupons pela API (hoje são pré-cadastrados).
- Cancelamento de pedido pelo cliente e estorno.
- Tarefa agendada para expirar pedidos (hoje o prazo é verificado a cada requisição).
- Paginação, recuperação de senha, verificação de e-mail e refresh token.
- Cálculo de frete e upload de imagens de produtos.
- Testes automatizados com framework e integração contínua (hoje os testes do back-end são scripts).
- Alinhar o seed do banco ao catálogo completo.
