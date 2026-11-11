interface IDadosEndereco {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface IDadosPagamento {
  numero: string;
  nome: string;
  validade: string;
  parcelas: number;
}