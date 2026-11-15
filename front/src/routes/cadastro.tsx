import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { cadastroSchema } from "@/lib/validation";
import { SimpleForm } from "@/components/store/SimpleForm";
import { apiEnabled } from "@/services/api";
import { cadastrarUsuario } from "@/services/adaptech";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — AdapTech" },
      { name: "description", content: "Cadastre-se na AdapTech e ganhe 10% na primeira compra." },
      { property: "og:title", content: "Cadastro AdapTech" },
      { property: "og:description", content: "Crie sua conta gratuitamente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cadastro,
});

function Cadastro() {
  const navigate = useNavigate();
  return (
    <div className="grid-bg flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">Ganhe 10% OFF na primeira compra com o cupom ADAPTECH10.</p>
        <SimpleForm schema={cadastroSchema} submitLabel="Cadastrar"
          fields={[{ name: "nome", label: "Nome completo" }, { name: "email", label: "E-mail", type: "email" }, { name: "cpf", label: "CPF" }, { name: "dataNascimento", label: "Data de nascimento", type: "date" }, { name: "senha", label: "Senha", type: "password" }, { name: "confirmar", label: "Confirmar senha", type: "password" }]}
          onSuccess={async (form) => {
            if (!apiEnabled()) { toast.success("Conta criada (demonstração)"); navigate({ to: "/login" }); return; }
            const d = Object.fromEntries(new FormData(form)) as Record<string, string>;
            try {
              await cadastrarUsuario({ nome: d["nome"] ?? "", email: d["email"] ?? "", cpf: d["cpf"] ?? "", dataNascimento: d["dataNascimento"] ?? "", senha: d["senha"] ?? "" });
              toast.success("Conta criada! Agora é só entrar."); navigate({ to: "/login" });
            } catch (e) { toast.error((e as Error).message); }
          }}
          footer={<p className="text-center text-sm text-muted-foreground">Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link></p>} />
      </div>
    </div>
  );
}
