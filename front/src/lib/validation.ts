import { z } from "zod";

export const checkoutSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
  telefone: z.string().regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, "Telefone inválido"),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  endereco: z.string().trim().min(3, "Informe o endereço").max(150),
  numero: z.string().trim().min(1, "Obrigatório").max(10),
  cidade: z.string().trim().min(2, "Informe a cidade").max(80),
  uf: z.string().trim().length(2, "UF com 2 letras"),
});


export const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
    dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data de nascimento")
      .refine((d) => new Date(d) <= new Date(), "A data não pode ser futura"),
    senha: z.string().min(8, "Mínimo de 8 caracteres"),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, { message: "As senhas não conferem", path: ["confirmar"] });

export const contatoSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  mensagem: z.string().trim().min(10, "Escreva pelo menos 10 caracteres").max(1000),
});

export function fieldErrors(issues: z.ZodIssue[]) {
  return Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message]));
}
