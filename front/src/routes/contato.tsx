import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { contatoSchema } from "@/lib/validation";
import { SimpleForm } from "@/components/store/SimpleForm";
import { PageHeader } from "@/components/store/PageHeader";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — AdapTech" },
      { name: "description", content: "Fale com a equipe AdapTech." },
      { property: "og:title", content: "Contato AdapTech" },
      { property: "og:description", content: "Tire suas dúvidas com nossos especialistas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contato,
});

function Contato() {
  return (
    <>
      <PageHeader title="Fale conosco" subtitle="Responderemos em até 24 horas úteis." />
      <div className="container mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-border bg-card p-6">
          <SimpleForm schema={contatoSchema} submitLabel="Enviar mensagem"
            fields={[{ name: "nome", label: "Nome" }, { name: "email", label: "E-mail", type: "email" }, { name: "mensagem", label: "Mensagem", textarea: true }]}
            onSuccess={(f) => { toast.success("Mensagem enviada!"); f.reset(); }} />
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4"><Mail className="text-primary" /> contato@adaptech.com.br</div>
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4"><Phone className="text-primary" /> (11) 4000-1234</div>
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4"><MapPin className="text-primary" /> São Paulo — SP</div>
        </div>
      </div>
    </>
  );
}
