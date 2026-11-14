import { Router } from 'express';
import {
  getProdutos,
  getProdutoPorId,
  postProduto,
  putProduto,
  deleteProduto,
} from '../controllers/produtoController';
import { autenticar } from '../middlewares/autenticar';

const router = Router();

router.get('/', getProdutos);
router.get('/:id', getProdutoPorId);
router.post('/', autenticar, postProduto);
router.put('/:id', autenticar, putProduto);
router.delete('/:id', autenticar, deleteProduto);

export default router;