import { createFileRoute } from "@tanstack/react-router";
import { Award, Headphones, Rocket, Users } from "lucide-react";
import { PageHeader } from "@/components/store/PageHeader";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a AdapTech" },
      { name: "description", content: "Conheça a AdapTech, loja de peças e periféricos de informática." },
      { property: "og:title", content: "Sobre a AdapTech" },
      { property: "og:description", content: "Nossa missão é adaptar a tecnologia a você." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Sobre,
});

const values = [
  { icon: Rocket, t: "Missão", d: "Adaptar a tecnologia a cada pessoa, do estudante ao gamer profissional." },
  { icon: Award, t: "Qualidade", d: "Só trabalhamos com marcas reconhecidas e produtos com garantia." },
  { icon: Headphones, t: "Suporte", d: "Atendimento técnico especializado para ajudar na montagem do seu PC." },
  { icon: Users, t: "Comunidade", d: "Mais de 50 mil clientes satisfeitos em todo o Brasil." },
];

function Sobre() {
  return (
    <>
      <PageHeader title="Sobre a AdapTech" subtitle="Tecnologia que se adapta a você." />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <p className="text-lg text-muted-foreground">A AdapTech nasceu da paixão por hardware. Somos uma loja especializada em peças e periféricos de informática — placas de vídeo, processadores, monitores, teclados, mouses, headsets e tudo o que você precisa para montar ou melhorar o seu computador.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {values.map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-xl border border-border bg-card p-6">
              <I className="h-8 w-8 text-primary" />
              <h3 className="mt-3 text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
