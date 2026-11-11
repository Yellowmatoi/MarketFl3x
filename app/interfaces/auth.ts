export interface DadosLogin {
  email: string;
  senha: string;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
}

export interface PropsCampoFormulario {
  rotulo: string;
  tipo: string;
  placeholder: string;
  valor: string;
  aoMudar: (valor: string) => void;
  nome?: string;
}