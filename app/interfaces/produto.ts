export interface IVendedor {
  readonly id: number;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  avaliacao: number;
  totalVendas: number;
  membro: string;
}

export interface ICategoria {
  readonly id: number;
  nome: string;
  path: string;
}

export interface IProduto {
  readonly id: number;
  foto?: string;
  categoriaID: number;
  nome: string;
  descricao: string;
  vendedorID: number;
  preco: number;
  tag: string;
}