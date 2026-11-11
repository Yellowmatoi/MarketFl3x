"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCarrinho } from "@/app/contexts/CarrinhoContexto";
import { useFavoritos } from "@/app/contexts/FavoritosContexto";
import { PRODUTOS } from "@/app/dados/produtos";
import { VENDEDORES } from "@/app/dados/vendedores";
import { CATEGORIAS } from "@/app/dados/categorias";

function formatarPreco(preco: number) {
  return (preco / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function estrelasAvaliacao(avaliacao: number) {
  return "★".repeat(Math.round(avaliacao)) + "☆".repeat(5 - Math.round(avaliacao));
}

function corCategoria(categoriaID: number) {
  const cores: Record<number, string> = {
    1: "#e0f2fe",
    2: "#fce7f3",
    3: "#ede9fe",
    4: "#fef9c3",
    5: "#dcfce7",
  };
  return cores[categoriaID] ?? "#f1f5f9";
}

export default function PaginaProduto() {
  const { id } = useParams();
  const { adicionarItem } = useCarrinho();
  const { alternarFavorito, estaFavoritado } = useFavoritos();

  const produto = PRODUTOS.find((p) => p.id === Number(id));
  const vendedor = VENDEDORES.find((v) => v.id === produto?.vendedorID) ?? null;
  const categoria = CATEGORIAS.find((c) => c.id === produto?.categoriaID) ?? null;
  const outrosProdutos = PRODUTOS.filter(
    (p) => p.vendedorID === produto?.vendedorID && p.id !== produto?.id
  );

  return (
    <>
      <Link
        href="/"
        className="inline-block text-sm font-semibold text-cyan-500 hover:underline mb-6"
      >
        ← Voltar aos produtos
      </Link>

      {!produto ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-slate-500">Produto não encontrado</p>
          <Link
            href="/"
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Ir para a loja
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Foto */}
            <div className="w-full h-72 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
              {produto.foto ? (
                <img
                  src={produto.foto}
                  alt={produto.nome}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ background: corCategoria(produto.categoriaID) }}
                />
              )}
            </div>

            {/* Informações */}
            <div className="flex flex-col gap-4">

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                  {produto.tag}
                </span>
                {categoria && (
                  <span className="text-xs text-slate-400">{categoria.nome}</span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-slate-800 leading-tight">
                {produto.nome}
              </h1>

              <p className="text-3xl font-bold text-cyan-500">
                {formatarPreco(produto.preco)}
              </p>

              <p className="text-sm text-slate-500 leading-relaxed">
                {produto.descricao}
              </p>

              {/* Vendedor */}
              {vendedor && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Vendido por
                  </p>
                  <p className="text-base font-bold text-slate-800">{vendedor.nome}</p>
                  <p className="text-sm text-slate-500">
                    {vendedor.cidade} — {vendedor.estado}
                  </p>
                  <p className="text-sm text-slate-500">{vendedor.telefone}</p>
                  <p className="text-sm text-slate-500">{vendedor.email}</p>
                  <p className="text-sm text-yellow-400 font-semibold">
                    {estrelasAvaliacao(vendedor.avaliacao)} {vendedor.avaliacao}
                  </p>
                  <div className="flex gap-6 pt-2 border-t border-slate-200 mt-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base font-bold text-slate-800">
                        {vendedor.totalVendas}
                      </span>
                      <span className="text-xs text-slate-400">Vendas</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base font-bold text-slate-800">
                        {outrosProdutos.length + 1}
                      </span>
                      <span className="text-xs text-slate-400">Produtos</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base font-bold text-slate-800">
                        {vendedor.membro}
                      </span>
                      <span className="text-xs text-slate-400">Membro desde</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => adicionarItem(produto)}
                  className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-bold text-base rounded-xl transition-colors"
                >
                  Adicionar ao carrinho
                </button>
                <button
                  onClick={() => alternarFavorito(produto)}
                  aria-label={estaFavoritado(produto.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-colors ${
                    estaFavoritado(produto.id)
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"
                  }`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={estaFavoritado(produto.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {/* Outros produtos do vendedor */}
          {outrosProdutos.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Outros produtos de {vendedor?.nome}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {outrosProdutos.map((p) => (
                  <Link
                    key={p.id}
                    href={`/produto/${p.id}`}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-cyan-400 transition-all flex flex-col"
                  >
                    <div className="w-full h-24 bg-slate-100 overflow-hidden">
                      {p.foto ? (
                        <img
                          src={p.foto}
                          alt={p.nome}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: corCategoria(p.categoriaID) }}
                        />
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {p.nome}
                      </p>
                      <p className="text-sm font-bold text-cyan-500">
                        {formatarPreco(p.preco)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}