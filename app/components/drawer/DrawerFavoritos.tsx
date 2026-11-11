"use client";

import Link from "next/link";
import { useDrawer } from "../DrawerContexto";
import { useFavoritos } from "../../contexts/FavoritosContexto";
import { useCarrinho } from "../../contexts/CarrinhoContexto";

function formatarPreco(preco: number) {
  return (preco / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DrawerFavoritos() {
  const { fecharDrawer } = useDrawer();
  const { favoritos, removerFavorito } = useFavoritos();
  const { adicionarItem } = useCarrinho();

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">
          Favoritos {favoritos.length > 0 && <span className="text-slate-400 font-normal">({favoritos.length})</span>}
        </h2>
        <button
          onClick={fecharDrawer}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all text-lg"
        >
          ✕
        </button>
      </div>

      {favoritos.length === 0 ? (
        /* Estado vazio */
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <p className="text-slate-500 font-semibold">Nenhum favorito ainda</p>
          <p className="text-sm text-slate-400">Adicione produtos aos favoritos para vê-los aqui.</p>
          <button
            onClick={fecharDrawer}
            className="text-sm text-cyan-500 font-semibold hover:underline mt-1"
          >
            Ver produtos
          </button>
        </div>
      ) : (
        /* Lista de favoritos */
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {favoritos.map((produto) => (
            <div
              key={produto.id}
              className="flex gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3"
            >
              <Link
                href={`/produto/${produto.id}`}
                onClick={fecharDrawer}
                className="w-16 h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-slate-100"
              >
                {produto.foto ? (
                  <img src={produto.foto} alt={produto.nome} className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
              </Link>

              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <Link
                  href={`/produto/${produto.id}`}
                  onClick={fecharDrawer}
                  className="text-sm font-bold text-slate-800 leading-tight hover:text-cyan-500 transition-colors line-clamp-2"
                >
                  {produto.nome}
                </Link>
                <p className="text-sm font-bold text-cyan-500">{formatarPreco(produto.preco)}</p>

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => adicionarItem(produto)}
                    className="flex-1 h-8 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    + Carrinho
                  </button>
                  <button
                    onClick={() => removerFavorito(produto.id)}
                    aria-label="Remover dos favoritos"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
