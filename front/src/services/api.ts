// Cliente HTTP da API AdapTech (backend do colega).
// Defina VITE_API_URL (ex.: http://localhost:3000/api) no arquivo .env para ativar a integração.
// Sem essa variável, a loja continua funcionando com os dados de exemplo (modo demonstração).
export const API_URL: string = (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";
export const apiEnabled = () => API_URL !== "";

const TOKEN_KEY = "adaptech-token";
export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** Erro padrão da API: { "mensagem": "..." } + status HTTP. */
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = "ApiError"; }
}

type Opts = { method?: string; body?: unknown; auth?: boolean; query?: Record<string, string | number | undefined> };

export async function api<T>(path: string, { method = "GET", body, auth = false, query }: Opts = {}): Promise<T> {
  const qs = query ? new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])).toString() : "";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const t = tokenStore.get();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}${qs ? `?${qs}` : ""}`, body === undefined ? { method, headers } : { method, headers, body: JSON.stringify(body) });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
  }
  if (res.status === 204) return undefined as T;
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data && typeof data === "object" && "mensagem" in data ? String((data as { mensagem: unknown }).mensagem) : `Erro ${res.status}`;
    if (res.status === 401 && auth) tokenStore.clear();
    throw new ApiError(res.status, msg);
  }
  return data as T;
}
