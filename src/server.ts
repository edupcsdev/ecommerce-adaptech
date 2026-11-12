
import express from 'express';
import cors from 'cors';
import produtoRoutes from './routes/produtoRoutes';

const app = express();
const PORTA = 3000;

app.use(cors());
app.use('/produtos', produtoRoutes);

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta: ${PORTA}`);
});