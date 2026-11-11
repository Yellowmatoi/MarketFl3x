import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type TLoginSchema = z.infer<typeof LoginSchema>;

export type LoginSchemaError = {
  email?: string;
  senha?: string;
};