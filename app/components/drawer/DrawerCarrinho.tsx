"use client";

import { useCarrinho } from "@/app/contexts/CarrinhoContexto";
import Link from "next/link";
import { useDrawer } from "../DrawerContexto";

function formatarPreco(preco: number) {
  return (preco / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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

export function DrawerCarrinho() {
  const {
    itens,
    removerItem,
    aumentarQuantidade,
    diminuirQuantidade,
    limparCarrinho,
    totalItens,
    totalPreco,
  } = useCarrinho();
  const { fecharDrawer } = useDrawer();

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-800">Carrinho</h2>
          {totalItens > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalItens}
            </span>
          )}
        </div>
        <button
          onClick={fecharDrawer}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all text-lg"
        >
          ✕
        </button>
      </div>

      {/* Itens */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {itens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-slate-500 font-semibold">Seu carrinho está vazio</p>
            <button
              onClick={fecharDrawer}
              className="text-sm text-cyan-500 font-semibold hover:underline"
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {itens.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                {/* Foto */}
                <div className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden bg-slate-200">
                  {item.produto.foto ? (
                    <img
                      src={item.produto.foto}
                      alt={item.produto.nome}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: corCategoria(item.produto.categoriaID) }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 leading-tight truncate">
                    {item.produto.nome}
                  </p>
                  <p className="text-sm font-bold text-cyan-500 mt-1">
                    {formatarPreco(item.produto.preco)}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => diminuirQuantidade(item.id)}
                      className="w-6 h-6 bg-white border border-slate-200 rounded-md text-slate-600 font-bold text-sm flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-slate-800">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => aumentarQuantidade(item.id)}
                      className="w-6 h-6 bg-white border border-slate-200 rounded-md text-slate-600 font-bold text-sm flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removerItem(item.id)}
                    className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {itens.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">
              {totalItens} {totalItens === 1 ? "item" : "itens"}
            </span>
            <span className="text-xl font-bold text-cyan-500">{totalPreco}</span>
          </div>

          <Link
            href="/checkout"
            onClick={fecharDrawer}
            className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl flex items-center justify-center transition-colors text-sm"
          >
            Finalizar compra
          </Link>

          <button
            onClick={limparCarrinho}
            className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-semibold rounded-xl transition-colors"
          >
            Limpar carrinho
          </button>
        </div>
      )}

    </div>
  );
}