export type Usuario = {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  criadoEm: Date;
};

export type UsuarioPublico = Omit<Usuario, 'senhaHash'>;

export type NovoUsuario = Omit<Usuario, 'id' | 'criadoEm'>;