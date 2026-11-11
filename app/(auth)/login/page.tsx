"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContexto";
import { CampoFormulario } from "@/app/components/auth/CampoFormulario";

function FormularioLogin() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [formulario, setFormulario] = useState({ email: "", senha: "" });
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);

    if (!formulario.email || !formulario.senha) {
      setMensagem({ tipo: "erro", texto: "Preencha todos os campos." });
      return;
    }

    setCarregando(true);

    try {
      const sucesso = await login(formulario.email, formulario.senha);

      if (sucesso) {
        setMensagem({ tipo: "sucesso", texto: "Login realizado com sucesso! Redirecionando..." });
        setTimeout(() => router.push(redirect), 800);
      } else {
        setMensagem({ tipo: "erro", texto: "E-mail ou senha inválidos." });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao conectar com o servidor." });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-10 w-full max-w-sm shadow-sm">

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 bg-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-base">
            M
          </div>
          <span className="text-xl font-bold text-slate-800">
            mercadofl<span className="text-cyan-500">3</span>x
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">Entrar</h2>
        <p className="text-sm text-slate-500 text-center mb-1">Bem-vindo de volta!</p>
        {redirect === "/checkout" && (
          <p className="text-xs text-cyan-600 bg-cyan-50 border border-cyan-100 rounded-lg px-3 py-2 text-center mb-6 mt-4">
            Entre na sua conta para finalizar a compra
          </p>
        )}
        {redirect !== "/checkout" && <div className="mb-7" />}

        <form onSubmit={aoEnviar} className="flex flex-col gap-4">
          <CampoFormulario
            rotulo="E-mail"
            tipo="email"
            placeholder="seu@email.com"
            valor={formulario.email}
            aoMudar={(v) => { setFormulario({ ...formulario, email: v }); setMensagem(null); }}
          />

          <CampoFormulario
            rotulo="Senha"
            tipo="password"
            placeholder="••••••••"
            valor={formulario.senha}
            aoMudar={(v) => { setFormulario({ ...formulario, senha: v }); setMensagem(null); }}
          />

          {mensagem && (
            <div className={`border rounded-lg px-3 py-2 ${
              mensagem.tipo === "erro"
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}>
              <p className={`text-xs font-semibold ${
                mensagem.tipo === "erro" ? "text-red-500" : "text-green-600"
              }`}>
                {mensagem.tipo === "sucesso" ? "✓ " : "✕ "}
                {mensagem.texto}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="h-11 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors mt-1"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-5">
          Não tem conta?{" "}
          <Link
            href={`/register/client${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-cyan-600 font-bold hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function PaginaLogin() {
  return (
    <Suspense fallback={null}>
      <FormularioLogin />
    </Suspense>
  );
}