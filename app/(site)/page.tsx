"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCarrinho } from "../contexts/CarrinhoContexto";
import { useFavoritos } from "../contexts/FavoritosContexto";
import { IProduto } from "../interfaces/produto";


const CATEGORIAS = [];
const VENDEDORES = [];

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

export default function PaginaInicial() {
  const { adicionarItem } = useCarrinho();
  const { alternarFavorito, estaFavoritado } = useFavoritos();
  const searchParams = useSearchParams();
  const categoriaUrl = searchParams.get("categoria") ?? "";
  const buscaUrl = searchParams.get("busca") ?? "";
  const [produtos, setProdutos] = useState<Array<IProduto>>([]);

  const categoriasMap: Record<string, string> = {
    "roupas": "Roupa",
    "bonecos": "Boneco",
    "action-figures": "Action Figure",
    "mangas": "Mangá",
    "acessorios": "Acessório",
  };

  const nomeCategoriaAtual: Record<string, string> = {
    "roupas": "Roupas",
    "bonecos": "Bonecos",
    "action-figures": "Action Figures",
    "mangas": "Mangás",
    "acessorios": "Acessórios",
  };

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const termo = buscaUrl.toLowerCase();
      const categoria = CATEGORIAS.find((c) => c.id === p.categoriaID);
      const vendedor = VENDEDORES.find((v) => v.id === p.vendedorID);
      const categoriaFiltro = categoriasMap[categoriaUrl] ?? "";

      const passaCategoria = categoriaFiltro
        ? categoria?.nome === categoriaFiltro
        : true;

      const passaBusca = termo
        ? p.nome.toLowerCase().includes(termo) ||
        (categoria?.nome ?? "").toLowerCase().includes(termo) ||
        p.tag.toLowerCase().includes(termo) ||
        (vendedor?.nome ?? "").toLowerCase().includes(termo)
        : true;

      return passaCategoria && passaBusca;
    });
  }, [buscaUrl, categoriaUrl, produtos]);

  useEffect(() => {
    const getProdutos = async () => {
      const response = await fetch("http://localhost:8080/api/produtos")
        .then(async body => {
          const data = await body.json()
          console.log(data)
          let temp: Array<IProduto> = []
          for(let produto of data){
            temp.push({
              id: produto["id"],
              vendedorID: produto["vendedorId"],
              nome: produto["nome"],
              descricao: produto["descricao"],
              preco: produto["preco"],
              tag: produto["tag"],
              foto: produto["foto"],
              categoriaID: produto["categoriaId"]
            })
          }
          return temp
        })
        .catch((e) => {
          console.error(e)
          return []
        })
        setProdutos(response)
    }
    getProdutos()
  }, [])

  return (
    <>
      {/* Filtros ativos */}
      {(categoriaUrl || buscaUrl) && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {categoriaUrl && (
            <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-3 py-1">
              <span className="text-xs font-semibold text-cyan-600">
                {nomeCategoriaAtual[categoriaUrl]}
              </span>
              <Link href="/" className="text-cyan-400 hover:text-cyan-600 text-sm font-bold">✕</Link>
            </div>
          )}
          {buscaUrl && (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
              <span className="text-xs font-semibold text-slate-600">"{buscaUrl}"</span>
              <Link href="/" className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</Link>
            </div>
          )}
        </div>
      )}

      {/* Título */}
      <h2 className="text-xl font-bold text-slate-800 mb-5">
        {categoriaUrl
          ? nomeCategoriaAtual[categoriaUrl]
          : buscaUrl
            ? "Resultados da busca"
            : "Produtos em destaque"}
        <span className="text-sm font-normal text-slate-400 ml-2">
          ({produtosFiltrados.length}{" "}
          {produtosFiltrados.length === 1 ? "produto" : "produtos"})
        </span>
      </h2>

      {/* Sem resultado */}
      {produtosFiltrados.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-sm mb-4">Nenhum produto encontrado</p>
          <Link href="/" className="text-cyan-500 text-sm font-semibold hover:underline">
            Ver todos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {produtosFiltrados.map((produto: IProduto) => {
            const vendedor = VENDEDORES.find((v) => v.id === produto.vendedorID);
            const categoria = CATEGORIAS.find((c) => c.id === produto.categoriaID);

            return (
              <div
                key={produto.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:shadow-md hover:border-cyan-400 transition-all"
              >
                {/* Foto */}
                <div className="relative w-full h-48 bg-slate-100 overflow-hidden flex items-center justify-center">
                  <button
                    onClick={() => alternarFavorito(produto)}
                    aria-label={estaFavoritado(produto.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    className={`absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all ${estaFavoritado(produto.id)
                      ? "bg-red-500 text-white"
                      : "bg-white/80 text-slate-400 hover:text-red-500"
                      }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={estaFavoritado(produto.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                  {produto.foto ? (
                    <img
                      src={produto.foto}
                      alt={produto.nome}
                      className="w-full h-full object-contain p-3"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: corCategoria(produto.categoriaID) }}
                    />
                  )}
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                      {produto.tag}
                    </span>
                    {categoria && (
                      <span className="text-xs text-slate-400">{categoria.nome}</span>
                    )}
                  </div>

                  <Link
                    href={`/produto/${produto.id}`}
                    className="text-sm font-bold text-slate-800 leading-tight hover:text-cyan-500 transition-colors"
                  >
                    {produto.nome}
                  </Link>

                  <p className="text-lg font-bold text-cyan-500">
                    {formatarPreco(produto.preco)}
                  </p>

                  {vendedor && (
                    <div className="border-t border-slate-100 pt-2 mt-1 flex flex-col gap-1">
                      <p className="text-xs font-bold text-slate-700">{vendedor.nome}</p>
                      <p className="text-xs text-slate-400">
                        {vendedor.cidade} — {vendedor.estado}
                      </p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-yellow-400 font-semibold">
                          {estrelasAvaliacao(vendedor.avaliacao)} {vendedor.avaliacao}
                        </span>
                        <span className="text-xs text-slate-400">
                          {vendedor.totalVendas} vendas
                        </span>
                      </div>
                    </div>
                  )}

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
            );
          })}
        </div>
      )}
    </>
  );
}