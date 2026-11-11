export interface IUsuarioMock {
  readonly id: number;
  nome: string;
  email: string;
  senha: string;
  avatar: string;
}

export interface IUsuarioLogado {
  readonly id: number;
  nome: string;
  email: string;
  avatar: string;
}

export interface IClienteRegistro {
  email: string;
  senha: string;
  nome: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}