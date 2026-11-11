"use client";


import { useCarrinho } from "@/app/contexts/CarrinhoContexto";
import { CATEGORIAS } from "@/app/dados/categorias";
import { VENDEDORES } from "@/app/dados/vendedores";
import Link from "next/link";

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

export default function PaginaCarrinho() {
  const {
    itens,
    removerItem,
    aumentarQuantidade,
    diminuirQuantidade,
    limparCarrinho,
    totalItens,
    totalPreco,
  } = useCarrinho();

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Meu Carrinho</h1>

      {itens.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-slate-500">Seu carrinho está vazio</p>
          <Link
            href="/"
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Ver produtos
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {itens.map((item) => {
              const vendedor = VENDEDORES.find((v) => v.id === item.produto.vendedorID);
              const categoria = CATEGORIAS.find((c) => c.id === item.produto.categoriaID);

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4"
                >
                  {/* Foto */}
                  <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-slate-100">
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

                  <div className="flex-1 flex flex-col gap-1">
                    <p className="text-sm font-bold text-slate-800">{item.produto.nome}</p>
                    <p className="text-xs text-slate-400">
                      {categoria?.nome} • {item.produto.tag}
                    </p>
                    <p className="text-xs text-slate-400">
                      Vendedor: {vendedor?.nome}
                    </p>
                    <p className="text-base font-bold text-cyan-500">
                      {formatarPreco(item.produto.preco)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => diminuirQuantidade(item.id)}
                      className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-slate-800">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => aumentarQuantidade(item.id)}
                      className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removerItem(item.id)}
                    className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4 mt-6">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Total de itens</span>
              <span className="font-semibold text-slate-700">
                {totalItens} {totalItens === 1 ? "item" : "itens"}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-800 border-t border-slate-100 pt-4">
              <span>Total</span>
              <span className="text-cyan-500 text-xl">{totalPreco}</span>
            </div>
            <button className="h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors">
              Finalizar compra
            </button>
            <button
              onClick={limparCarrinho}
              className="h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 font-semibold rounded-xl transition-colors text-sm"
            >
              Limpar carrinho
            </button>
          </div>
        </>
      )}
    </>
  );
}