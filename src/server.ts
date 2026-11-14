import express from 'express';
import cors from 'cors';
import produtoRoutes from './routes/produtoRoutes';
import authRoutes from './routes/authRoutes';
import { tratarErros } from './middlewares/tratarErros';
import categoriaRoutes from './routes/categoriaRoutes';


const app = express();
const PORTA = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/produtos', produtoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api', authRoutes);

app.use(tratarErros);

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta: ${PORTA}`);
});