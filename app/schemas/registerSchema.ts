import { z } from "zod";

export const Step01Schema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const Step02Schema = z.object({
  senha: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmar: z
    .string()
    .min(6, "A confirmação deve ter pelo menos 6 caracteres"),
});

export const Step02SchemaRefined = Step02Schema.refine(
  (data) => data.senha === data.confirmar,
  {
    message: "As senhas não coincidem",
    path: ["confirmar"],
  }
);

export const Step03Schema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
});

export const Step04Schema = z.object({
  cep: z
    .string()
    .min(8, "CEP inválido")
    .max(9, "CEP inválido"),
  rua: z.string().min(3, "Informe a rua"),
  numero: z.string().min(1, "Informe o número"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Informe o bairro"),
  cidade: z.string().min(2, "Informe a cidade"),
  estado: z.string().length(2, "Selecione o estado"),
});

export const ClienteRegistroSchema = Step01Schema.extend({
  ...Step02Schema.shape,
  ...Step03Schema.shape,
  ...Step04Schema.shape,
});

export type TStep01Schema = z.infer<typeof Step01Schema>;
export type TStep02Schema = z.infer<typeof Step02Schema>;
export type TStep03Schema = z.infer<typeof Step03Schema>;
export type TStep04Schema = z.infer<typeof Step04Schema>;
export type TClienteRegistroSchema = z.infer<typeof ClienteRegistroSchema>;

export type Step01Error = {
  email?: string
}; 

export type Step02Error = {
  senha?: string;
  confirmar?: string
};

export type Step03Error = {
  nome?: string
};

export type Step04Error = {
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
};