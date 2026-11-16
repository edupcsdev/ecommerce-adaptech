```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Construido com:

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Conectar ao backend
1. Copie `.env.example` para `.env` e ajuste `VITE_API_URL` (padrão `http://localhost:3000/api`).
2. Rode o backend e depois `bun run dev`.
Sem `VITE_API_URL`, a loja usa os produtos de exemplo. Rotas usadas: `src/services/adaptech.ts`.
O backend precisa liberar CORS para a origem do front-end.
