export function validarEmail(email: string): string {
  if (!email) return "E-mail é obrigatório";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido";
  return "";
}

export function validarSenha(senha: string): string {
  if (!senha) return "Senha é obrigatória";
  if (senha.length < 6) return "Mínimo 6 caracteres";
  return "";
}

export function validarNome(nome: string): string {
  if (!nome) return "Nome é obrigatório";
  if (nome.trim().length < 2) return "Nome muito curto";
  return "";
}

