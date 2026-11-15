import { Router } from 'express';
import { getCarrinho, postItem, putItem, deleteItem } from '../controllers/carrinhoController';
import { autenticar } from '../middlewares/autenticar';

const router = Router();

router.use(autenticar); // todas as rotas do carrinho exigem token

router.get('/', getCarrinho);
router.post('/itens', postItem);
router.put('/itens/:id', putItem);
router.delete('/itens/:id', deleteItem);

export default router;