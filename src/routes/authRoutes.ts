import { Router } from 'express';
import { postCadastro, postLogin, getMe } from '../controllers/authController';
import { autenticar } from '../middlewares/autenticar';

const router = Router();

router.post('/usuarios', postCadastro);   // RF01
router.post('/auth/login', postLogin);    // RF02
router.get('/auth/me', autenticar, getMe); // teste rápido do token

export default router;