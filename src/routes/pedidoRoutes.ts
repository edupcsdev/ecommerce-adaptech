import { Router } from 'express';
import {
  postPedido,
  getPedidos,
  getPedido,
  postPagamento,
  postConfirmar,
  postCupom,
} from '../controllers/pedidoController';
import { autenticar } from '../middlewares/autenticar';

const router = Router();

router.use(autenticar); // todas as rotas de pedido exigem token

router.post('/', postPedido);
router.get('/', getPedidos);
router.get('/:id', getPedido);
router.post('/:id/pagamento', postPagamento);
router.post('/:id/confirmar', postConfirmar);
router.post('/:id/cupom', postCupom);

export default router;