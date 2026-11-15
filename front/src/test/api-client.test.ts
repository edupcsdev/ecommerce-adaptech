import { afterEach, describe, expect, it, vi } from "vitest";
import { fromApiProduto } from "@/services/mappers";

describe("cliente da API", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules(); });

  it("envia o token e repassa a mensagem de erro do backend", async () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:3000/api/");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ mensagem: "Estoque insuficiente" }), { status: 409 }));
    vi.stubGlobal("fetch", fetchMock);
    const { api, tokenStore } = await import("@/services/api");
    tokenStore.set("abc");
    await expect(api("/pedidos", { method: "POST", auth: true })).rejects.toMatchObject({ status: 409, message: "Estoque insuficiente" });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://localhost:3000/api/pedidos");
    expect(init.headers.Authorization).toBe("Bearer abc");
  });

  it("ignora filtros vazios na busca de produtos", async () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:3000/api");
    const fetchMock = vi.fn().mockResolvedValue(new Response("[]", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { listarProdutos } = await import("@/services/adaptech");
    await listarProdutos({ busca: "mouse", precoMin: undefined, ordenar: "preco_asc" });
    expect(fetchMock.mock.calls[0]![0]).toBe("http://localhost:3000/api/produtos?busca=mouse&ordenar=preco_asc");
  });

  it("converte produto da API para o formato das telas", () => {
    const p = fromApiProduto({ id: "u1", nome: "Mouse X", preco: 150, estoque: 3, categoriaId: 1, especificacoes: '{"DPI":16000}' }, [{ id: 1, nome: "Mouses" }]);
    expect(p).toMatchObject({ id: "u1", price: 150, stock: 3, category: "mouses", specs: { DPI: "16000" } });
  });
});
