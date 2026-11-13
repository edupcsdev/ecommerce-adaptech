import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import { Usuario, UsuarioPublico } from '../models/usuario';
import { usuarioRepository } from '../repositories/usuarioRepositoryMemoria';

type Corpo = Record<string, unknown>;

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function paraPublico(usuario: Usuario): UsuarioPublico {
  const { senhaHash, ...publico } = usuario;
  return publico;
}

// RF01 - Cadastro de usuário
export async function cadastrarUsuario(corpo: Corpo): Promise<UsuarioPublico> {
  const { nome, email, senha } = corpo;

  if (typeof nome !== 'string' || nome.trim().length < 2) {
    throw new AppError('Nome é obrigatório (mínimo 2 caracteres).');
  }
  if (typeof email !== 'string' || !REGEX_EMAIL.test(email.trim())) {
    throw new AppError('E-mail inválido');
  }
  if (typeof senha !== 'string' || senha.length < 8) {
    throw new AppError('A senha deve ter no mínimo 8 caracteres.');
  }

  const emailNormalizado = email.trim().toLowerCase();

  if (await usuarioRepository.buscarPorEmail(emailNormalizado)) {
    throw new AppError('Esse e-mail já está cadastrado.', 409);
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await usuarioRepository.criar({
    nome: nome.trim(),
    email: emailNormalizado,
    senhaHash,
  });

  return paraPublico(usuario);
}

// RF02 - Login com JWT
export async function login(corpo: Corpo): Promise<{ token: string; usuario: UsuarioPublico }> {
  const { email, senha } = corpo;

  if (typeof email !== 'string' || typeof senha !== 'string') {
    throw new AppError('E-mail e senha são obrigatórios');
  }

  const usuario = await usuarioRepository.buscarPorEmail(email.trim().toLowerCase());
  const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senhaHash) : false;

  // Mesma mensagem para e-mail ou senha errados (não revela qual existe)
  if (!usuario || !senhaConfere) {
    throw new AppError('E-mail ou senha inválidos', 401);
  }

  const token = jwt.sign({ email: usuario.email }, env.JWT_SECRET, {
    subject: String(usuario.id),
    expiresIn: env.JWT_EXPIRACAO,
  });

  return { token, usuario: paraPublico(usuario) };
}

export async function buscarUsuarioLogado(id: number): Promise<UsuarioPublico> {
  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
  }
  return paraPublico(usuario);
}