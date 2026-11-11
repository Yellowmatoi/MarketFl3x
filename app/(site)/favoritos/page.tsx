"use client";

import Link from "next/link";
import { useFavoritos } from "@/app/contexts/FavoritosContexto";
import { useCarrinho } from "@/app/contexts/CarrinhoContexto";

function formatarPreco(preco: number) {
  return (preco / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PaginaFavoritos() {
  const { favoritos, removerFavorito } = useFavoritos();
  const { adicionarItem } = useCarrinho();

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Favoritos
        {favoritos.length > 0 && (
          <span className="text-sm font-normal text-slate-400 ml-2">
            ({favoritos.length} {favoritos.length === 1 ? "produto" : "produtos"})
          </span>
        )}
      </h1>

      {favoritos.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-semibold text-slate-500">Nenhum favorito ainda</p>
          <p className="text-sm text-slate-400">Adicione produtos aos favoritos para vê-los aqui.</p>
          <Link
            href="/"
            className="mt-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favoritos.map((produto) => (
            <div
              key={produto.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:shadow-md hover:border-cyan-400 transition-all"
            >
              <div className="relative w-full h-48 bg-slate-100 overflow-hidden flex items-center justify-center">
                <button
                  onClick={() => removerFavorito(produto.id)}
                  aria-label="Remover dos favoritos"
                  className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
                {produto.foto ? (
                  <img src={produto.foto} alt={produto.nome} className="w-full h-full object-contain p-3" />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
              </div>

              <div className="p-4 flex flex-col gap-2 flex-1">
                <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full w-fit">
                  {produto.tag}
                </span>

                <Link
                  href={`/produto/${produto.id}`}
                  className="text-sm font-bold text-slate-800 leading-tight hover:text-cyan-500 transition-colors"
                >
                  {produto.nome}
                </Link>

                <p className="text-lg font-bold text-cyan-500">{formatarPreco(produto.preco)}</p>

                <div className="flex gap-2 mt-auto pt-2">
                  <button
                    onClick={() => adicionarItem(produto)}
                    className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    + Carrinho
                  </button>
                  <Link
                    href={`/produto/${produto.id}`}
                    className="flex-1 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center"
                  >
                    Ver mais
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
