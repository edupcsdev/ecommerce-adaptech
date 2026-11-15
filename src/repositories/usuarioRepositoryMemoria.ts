import { randomUUID } from 'crypto';
import { Usuario, NovoUsuario } from '../models/usuario';
import { UsuarioRepository } from './usuarioRepository';

const usuarios: Usuario[] = [];

export const usuarioRepository: UsuarioRepository = {
  async criar(dados: NovoUsuario): Promise<Usuario> {
    const usuario: Usuario = { id: randomUUID(), criadoEm: new Date(), ...dados };
    usuarios.push(usuario);
    return usuario;
  },

  async buscarPorEmail(email: string): Promise<Usuario | undefined> {
    return usuarios.find((u) => u.email === email);
  },

  async buscarPorCpf(cpf: string): Promise<Usuario | undefined> {
    return usuarios.find((u) => u.cpf === cpf);
  },

  async buscarPorId(id: string): Promise<Usuario | undefined> {
    return usuarios.find((u) => u.id === id);
  },
};