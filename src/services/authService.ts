import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import { Usuario, UsuarioPublico } from '../models/usuario';
import { usuarioRepository } from '../repositories';
import { cpfValido, limparCpf } from '../utils/cpf';
import { dataNascimentoValida } from '../utils/data';



type Corpo = Record<string, unknown>;

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function paraPublico(usuario: Usuario): UsuarioPublico {
  const { senhaHash, ...publico } = usuario;
  return publico;
}

// RF01 - Cadastro de usuário
export async function cadastrarUsuario(corpo: Corpo): Promise<UsuarioPublico> {
  const { nome, email, cpf, dataNascimento, senha } = corpo;

  if (typeof nome !== 'string' || nome.trim().length < 2) {
    throw new AppError('Nome é obrigatório (mínimo 2 caracteres)');
  }
  if (typeof email !== 'string' || !REGEX_EMAIL.test(email.trim())) {
    throw new AppError('E-mail inválido');
  }
  if (typeof cpf !== 'string' || !cpfValido(cpf)) {
    throw new AppError('CPF inválido');
  }
  if (typeof dataNascimento !== 'string' || !dataNascimentoValida(dataNascimento)) {
    throw new AppError('Data de nascimento inválida (use AAAA-MM-DD e não informe data futura)');
  }
  if (typeof senha !== 'string' || senha.length < 8) {
    throw new AppError('A senha deve ter no mínimo 8 caracteres');
  }

  const emailNormalizado = email.trim().toLowerCase();
  const cpfNormalizado = limparCpf(cpf);

  if (await usuarioRepository.buscarPorEmail(emailNormalizado)) {
    throw new AppError('E-mail já cadastrado', 409);
  }
  if (await usuarioRepository.buscarPorCpf(cpfNormalizado)) {
    throw new AppError('CPF já cadastrado', 409);
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await usuarioRepository.criar({
    nome: nome.trim(),
    email: emailNormalizado,
    cpf: cpfNormalizado,
    dataNascimento,
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

export async function buscarUsuarioLogado(id: string): Promise<UsuarioPublico> {
  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
  }
  return paraPublico(usuario);
}