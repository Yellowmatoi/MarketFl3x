"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IProduto } from "../interfaces/produto";
import { IFavoritosContexto } from "../interfaces/favoritos";

const CHAVE_STORAGE = "mercadofl3x:favoritos";

const FavoritosContexto = createContext<IFavoritosContexto | null>(null);

export function FavoritosProvider({ children }: { readonly children: ReactNode }) {
  const [favoritos, setFavoritos] = useState<IProduto[]>([]);
  const [carregado, setCarregado] = useState(false);

  // Carrega os favoritos salvos ao montar
  useEffect(() => {
    try {
      const salvos = localStorage.getItem(CHAVE_STORAGE);
      if (salvos) setFavoritos(JSON.parse(salvos));
    } catch {
      // localStorage indisponível (ex: SSR) — ignora
    } finally {
      setCarregado(true);
    }
  }, []);

  // Persiste sempre que a lista mudar
  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(favoritos));
    } catch {
      // ignora falha de storage
    }
  }, [favoritos, carregado]);

  function estaFavoritado(id: number) {
    return favoritos.some((produto) => produto.id === id);
  }

  function alternarFavorito(produto: IProduto) {
    setFavoritos((anterior) =>
      anterior.some((p) => p.id === produto.id)
        ? anterior.filter((p) => p.id !== produto.id)
        : [...anterior, produto]
    );
  }

  function removerFavorito(id: number) {
    setFavoritos((anterior) => anterior.filter((p) => p.id !== id));
  }

  const totalFavoritos = favoritos.length;

  return (
    <FavoritosContexto.Provider
      value={{ favoritos, alternarFavorito, estaFavoritado, removerFavorito, totalFavoritos }}
    >
      {children}
    </FavoritosContexto.Provider>
  );
}

export function useFavoritos() {
  const contexto = useContext(FavoritosContexto);
  if (!contexto) throw new Error("useFavoritos deve ser usado dentro do FavoritosProvider");
  return contexto;
}
