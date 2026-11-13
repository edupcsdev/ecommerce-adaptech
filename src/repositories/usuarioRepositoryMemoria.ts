import { Usuario, NovoUsuario } from '../models/usuario';
import { UsuarioRepository } from './usuarioRepository';

const usuarios: Usuario[] = [];
let proximoId = 1;

export const usuarioRepository: UsuarioRepository = {
  async criar(dados: NovoUsuario): Promise<Usuario> {
    const usuario: Usuario = { id: proximoId++, criadoEm: new Date(), ...dados };
    usuarios.push(usuario);
    return usuario;
  },

  async buscarPorEmail(email: string): Promise<Usuario | undefined> {
    return usuarios.find((u) => u.email === email);
  },

  async buscarPorId(id: number): Promise<Usuario | undefined> {
    return usuarios.find((u) => u.id === id);
  },
};