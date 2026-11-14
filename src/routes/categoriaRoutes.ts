import { Router } from 'express';
import { getCategorias, postCategoria, deleteCategoria } from '../controllers/categoriaController';
import { autenticar } from '../middlewares/autenticar';

const router = Router();

router.get('/', getCategorias);
router.post('/', autenticar, postCategoria);
router.delete('/:id', autenticar, deleteCategoria);

export default router;