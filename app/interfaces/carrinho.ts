import { IProduto } from "./produto";

export interface IItemCarrinho {
  readonly id: number;
  produto: IProduto;
  quantidade: number;
}

export interface ICarrinhoContexto {
  itens: IItemCarrinho[];
  adicionarItem: (produto: IProduto) => void;
  removerItem: (id: number) => void;
  aumentarQuantidade: (id: number) => void;
  diminuirQuantidade: (id: number) => void;
  limparCarrinho: () => void;
  totalItens: number;
  totalPreco: string;
}