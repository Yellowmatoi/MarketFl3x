"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { IItemCarrinho, ICarrinhoContexto } from "../interfaces/carrinho";
import { IProduto } from "../interfaces/produto";

const CarrinhoContexto = createContext<ICarrinhoContexto | null>(null);

export function CarrinhoProvider({ children }: { readonly children: ReactNode }) {
  const [itens, setItens] = useState<IItemCarrinho[]>([]);

  function adicionarItem(produto: IProduto) {
    setItens((anterior: IItemCarrinho[]) => {
      const itemExistente = anterior.find((item) => item.id === produto.id);

      if (itemExistente) {
        return anterior.map((item): IItemCarrinho =>
          item.id === produto.id
            ? { id: item.id, produto: item.produto, quantidade: item.quantidade + 1 }
            : item
        );
      }

      const novoItem: IItemCarrinho = {
        id: produto.id,
        produto,
        quantidade: 1,
      };

      return [...anterior, novoItem];
    });
  }

  function removerItem(id: number) {
    setItens((anterior: IItemCarrinho[]) =>
      anterior.filter((item) => item.id !== id)
    );
  }

  function aumentarQuantidade(id: number) {
    setItens((anterior: IItemCarrinho[]) =>
      anterior.map((item): IItemCarrinho =>
        item.id === id
          ? { id: item.id, produto: item.produto, quantidade: item.quantidade + 1 }
          : item
      )
    );
  }

  function diminuirQuantidade(id: number) {
    setItens((anterior: IItemCarrinho[]) =>
      anterior
        .map((item): IItemCarrinho =>
          item.id === id
            ? { id: item.id, produto: item.produto, quantidade: item.quantidade - 1 }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  function limparCarrinho() {
    setItens([]);
  }

  const totalItens = itens.reduce((soma, item) => soma + item.quantidade, 0);

  const totalPreco = (
    itens.reduce((soma, item) => soma + item.produto.preco * item.quantidade, 0) / 100
  ).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <CarrinhoContexto.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        aumentarQuantidade,
        diminuirQuantidade,
        limparCarrinho,
        totalItens,
        totalPreco,
      }}
    >
      {children}
    </CarrinhoContexto.Provider>
  );
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContexto);
  if (!contexto) throw new Error("useCarrinho deve ser usado dentro do CarrinhoProvider");
  return contexto;
}