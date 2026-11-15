import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validation";
import { SimpleForm } from "@/components/store/SimpleForm";
import { useAuth } from "@/lib/auth";
import { apiEnabled } from "@/services/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — AdapTech" },
      { name: "description", content: "Acesse sua conta AdapTech." },
      { property: "og:title", content: "Entrar na AdapTech" },
      { property: "og:description", content: "Acompanhe pedidos e ofertas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  return (
    <div className="grid-bg flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">Acesse sua conta para acompanhar seus pedidos.</p>
        <SimpleForm schema={loginSchema} submitLabel="Entrar"
          fields={[{ name: "email", label: "E-mail", type: "email" }, { name: "senha", label: "Senha", type: "password" }]}
          onSuccess={async (form) => {
            if (!apiEnabled()) { toast.success("Login realizado (demonstração)"); navigate({ to: "/" }); return; }
            const d = new FormData(form);
            try { await login(String(d.get("email")), String(d.get("senha"))); toast.success("Bem-vindo de volta!"); navigate({ to: "/" }); }
            catch (e) { toast.error((e as Error).message); }
          }}
          footer={<p className="text-center text-sm text-muted-foreground">Não tem conta? <Link to="/cadastro" className="text-primary hover:underline">Cadastre-se</Link></p>} />
      </div>
    </div>
  );
}
