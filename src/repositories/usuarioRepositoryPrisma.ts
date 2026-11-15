import { Prisma, User } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { prisma } from '../lib/prisma';
import { Usuario } from '../models/usuario';
import { UsuarioRepository } from './usuarioRepository';

function paraDominio(u: User): Usuario {
  return {
    id: u.id,
    nome: u.name,
    email: u.email,
    cpf: u.cpf,
    dataNascimento: u.birthDate.toISOString().slice(0, 10), // AAAA-MM-DD
    senhaHash: u.passwordHash,
    criadoEm: u.createdAt,
  };
}

export const usuarioRepository: UsuarioRepository = {
  async criar(dados) {
    try {
      const usuario = await prisma.user.create({
        data: {
          name: dados.nome,
          email: dados.email,
          cpf: dados.cpf,
          passwordHash: dados.senhaHash,
          birthDate: new Date(`${dados.dataNascimento}T00:00:00.000Z`),
        },
      });
      return paraDominio(usuario);
    } catch (erro) {
      // cadastro duplicado por clique duplo: o banco também garante a unicidade
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new AppError('E-mail ou CPF já cadastrado', 409);
      }
      throw erro;
    }
  },

  async buscarPorEmail(email) {
    const usuario = await prisma.user.findUnique({ where: { email } });
    return usuario ? paraDominio(usuario) : undefined;
  },

  async buscarPorCpf(cpf) {
    const usuario = await prisma.user.findUnique({ where: { cpf } });
    return usuario ? paraDominio(usuario) : undefined;
  },

  async buscarPorId(id) {
    const usuario = await prisma.user.findUnique({ where: { id } });
    return usuario ? paraDominio(usuario) : undefined;
  },
};