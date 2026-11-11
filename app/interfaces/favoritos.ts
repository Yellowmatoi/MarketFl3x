import { IProduto } from "./produto";

export interface IFavoritosContexto {
  favoritos: IProduto[];
  alternarFavorito: (produto: IProduto) => void;
  estaFavoritado: (id: number) => boolean;
  removerFavorito: (id: number) => void;
  totalFavoritos: number;
}