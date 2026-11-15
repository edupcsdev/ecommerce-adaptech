import type React from "react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiEnabled, tokenStore } from "@/services/api";
import * as Api from "@/services/adaptech";

type AuthCtx = {
  user: Api.Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
};
// Mantém o mesmo contexto entre recarregamentos automáticos do editor (evita tela em branco).
const g = globalThis as unknown as Record<string, React.Context<AuthCtx | null> | undefined>;
const Ctx = (g["__adaptechAuthCtx"] ??= createContext<AuthCtx | null>(null));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Api.Usuario | null>(null);
  useEffect(() => {
    if (apiEnabled() && tokenStore.get()) Api.me().then(setUser).catch(() => tokenStore.clear());
  }, []);
  const value: AuthCtx = {
    user,
    login: async (email, senha) => {
      const r = await Api.login({ email, senha });
      tokenStore.set(r.token);
      setUser(r.usuario);
    },
    logout: () => { tokenStore.clear(); setUser(null); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return c;
}
