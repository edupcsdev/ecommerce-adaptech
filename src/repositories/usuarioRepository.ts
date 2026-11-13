import { Usuario, NovoUsuario } from '../models/usuario';

export interface UsuarioRepository {
  criar(dados: NovoUsuario): Promise<Usuario>;
  buscarPorEmail(email: string): Promise<Usuario | undefined>;
  buscarPorId(id: number): Promise<Usuario | undefined>;
}