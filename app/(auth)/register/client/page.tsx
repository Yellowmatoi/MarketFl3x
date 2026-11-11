"use client";

import { useState, useEffect, useActionState, Dispatch, SetStateAction, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {  Step01Schema, Step02Schema, Step03Schema, Step04Schema, Step01Error, Step02Error,Step03Error, Step04Error, Step02SchemaRefined } from "../../../schemas/registerSchema";
import { CampoFormulario } from "@/app/components/auth/CampoFormulario";
import { useAuth } from "@/app/contexts/AuthContexto";

type TClienteRegistro = {
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
};

enum EStep {
  STEP01 = 0,
  STEP02 = 1,
  STEP03 = 2,
  STEP04 = 3,
}

type FormState<T> = {
  success: boolean;
  message?: string;
  errors?: Partial<T>;
};

const TITULOS = {
  [EStep.STEP01]: { titulo: "Criar conta",    subtitulo: "Qual é o seu e-mail?"    },
  [EStep.STEP02]: { titulo: "Crie uma senha", subtitulo: "Escolha uma senha segura" },
  [EStep.STEP03]: { titulo: "Quase lá!",      subtitulo: "Como podemos te chamar?"  },
  [EStep.STEP04]: { titulo: "Seu endereço",   subtitulo: "Onde você recebe suas encomendas?" },
};

async function validarEmail(
  _state: FormState<Step01Error>,
  formData: FormData
): Promise<FormState<Step01Error>> {
  const dados = { email: formData.get("email") as string };

  const resultado = Step01Schema.safeParse(dados);

  if (!resultado.success) {
    const erros = resultado.error.flatten().fieldErrors;
    return {
      success: false,
      errors: { email: erros.email?.[0] },
    };
  }

  try {
    const res = await fetch(
      `http://localhost:3001/usuarios?email=${resultado.data.email}` 
    );
    const usuarios = await res.json();

    const emailJaCadastrado = usuarios.find(
      (u: { email: string }) => u.email === resultado.data.email
    );

    if (emailJaCadastrado) {
      return { success: false, errors: { email: "Este e-mail já está cadastrado" } };
    }

    return { success: true };
  } catch {
    return { success: false, message: "Erro ao conectar com o servidor" };
  }
}

async function validarSenha(
  _state: FormState<Step02Error>,
  formData: FormData
): Promise<FormState<Step02Error>> {
  const dados = {
    senha:     formData.get("senha")     as string,
    confirmar: formData.get("confirmar") as string,
  };

  const resultado = Step02SchemaRefined.safeParse(dados);

  if (!resultado.success) {
    const erros = resultado.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        senha:     erros.senha?.[0],
        confirmar: erros.confirmar?.[0],
      },
    };
  }

  return { success: true };
}

async function validarNome(
  _state: FormState<Step03Error>,
  formData: FormData
): Promise<FormState<Step03Error>> {
  const dados = { nome: formData.get("nome") as string };

  const resultado = Step03Schema.safeParse(dados);

  if (!resultado.success) {
    const erros = resultado.error.flatten().fieldErrors;
    return {
      success: false,
      errors: { nome: erros.nome?.[0] },
    };
  }

  return { success: true };
}

async function validarEndereco(
  _state: FormState<Step04Error>,
  formData: FormData
): Promise<FormState<Step04Error>> {
  const dados = {
    cep: formData.get("cep") as string,
    rua: formData.get("rua") as string,
    numero: formData.get("numero") as string,
    complemento: formData.get("complemento") as string,
    bairro: formData.get("bairro") as string,
    cidade: formData.get("cidade") as string,
    estado: formData.get("estado") as string,
  };

  const resultado = Step04Schema.safeParse(dados);

  if (!resultado.success) {
    const erros = resultado.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        cep: erros.cep?.[0],
        rua: erros.rua?.[0],
        numero: erros.numero?.[0],
        bairro: erros.bairro?.[0],
        cidade: erros.cidade?.[0],
        estado: erros.estado?.[0],
      },
    };
  }

  return { success: true };
}

interface IProps {
  cliente: Partial<TClienteRegistro>;
  setCliente: Dispatch<SetStateAction<Partial<TClienteRegistro>>>;
  setStep: Dispatch<SetStateAction<EStep>>;
}

// ── STEP 01 — EMAIL ───────────────────────────────────────
const initialStateStep01: FormState<Step01Error> = { success: false };

function Step01({ cliente, setCliente, setStep }: IProps) {
  const [state, formAction, isPending] = useActionState(validarEmail, initialStateStep01);
  const [email, setEmail] = useState<string>(cliente?.email ?? "");
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);

  useEffect(() => {
    if (!state.success && email !== "") {
      let texto = "Ocorreu um erro desconhecido";

      if (state.errors?.email) {
        texto = state.errors.email;
      } else if (state.message) {
        texto = state.message;
      } else {
        return;
      }

      setMensagem({ tipo: "erro", texto });
    } else if (state.success) {
      setMensagem({ tipo: "sucesso", texto: "E-mail verificado com sucesso!" });
      setTimeout(() => {
        setCliente((prev) => ({ ...prev, email }));
        setStep(EStep.STEP02);
      }, 600);
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4 mt-2">
      <CampoFormulario
        rotulo="E-mail"
        tipo="email"
        placeholder="Ex: joao.silva@seudominio.com"
        valor={email}
        aoMudar={(v) => { setEmail(v); setMensagem(null); }}
        nome="email"
      />

      {mensagem && (
        <div className={`border rounded-lg px-3 py-2 ${
          mensagem.tipo === "erro" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
        }`}>
          <p className={`text-xs font-semibold ${
            mensagem.tipo === "erro" ? "text-red-500" : "text-green-600"
          }`}>
            {mensagem.tipo === "sucesso" ? "✓ " : "✕ "}{mensagem.texto}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-11 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
      >
        {isPending ? "Verificando..." : "Avançar →"}
      </button>
    </form>
  );
}

// ── STEP 02 — SENHA ───────────────────────────────────────
const initialStateStep02: FormState<Step02Error> = { success: false };

function Step02({ cliente, setCliente, setStep }: IProps) {
  const [state, formAction, isPending] = useActionState(validarSenha, initialStateStep02);
  const [senha, setSenha] = useState<string>(cliente?.senha ?? "");
  const [confirmar, setConfirmar] = useState<string>("");
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);

  useEffect(() => {
    if (!state.success && senha !== "") {
      let texto = "Ocorreu um erro desconhecido";

      if (state.errors?.senha) {
        texto = state.errors.senha;
      } else if (state.errors?.confirmar) {
        texto = state.errors.confirmar;
      } else if (state.message) {
        texto = state.message;
      } else {
        return;
      }

      setMensagem({ tipo: "erro", texto });
    } else if (state.success) {
      setMensagem({ tipo: "sucesso", texto: "Senha criada com sucesso!" });
      setTimeout(() => {
        setCliente((prev) => ({ ...prev, senha }));
        setStep(EStep.STEP03);
      }, 600);
    }
  }, [state]);

  function forcaSenha() {
    if (senha.length === 0) return null;
    if (senha.length < 6)  return { label: "Fraca", cor: "#ef4444", largura: "33%"  };
    if (senha.length < 10) return { label: "Média", cor: "#f97316", largura: "66%"  };
    return                        { label: "Forte", cor: "#22c55e", largura: "100%" };
  }

  const forca = forcaSenha();

  return (
    <form action={formAction} className="flex flex-col gap-4 mt-2">
      <CampoFormulario
        rotulo="Senha"
        tipo="password"
        placeholder="Mínimo 6 caracteres"
        valor={senha}
        aoMudar={(v) => { setSenha(v); setMensagem(null); }}
        nome="senha"
      />

      {forca && (
        <div className="flex flex-col gap-1 -mt-2">
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: forca.largura, background: forca.cor }}
            />
          </div>
          <p className="text-xs font-semibold" style={{ color: forca.cor }}>
            Senha {forca.label}
          </p>
        </div>
      )}

      <CampoFormulario
        rotulo="Confirmar senha"
        tipo="password"
        placeholder="Repita a senha"
        valor={confirmar}
        aoMudar={(v) => { setConfirmar(v); setMensagem(null); }}
        nome="confirmar"
      />

      {mensagem && (
        <div className={`border rounded-lg px-3 py-2 ${
          mensagem.tipo === "erro" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
        }`}>
          <p className={`text-xs font-semibold ${
            mensagem.tipo === "erro" ? "text-red-500" : "text-green-600"
          }`}>
            {mensagem.tipo === "sucesso" ? "✓ " : "✕ "}{mensagem.texto}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(EStep.STEP01)}
          className="h-11 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors"
        >
          ← Voltar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-11 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
        >
          {isPending ? "Verificando..." : "Avançar →"}
        </button>
      </div>
    </form>
  );
}

// ── STEP 03 — NOME ────────────────────────────────────────
const initialStateStep03: FormState<Step03Error> = { success: false };

function Step03({ cliente, setCliente, setStep }: IProps) {
  const [state, formAction, isPending] = useActionState(validarNome, initialStateStep03);
  const [nome, setNome] = useState<string>(cliente?.nome ?? "");
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);

  useEffect(() => {
    if (!state.success && nome !== "") {
      let texto = "Ocorreu um erro desconhecido";

      if (state.errors?.nome) {
        texto = state.errors.nome;
      } else if (state.message) {
        texto = state.message;
      } else {
        return;
      }

      setMensagem({ tipo: "erro", texto });
    } else if (state.success) {
      setMensagem({ tipo: "sucesso", texto: "Nome salvo!" });
      setTimeout(() => {
        setCliente((prev) => ({ ...prev, nome: nome.trim() }));
        setStep(EStep.STEP04);
      }, 600);
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4 mt-2">
      <CampoFormulario
        rotulo="Nome completo"
        tipo="text"
        placeholder="Seu nome completo"
        valor={nome}
        aoMudar={(v) => { setNome(v); setMensagem(null); }}
        nome="nome"
      />

      {mensagem && (
        <div className={`border rounded-lg px-3 py-2 ${
          mensagem.tipo === "erro" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
        }`}>
          <p className={`text-xs font-semibold ${
            mensagem.tipo === "erro" ? "text-red-500" : "text-green-600"
          }`}>
            {mensagem.tipo === "sucesso" ? "✓ " : "✕ "}{mensagem.texto}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(EStep.STEP02)}
          className="h-11 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors"
        >
          ← Voltar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-11 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
        >
          {isPending ? "Verificando..." : "Avançar →"}
        </button>
      </div>
    </form>
  );
}

// ── STEP 04 — ENDEREÇO ────────────────────────────────────
const initialStateStep04: FormState<Step04Error> = { success: false };

function Step04({ cliente, setCliente, setStep }: IProps) {
  const [state, formAction, isPending] = useActionState(validarEndereco, initialStateStep04);
  const [cep, setCep] = useState<string>(cliente?.cep ?? "");
  const [rua, setRua] = useState<string>(cliente?.rua ?? "");
  const [numero, setNumero] = useState<string>(cliente?.numero ?? "");
  const [complemento, setComplemento] = useState<string>(cliente?.complemento ?? "");
  const [bairro, setBairro] = useState<string>(cliente?.bairro ?? "");
  const [cidade, setCidade] = useState<string>(cliente?.cidade ?? "");
  const [estado, setEstado] = useState<string>(cliente?.estado ?? "");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepErro, setCepErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { definirSessao } = useAuth();

  function formatarCep(valor: string) {
    const digitos = valor.replace(/\D/g, "").slice(0, 8);
    if (digitos.length > 5) return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
    return digitos;
  }

  function gerarAvatar(nome: string) {
    const partes = nome.trim().split(" ");
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return partes[0].slice(0, 2).toUpperCase();
  }

  // ── Busca automática via ViaCEP ──────────────────────────
  useEffect(() => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setCepErro(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setBuscandoCep(true);
      setCepErro(null);

      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const dados = await res.json();

        if (dados.erro) {
          setCepErro("CEP não encontrado");
          return;
        }

        setRua(dados.logradouro || "");
        setBairro(dados.bairro || "");
        setCidade(dados.localidade || "");
        setEstado(dados.uf || "");
      } catch {
        setCepErro("Erro ao buscar o CEP");
      } finally {
        setBuscandoCep(false);
      }
    }, 500); // debounce

    return () => clearTimeout(timeout);
  }, [cep]);

  useEffect(() => {
    if (!state.success && cep !== "") {
      let texto = "Ocorreu um erro desconhecido";

      if (state.errors?.cep) texto = state.errors.cep;
      else if (state.errors?.rua) texto = state.errors.rua;
      else if (state.errors?.numero) texto = state.errors.numero;
      else if (state.errors?.bairro) texto = state.errors.bairro;
      else if (state.errors?.cidade) texto = state.errors.cidade;
      else if (state.errors?.estado) texto = state.errors.estado;
      else if (state.message) texto = state.message;
      else return;

      setMensagem({ tipo: "erro", texto });
    } else if (state.success && !salvando) {
      setSalvando(true);

      const novoUsuario = {
        nome: cliente.nome,
        email: cliente.email,
        senha: cliente.senha,
        avatar: gerarAvatar(cliente.nome ?? ""),
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
      };

      fetch("http://localhost:3001/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Erro ao criar conta");

          const usuarioCriado = await res.json();
          setCliente((prev) => ({ ...prev, cep, rua, numero, complemento, bairro, cidade, estado }));

          // Loga direto com os dados retornados pela criação da conta —
          // evita uma segunda consulta que poderia falhar por timing.
          definirSessao({
            id: usuarioCriado.id,
            nome: usuarioCriado.nome,
            email: usuarioCriado.email,
            avatar: usuarioCriado.avatar,
          });

          setMensagem({ tipo: "sucesso", texto: "Conta criada! Redirecionando..." });
          setTimeout(() => router.push(redirect), 1000);
        })
        .catch(() => {
          setMensagem({ tipo: "erro", texto: "Erro ao criar conta. Tente novamente." });
          setSalvando(false);
        });
    }
  }, [state]);

  const enderecoCompleto = rua && bairro && cidade && estado && numero;

  return (
    <form action={formAction} className="flex flex-col gap-4 mt-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-600">CEP</label>
        <div className="relative">
          <input
            type="text"
            name="cep"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => { setCep(formatarCep(e.target.value)); setMensagem(null); }}
            className="h-11 px-3 w-full border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 focus:bg-white transition-all"
          />
          {buscandoCep && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Buscando...</span>
          )}
        </div>
        {cepErro && <p className="text-xs text-red-500 font-medium">{cepErro}</p>}
      </div>

      <CampoFormulario rotulo="Rua" tipo="text" placeholder="Nome da rua" valor={rua}
        aoMudar={(v) => { setRua(v); setMensagem(null); }} nome="rua" />

      <div className="flex gap-3">
        <CampoFormulario rotulo="Número" tipo="text" placeholder="123" valor={numero}
          aoMudar={(v) => { setNumero(v); setMensagem(null); }} nome="numero" />
        <CampoFormulario rotulo="Complemento" tipo="text" placeholder="Apto, bloco... (opcional)" valor={complemento}
          aoMudar={(v) => { setComplemento(v); setMensagem(null); }} nome="complemento" />
      </div>

      <CampoFormulario rotulo="Bairro" tipo="text" placeholder="Seu bairro" valor={bairro}
        aoMudar={(v) => { setBairro(v); setMensagem(null); }} nome="bairro" />

      <div className="flex gap-3">
        <CampoFormulario rotulo="Cidade" tipo="text" placeholder="Sua cidade" valor={cidade}
          aoMudar={(v) => { setCidade(v); setMensagem(null); }} nome="cidade" />
        <div className="flex flex-col gap-1.5 w-24">
          <label className="text-sm font-semibold text-slate-600">Estado</label>
          <select
            name="estado"
            value={estado}
            onChange={(e) => { setEstado(e.target.value); setMensagem(null); }}
            className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 focus:bg-white transition-all"
          >
            <option value="">UF</option>
            {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>

      {enderecoCompleto && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-1.5">
          <p className="text-xs font-bold text-slate-600 mb-1">Confira seus dados</p>
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Nome:</span> {cliente.nome}
          </p>
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">E-mail:</span> {cliente.email}
          </p>
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Endereço:</span> {rua}, {numero}
            {complemento ? ` - ${complemento}` : ""}, {bairro} — {cidade}/{estado}, {cep}
          </p>
        </div>
      )}

      {mensagem && (
        <div className={`border rounded-lg px-3 py-2 ${
          mensagem.tipo === "erro" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
        }`}>
          <p className={`text-xs font-semibold ${
            mensagem.tipo === "erro" ? "text-red-500" : "text-green-600"
          }`}>
            {mensagem.tipo === "sucesso" ? "✓ " : "✕ "}{mensagem.texto}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(EStep.STEP03)}
          className="h-11 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors"
        >
          ← Voltar
        </button>
        <button
          type="submit"
          disabled={isPending || salvando}
          className="flex-1 h-11 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
        >
          {isPending || salvando ? "Criando conta..." : "Criar conta"}
        </button>
      </div>
    </form>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────
function FormularioCadastro() {
  const [step, setStep] = useState<EStep>(EStep.STEP01);
  const [cliente, setCliente] = useState<Partial<TClienteRegistro>>({});
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/";

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

        <div className="flex items-center gap-2 mb-6">
          {[EStep.STEP01, EStep.STEP02, EStep.STEP03, EStep.STEP04].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-all ${
                s <= step ? "bg-cyan-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
          {TITULOS[step].titulo}
        </h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          {TITULOS[step].subtitulo}
        </p>

        {step === EStep.STEP01 && (
          <Step01 cliente={cliente} setCliente={setCliente} setStep={setStep} />
        )}
        {step === EStep.STEP02 && (
          <Step02 cliente={cliente} setCliente={setCliente} setStep={setStep} />
        )}
        {step === EStep.STEP03 && (
          <Step03 cliente={cliente} setCliente={setCliente} setStep={setStep} />
        )}
        {step === EStep.STEP04 && (
          <Step04 cliente={cliente} setCliente={setCliente} setStep={setStep} />
        )}

        <p className="text-sm text-slate-500 text-center mt-5">
          Já tem conta?{" "}
          <Link
            href={`/login${redirectParam !== "/" ? `?redirect=${encodeURIComponent(redirectParam)}` : ""}`}
            className="text-cyan-600 font-bold hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function PaginaCadastro() {
  return (
    <Suspense fallback={null}>
      <FormularioCadastro />
    </Suspense>
  );
}