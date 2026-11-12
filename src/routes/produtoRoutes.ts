import { Router } from 'express';
import { getProdutos, getProdutoPorId } from '../controllers/produtoController';

const router = Router();

router.get('/', getProdutos);
router.get('/:id', getProdutoPorId);

export default router;