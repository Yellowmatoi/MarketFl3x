"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUTOS } from "../../dados/produtos";
import { VENDEDORES } from "../../dados/vendedores";
import { CATEGORIAS } from "../../dados/categorias";
import { IProduto } from "../../interfaces/produto";
import { useCarrinho } from "@/app/contexts/CarrinhoContexto";
import { useFavoritos } from "@/app/contexts/FavoritosContexto";
import { useAuth } from "@/app/contexts/AuthContexto";
import { useDrawer } from "../DrawerContexto";

function formatarPreco(preco: number) {
  return (preco / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

export function Cabecalho() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const { totalItens } = useCarrinho();
  const { totalFavoritos } = useFavoritos();
  const { usuario, isLogado, logout } = useAuth();
  const { abrirDrawer } = useDrawer();
  const router = useRouter();

  const resultados = useMemo(() => {
    if (!busca.trim()) return [];

    const termo = busca.toLowerCase();
    const categoriaFiltro = CATEGORIAS.find((c) => c.id === Number(categoria));

    return PRODUTOS.filter((p) => {
      const vendedor = VENDEDORES.find((v) => v.id === p.vendedorID);
      const cat = CATEGORIAS.find((c) => c.id === p.categoriaID);

      const passaCategoria = categoriaFiltro
        ? p.categoriaID === categoriaFiltro.id
        : true;

      return (
        passaCategoria &&
        (
          p.nome.toLowerCase().includes(termo) ||
          (cat?.nome ?? "").toLowerCase().includes(termo) ||
          p.tag.toLowerCase().includes(termo) ||
          (vendedor?.nome ?? "").toLowerCase().includes(termo)
        )
      );
    }).slice(0, 6);
  }, [busca, categoria]);

  function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (busca.trim()) {
      setBuscaAberta(false);
      setBusca("");
      router.push(`/?busca=${encodeURIComponent(busca)}`);
    }
  }

  function aoSair() {
    logout();
    setMenuAberto(false);
    router.push("/");
  }

  return (
    <header className="bg-white border-b-2 border-cyan-500 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-5">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-base">
            M
          </div>
          <span className="text-xl font-bold text-slate-800">
            mercadofl<span className="text-cyan-500">3</span>x
          </span>
        </Link>

        {/* Busca */}
        <div className="flex-1 relative">
          <form
            onSubmit={aoEnviar}
            className="flex border border-slate-200 rounded-lg overflow-hidden focus-within:border-cyan-500 transition-colors"
          >
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="h-10 px-3 bg-slate-50 border-r border-slate-200 text-sm text-slate-500 outline-none flex-shrink-0 cursor-pointer"
            >
              <option value="">Todas</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setBuscaAberta(true);
              }}
              onFocus={() => setBuscaAberta(true)}
              onBlur={() => setTimeout(() => setBuscaAberta(false), 200)}
              placeholder="Buscar produtos, categorias ou vendedores..."
              className="flex-1 h-10 px-4 text-sm text-slate-800 outline-none min-w-0"
            />

            {busca && (
              <button
                type="button"
                onClick={() => { setBusca(""); setBuscaAberta(false); }}
                className="h-10 px-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            )}

            <button
              type="submit"
              className="h-10 px-4 bg-cyan-500 hover:bg-cyan-600 transition-colors flex items-center flex-shrink-0"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>

          {/* Dropdown de resultados */}
          {buscaAberta && resultados.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {resultados.map((produto: IProduto) => {
                const vendedor = VENDEDORES.find((v) => v.id === produto.vendedorID);
                const cat = CATEGORIAS.find((c) => c.id === produto.categoriaID);

                return (
                  <Link
                    key={produto.id}
                    href={`/produto/${produto.id}`}
                    onClick={() => { setBusca(""); setBuscaAberta(false); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    {/* Miniatura */}
                    <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
                      style={{ background: corCategoria(produto.categoriaID) }}
                    >
                      {produto.foto && (
                        <img
                          src={produto.foto}
                          alt={produto.nome}
                          className="w-full h-full object-contain p-1"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {produto.nome}
                      </p>
                      <p className="text-xs text-slate-400">
                        {cat?.nome} • {vendedor?.nome}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-cyan-500 flex-shrink-0">
                      {formatarPreco(produto.preco)}
                    </p>
                  </Link>
                );
              })}

              {/* Ver todos */}
              <button
                onClick={aoEnviar}
                className="w-full px-4 py-2.5 text-xs font-semibold text-cyan-500 hover:bg-cyan-50 transition-colors text-center"
              >
                Ver todos os resultados para "{busca}"
              </button>
            </div>
          )}

          {/* Sem resultados */}
          {buscaAberta && busca.trim() && resultados.length === 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 px-4 py-4 text-center">
              <p className="text-sm text-slate-400">
                Nenhum produto encontrado para "{busca}"
              </p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1 flex-shrink-0">

          <button
            onClick={() => abrirDrawer("favoritos")}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-cyan-500 transition-all min-w-[52px] relative"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {totalFavoritos > 0 && (
              <span className="absolute top-0.5 right-1.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalFavoritos}
              </span>
            )}
            <span className="text-xs font-semibold">Favoritos</span>
          </button>

          <button
            onClick={() => abrirDrawer("carrinho")}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-cyan-500 transition-all min-w-[52px] relative"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {totalItens > 0 && (
              <span className="absolute top-0.5 right-1.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalItens}
              </span>
            )}
            <span className="text-xs font-semibold">Carrinho</span>
          </button>

          {isLogado && usuario ? (
            <div className="relative ml-2">
              <button
                onClick={() => setMenuAberto((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {usuario.avatar}
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {usuario.nome.split(" ")[0]}
                </span>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {menuAberto && (
                <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-xl shadow-lg w-48 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800">{usuario.nome}</p>
                    <p className="text-xs text-slate-400">{usuario.email}</p>
                  </div>
                  <Link
                    href="/perfil"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-cyan-500 transition-colors"
                  >
                    Meu perfil
                  </Link>
                  <button
                    onClick={aoSair}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 h-10 px-5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded-lg flex items-center transition-colors"
            >
              Entrar
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}