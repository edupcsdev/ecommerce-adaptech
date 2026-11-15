export type Usuario = {
  id: string;
  nome: string;
  email: string;
  cpf: string; // somente dígitos
  dataNascimento: string; // AAAA-MM-DD
  senhaHash: string;
  criadoEm: Date;
};

export type UsuarioPublico = Omit<Usuario, 'senhaHash'>;

export type NovoUsuario = Omit<Usuario, 'id' | 'criadoEm'>;