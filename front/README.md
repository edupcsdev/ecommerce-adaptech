# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Conectar ao backend
1. Copie `.env.example` para `.env` e ajuste `VITE_API_URL` (padrão `http://localhost:3000/api`).
2. Rode o backend e depois `bun run dev`.
Sem `VITE_API_URL`, a loja usa os produtos de exemplo. Rotas usadas: `src/services/adaptech.ts`.
O backend precisa liberar CORS para a origem do front-end.
