# AdapTech — Back-end

API REST do e-commerce AdapTech, loja de periféricos e produtos de informática. Projeto da disciplina de Engenharia de Software.

## Tecnologias

- Node.js + Express 5
- TypeScript
- JWT (jsonwebtoken) para autenticação e bcryptjs para as senhas
- dotenv para variáveis de ambiente
- ts-node-dev para desenvolvimento

## Como instalar e rodar

Pré-requisito: Node.js 18 ou mais novo.

```bash
git clone https://github.com/edupcsdev/ecommerce-adaptech.git
cd ecommerce-adaptech
npm install
cp .env.example .env     # no PowerShell: copy .env.example .env
```

Abra o `.env` e troque o `JWT_SECRET` por uma string longa e aleatória. Para gerar uma:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Rodar em desenvolvimento (reinicia ao salvar):

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`. Para compilar e rodar a versão de produção: `npm run build` e `npm start`.

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Chave usada para assinar os tokens (obrigatória) |
| `RESERVA_MINUTOS` | Tempo de reserva do estoque no pagamento (opcional, padrão 30) |

O `.env` não vai para o Git. O `.env.example` só tem valores de exemplo, sem credenciais reais.

## Testes

Com o servidor rodando, em outro terminal:

```bash
node scripts/api-test.js                    # cadastro, login e rota protegida
node scripts/api-test-produtos.js           # produtos, categorias, busca e filtros
node scripts/api-test-carrinho-pedidos.js   # carrinho, pedido e pagamento
node scripts/api-test-cupons.js             # cupons
```

Cada script mostra ✅/❌ por verificação e o total no final. Teste da expiração da reserva (dura poucos segundos): suba o servidor com `RESERVA_MINUTOS=0.05` e rode `TESTE_EXPIRACAO=1 node scripts/api-test-carrinho-pedidos.js` (no PowerShell: `$env:RESERVA_MINUTOS="0.05"` e `$env:TESTE_EXPIRACAO="1"` antes dos comandos).

## Arquitetura em camadas

```
src/
├── routes/        mapeia URL + método para um controller e aplica middlewares (ex.: autenticação)
├── controllers/   recebe a requisição HTTP, chama o service e devolve a resposta
├── services/      regras de negócio (validações, cálculos, limites)
├── repositories/  acesso aos dados; uma interface por entidade e uma implementação
├── models/        tipos TypeScript das entidades
├── middlewares/   autenticação JWT e tratamento de erros
├── errors/        AppError (erro com status HTTP)
├── config/        leitura das variáveis de ambiente
├── utils/         funções auxiliares (CPF, datas, valores em reais)
└── server.ts      configura o Express e liga as rotas
```

Fluxo de uma requisição:

```
requisição → routes → (middleware de autenticação) → controller → service → repository
                                                         │
                                  erros (AppError) ─────→ middleware de erros → resposta
```

Cada camada só conversa com a de baixo. O service não conhece `req`/`res`, e o repository não conhece HTTP. Por isso a implementação dos dados pode ser trocada (por exemplo, o banco) sem mexer nas regras de negócio.

### Banco de dados

O acesso a dados passa só pela camada `repositories`. Na versão atual os repositories guardam os dados em memória (os dados somem ao reiniciar o servidor, e o catálogo e os cupons começam com dados de exemplo). A implementação com PostgreSQL e Prisma está sendo feita em paralelo (issues BD01 a BD04) e entra trocando as implementações dos repositories.

## Documentação da API

Todas as rotas, com método, URL, autenticação, corpo, respostas e códigos de status, estão em [`docs/api.md`](docs/api.md).

## Regras de negócio

- Cadastro com e-mail e CPF únicos e data de nascimento válida; senha guardada com bcrypt.
- Login devolve um token JWT (2 horas); rotas de carrinho e pedido exigem token.
- Catálogo público (listagem, detalhe e busca com filtros); criar, alterar e remover exige token.
- Carrinho respeita o estoque disponível (estoque menos reservas de outros pedidos).
- Pedido só para maiores de 18 anos; máximo de 2 unidades por produto de alta demanda a cada 30 dias.
- Pagamento simulado: PIX tem 15% de desconto; o estoque é reservado por 30 minutos; sem confirmação o pedido expira e o estoque é liberado.
- Cupom promocional: um por pedido, com validade e limite de usos; acumula com o desconto do PIX (ambos sobre o subtotal).

## Funcionalidades não implementadas (trabalhos futuros)

- Gateway de pagamento real (PIX e boleto de verdade, confirmação por webhook): hoje o pagamento é simulado.
- Persistência em banco de dados (PostgreSQL com Prisma), se ainda não integrada.
- Perfis de usuário (por exemplo, administrador): hoje qualquer usuário autenticado altera o catálogo.
- Cadastro e administração de cupons pela API: hoje os cupons vêm pré-cadastrados.
- Cancelamento de pedido pelo cliente e estorno.
- Tarefa agendada para expirar pedidos (hoje o prazo é verificado a cada requisição).
- Paginação na listagem de produtos e pedidos.
- Recuperação de senha, verificação de e-mail e refresh token.
- Cálculo de frete e endereço de entrega.
- Upload de imagens de produtos.
- Limite de requisições (rate limit), logs estruturados e testes automatizados com framework e integração contínua.

## Equipe

(preencher com os integrantes e as responsabilidades)
