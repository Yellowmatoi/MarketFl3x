"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaCircleCheck } from "react-icons/fa6";
import { useCarrinho } from "../contexts/CarrinhoContexto";
import { useAuth } from "../contexts/AuthContexto";
import { PassosCheckout } from "../components/checkout/PassosCheckout";
import { VENDEDORES } from "../dados/vendedores";

enum EStep {
  CART = 0,
  ADDRESS = 1,
  PAYMENT = 2,
  OVERVIEW = 3,
  STATUS = 4,
}

function formatarPreco(preco: number) {
  return (preco / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function corCategoria(categoriaID: number) {
  const cores: Record<number, string> = {
    1: "#e0f2fe",
    2: "#fce7f3",
    3: "#ede9fe",
    4: "#fef9c3",
    5: "#dcfce7",
  };
  return cores[categoriaID] ?? "#f1f5f9";
}

// ── ETAPA 1: CARRINHO ────────────────────────────────────
function EtapaCarrinho({ onNext }: { onNext: () => void }) {
  const { itens, removerItem, aumentarQuantidade, diminuirQuantidade, totalItens, totalPreco } = useCarrinho();

  if (itens.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center gap-4 text-center">
        <p className="text-lg font-semibold text-slate-500">Seu carrinho está vazio</p>
        <Link
          href="/"
          className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {itens.map((item) => {
          const vendedor = VENDEDORES.find((v) => v.id === item.produto.vendedorID);

          return (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">

              <div className="w-16 h-16 rounded-lg flex-shrink-0 relative overflow-hidden bg-slate-100">
                {item.produto.foto ? (
                  <Image
                    src={item.produto.foto}
                    alt={item.produto.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: corCategoria(item.produto.categoriaID) }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{item.produto.nome}</p>
                <p className="text-xs text-slate-400">{vendedor?.nome}</p>
                <p className="text-base font-bold text-cyan-500 mt-1">
                  {formatarPreco(item.produto.preco)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => diminuirQuantidade(item.id)}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-600 flex items-center justify-center transition-colors"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-bold text-slate-800">
                  {item.quantidade}
                </span>
                <button
                  onClick={() => aumentarQuantidade(item.id)}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-600 flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removerItem(item.id)}
                className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-400 rounded-lg flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Itens</span>
          <span>{totalItens}</span>
        </div>
        <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-3">
          <span>Total</span>
          <span className="text-cyan-500 text-lg">{totalPreco}</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors"
      >
        Continuar para Endereço →
      </button>
    </div>
  );
}

// ── ETAPA 2: ENDEREÇO ────────────────────────────────────
function EtapaEndereco({ dadosIniciais, onNext, onBack, modoEdicao }: { 
  dadosIniciais: IDadosEndereco;
  onNext: (dados: IDadosEndereco) => void; 
  onBack: () => void; 
  modoEdicao?: boolean;
}) {
  const [form, setForm] = useState<IDadosEndereco>(dadosIniciais);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepErro, setCepErro] = useState<string | null>(null);

  function setField(campo: keyof IDadosEndereco, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function formatarCep(valor: string) {
    const digitos = valor.replace(/\D/g, "").slice(0, 8);
    if (digitos.length > 5) return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
    return digitos;
  }

  // ── Busca automática via ViaCEP ──────────────────────────
  useEffect(() => {
    const cepLimpo = form.cep.replace(/\D/g, "");

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

        setForm((prev) => ({
          ...prev,
          rua: dados.logradouro || prev.rua,
          bairro: dados.bairro || prev.bairro,
          cidade: dados.localidade || prev.cidade,
          estado: dados.uf || prev.estado,
        }));
      } catch {
        setCepErro("Erro ao buscar o CEP");
      } finally {
        setBuscandoCep(false);
      }
    }, 500); // debounce

    return () => clearTimeout(timeout);
  }, [form.cep]);

  function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    onNext(form);
  }

  return (
    <form onSubmit={aoEnviar} className="flex flex-col gap-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Endereço de entrega</h2>
          {modoEdicao && (
            <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
              Editando
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CEP</label>
          <div className="relative">
            <input type="text" placeholder="00000-000" value={form.cep}
              onChange={(e) => setField("cep", formatarCep(e.target.value))}
              className="h-11 px-3 w-full border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all" required />
            {buscandoCep && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Buscando...</span>
            )}
          </div>
          {cepErro && <p className="text-xs text-red-500 font-medium">{cepErro}</p>}
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rua</label>
            <input type="text" placeholder="Nome da rua" value={form.rua}
              onChange={(e) => setField("rua", e.target.value)}
              className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all" required />
          </div>
          <div className="flex flex-col gap-1.5 w-24">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Número</label>
            <input type="text" placeholder="Nº" value={form.numero}
              onChange={(e) => setField("numero", e.target.value)}
              className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all" required />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Complemento</label>
          <input type="text" placeholder="Apto, bloco... (opcional)" value={form.complemento}
            onChange={(e) => setField("complemento", e.target.value)}
            className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bairro</label>
          <input type="text" placeholder="Bairro" value={form.bairro}
            onChange={(e) => setField("bairro", e.target.value)}
            className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all" required />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cidade</label>
            <input type="text" placeholder="Cidade" value={form.cidade}
              onChange={(e) => setField("cidade", e.target.value)}
              className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all" required />
          </div>
          <div className="flex flex-col gap-1.5 w-24">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</label>
            <select value={form.estado} onChange={(e) => setField("estado", e.target.value)}
              className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all bg-white" required>
              <option value="">UF</option>
              {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="h-12 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">
          ← Voltar
        </button>
        <button type="submit" className="flex-1 h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors">
          {modoEdicao ? "Salvar e voltar à revisão" : "Continuar para Pagamento →"}
        </button>
      </div>
    </form>
  );
}

// ── ETAPA 3: PAGAMENTO ───────────────────────────────────
function EtapaPagamento({ onNext, onBack, onSalvarPagamento, modoEdicao }: {
  onNext: () => void;
  onBack: () => void;
  onSalvarPagamento: (dados: IDadosPagamento) => void;
  modoEdicao?: boolean;
}) {
  const { itens } = useCarrinho();
  const [parcelas, setParcelas] = useState(1);
  const [form, setForm] = useState({ numero: "", nome: "", validade: "", cvv: "" });
  const [erros, setErros] = useState({ numero: "", nome: "", validade: "", cvv: "" });

  const totalBruto = itens.reduce(
    (soma, item) => soma + item.produto.preco * item.quantidade, 0
  );

  const juros: Record<number, number> = {
    1: 0, 2: 0, 4: 0, 6: 2.99, 8: 3.99, 10: 4.99, 12: 5.99,
  };

  function calcularParcela(numParcelas: number) {
    const taxaJuros = juros[numParcelas] / 100;
    const total = totalBruto * (1 + taxaJuros);
    return {
      valorParcela: total / numParcelas,
      totalFinal: total,
      temJuros: taxaJuros > 0,
    };
  }

  function formatarValor(centavos: number) {
    return (centavos / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarNumeroCartao(valor: string) {
    return valor.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatarValidade(valor: string) {
    return valor.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2");
  }

  function validar(): boolean {
    const novosErros = { numero: "", nome: "", validade: "", cvv: "" };
    let valido = true;

    if (form.numero.replace(/\s/g, "").length < 16) {
      novosErros.numero = "Número inválido";
      valido = false;
    }
    if (form.nome.trim().length < 3) {
      novosErros.nome = "Nome inválido";
      valido = false;
    }
    if (form.validade.length < 5) {
      novosErros.validade = "Validade inválida";
      valido = false;
    }
    if (form.cvv.length < 3) {
      novosErros.cvv = "CVV inválido";
      valido = false;
    }

    setErros(novosErros);
    return valido;
  }

  function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    onSalvarPagamento({ numero: form.numero, nome: form.nome, validade: form.validade, parcelas });
    onNext();
  }

  const parcelaAtual = calcularParcela(parcelas);

  return (
    <form onSubmit={aoEnviar} className="flex flex-col gap-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Dados do cartão</h2>
          {modoEdicao && (
            <span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">
              Editando
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">

          {/* Número */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Número do cartão
            </label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: formatarNumeroCartao(e.target.value) })}
              className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all font-mono"
              maxLength={19}
            />
            {erros.numero && <p className="text-xs text-red-500 font-medium">{erros.numero}</p>}
          </div>

          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Nome no cartão
            </label>
            <input
              type="text"
              placeholder="Como está no cartão"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value.toUpperCase() })}
              className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all uppercase"
            />
            {erros.nome && <p className="text-xs text-red-500 font-medium">{erros.nome}</p>}
          </div>

          {/* Validade + CVV */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Validade
              </label>
              <input
                type="text"
                placeholder="MM/AA"
                value={form.validade}
                onChange={(e) => setForm({ ...form, validade: formatarValidade(e.target.value) })}
                className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                maxLength={5}
              />
              {erros.validade && <p className="text-xs text-red-500 font-medium">{erros.validade}</p>}
            </div>
            <div className="flex flex-col gap-1.5 w-28">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                CVV
              </label>
              <input
                type="text"
                placeholder="000"
                value={form.cvv}
                onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all"
                maxLength={4}
              />
              {erros.cvv && <p className="text-xs text-red-500 font-medium">{erros.cvv}</p>}
            </div>
          </div>
        </div>

        {/* Parcelas — select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Parcelas
          </label>
          <select
            value={parcelas}
            onChange={(e) => setParcelas(Number(e.target.value))}
            className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all bg-white cursor-pointer"
          >
            {[1, 2, 4, 6, 8, 10, 12].map((num) => {
              const { valorParcela, totalFinal, temJuros } = calcularParcela(num);
              return (
                <option key={num} value={num}>
                  {num}x de {formatarValor(valorParcela)}
                  {temJuros
                    ? ` — Total: ${formatarValor(totalFinal)} (${juros[num]}% a.m.)`
                    : " — Sem juros"
                  }
                </option>
              );
            })}
          </select>

          {/* Resumo da parcela */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Você pagará</span>
              <span className="font-bold text-slate-800">
                {parcelas}x de {formatarValor(parcelaAtual.valorParcela)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-500">Total</span>
              <span className={`font-bold ${parcelaAtual.temJuros ? "text-red-500" : "text-green-500"}`}>
                {formatarValor(parcelaAtual.totalFinal)}
                {parcelaAtual.temJuros && ` (+${juros[parcelas]}% a.m.)`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
        >
          ← Voltar
        </button>
        <button
          type="submit"
          className="flex-1 h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors"
        >
          {modoEdicao ? "Salvar e voltar à revisão" : "Continuar para Revisão →"}
        </button>
      </div>
    </form>
  );
}

// ── ETAPA 4: REVISÃO ─────────────────────────────────────
function EtapaRevisao({ 
  onNext, 
  onBack,
  endereco,
  pagamento,
  onEditarEndereco,
  onEditarPagamento,
}: { 
  onNext: () => void; 
  onBack: () => void;
  endereco: IDadosEndereco;
  pagamento: IDadosPagamento;
  onEditarEndereco: () => void;
  onEditarPagamento: () => void;
}) {
  const { itens, totalItens, totalPreco } = useCarrinho();

  function formatarNumeroCartao(numero: string) {
    return numero.replace(/\d(?=\d{4})/g, "•");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold text-slate-800">Revisão do pedido</h2>

        {/* Produtos */}
        <div className="flex flex-col gap-3">
          {itens.map((item) => {
            const vendedor = VENDEDORES.find((v) => v.id === item.produto.vendedorID);
            return (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden bg-slate-100">
                  {item.produto.foto ? (
                    <img src={item.produto.foto} alt={item.produto.nome} className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="w-full h-full bg-slate-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.produto.nome}</p>
                  <p className="text-xs text-slate-400">{vendedor?.nome} · Qtd: {item.quantidade}</p>
                </div>
                <p className="text-sm font-bold text-cyan-500 flex-shrink-0">
                  {(item.produto.preco / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="flex flex-col gap-2 bg-slate-50 rounded-xl p-4">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Itens</span>
            <span>{totalItens}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>Frete</span>
            <span className="text-green-500 font-semibold">Grátis</span>
          </div>
          <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-2 mt-1">
            <span>Total</span>
            <span className="text-cyan-500 text-lg">{totalPreco}</span>
          </div>
        </div>

        {/* Endereço */}
        <div className="flex flex-col gap-2 bg-slate-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Endereço de entrega
            </p>
            <button
              onClick={onEditarEndereco}
              className="text-xs font-semibold text-cyan-500 hover:text-cyan-700 transition-colors"
            >
              Editar
            </button>
          </div>
          <p className="text-sm text-slate-700 font-semibold">
            {endereco.rua}, {endereco.numero}
            {endereco.complemento && ` — ${endereco.complemento}`}
          </p>
          <p className="text-sm text-slate-500">
            {endereco.bairro} — {endereco.cidade}/{endereco.estado}
          </p>
          <p className="text-sm text-slate-500">CEP: {endereco.cep}</p>
        </div>

        {/* Pagamento */}
        <div className="flex flex-col gap-2 bg-slate-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Forma de pagamento
            </p>
            <button
              onClick={onEditarPagamento}
              className="text-xs font-semibold text-cyan-500 hover:text-cyan-700 transition-colors"
            >
              Editar
            </button>
          </div>
          <p className="text-sm text-slate-700 font-semibold">
            Cartão de crédito
          </p>
          <p className="text-sm font-mono text-slate-500">
            {formatarNumeroCartao(pagamento.numero)}
          </p>
          <p className="text-sm text-slate-500">
            {pagamento.nome}
          </p>
          <p className="text-sm text-slate-500">
            {pagamento.parcelas}x {pagamento.parcelas <= 4 ? "sem juros" : "com juros"}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="h-12 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">
          ← Voltar
        </button>
        <button onClick={onNext} className="flex-1 h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors">
          Confirmar pedido →
        </button>
      </div>
    </div>
  );
}
// ── ETAPA 5: CONCLUÍDO ───────────────────────────────────
function EtapaConcluido() {
  const numeroPedido = `#MF${Math.floor(Math.random() * 900000 + 100000)}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center gap-5 text-center">
      <div className="w-20 h-20 bg-cyan-50 border-2 border-cyan-500 rounded-full flex items-center justify-center">
        <FaCircleCheck size={36} color="#06b6d4" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-800">Pedido confirmado!</h2>
        <p className="text-slate-500 text-sm max-w-xs">
          Seu pedido foi recebido com sucesso. Você receberá um e-mail com os detalhes em breve.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 flex flex-col gap-1">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Número do pedido</p>
        <p className="text-lg font-bold text-cyan-500 font-mono">{numeroPedido}</p>
      </div>

      <Link
        href="/"
        className="h-11 px-8 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl flex items-center transition-colors text-sm"
      >
        Voltar para a loja
      </Link>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ─────────────────────────────────────
export default function PaginaCheckout() {
  const router = useRouter();
  const { isLogado } = useAuth();
  const [step, setStep] = useState<EStep>(EStep.CART);
  const [editandoDaRevisao, setEditandoDaRevisao] = useState(false);
  const [endereco, setEndereco] = useState<IDadosEndereco>({
    cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
  });
  const [pagamento, setPagamento] = useState<IDadosPagamento>({
    numero: "", nome: "", validade: "", parcelas: 1,
  });
  const { limparCarrinho } = useCarrinho();

  // ── Login obrigatório para finalizar a compra ──────────────
  useEffect(() => {
    if (!isLogado) {
      router.replace("/login?redirect=/checkout");
    }
  }, [isLogado, router]);

  function concluir() {
    limparCarrinho();
    setStep(EStep.STATUS);
  }

  if (!isLogado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
            <span className="text-lg font-bold text-slate-800">mercadofl<span className="text-cyan-500">3</span>x</span>
          </a>
          <a href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Voltar à loja
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <PassosCheckout stepAtual={step} />

        {step === EStep.CART && (
          <EtapaCarrinho onNext={() => setStep(EStep.ADDRESS)} />
        )}
        {step === EStep.ADDRESS && (
          <EtapaEndereco
            dadosIniciais={endereco}
            modoEdicao={editandoDaRevisao}
            onNext={(dados) => {
              setEndereco(dados);
              setStep(editandoDaRevisao ? EStep.OVERVIEW : EStep.PAYMENT);
              setEditandoDaRevisao(false);
            }}
            onBack={() => {
              setStep(editandoDaRevisao ? EStep.OVERVIEW : EStep.CART);
              setEditandoDaRevisao(false);
            }}
          />
        )}
        {step === EStep.PAYMENT && (
          <EtapaPagamento
            modoEdicao={editandoDaRevisao}
            onNext={() => {
              setStep(EStep.OVERVIEW);
              setEditandoDaRevisao(false);
            }}
            onBack={() => {
              setStep(editandoDaRevisao ? EStep.OVERVIEW : EStep.ADDRESS);
              setEditandoDaRevisao(false);
            }}
            onSalvarPagamento={(dados) => setPagamento(dados)}
          />
        )}
        {step === EStep.OVERVIEW && (
          <EtapaRevisao
            onNext={concluir}
            onBack={() => setStep(EStep.PAYMENT)}
            endereco={endereco}
            pagamento={pagamento}
            onEditarEndereco={() => { setEditandoDaRevisao(true); setStep(EStep.ADDRESS); }}
            onEditarPagamento={() => { setEditandoDaRevisao(true); setStep(EStep.PAYMENT); }}
          />
        )}
        {step === EStep.STATUS && <EtapaConcluido />}
      </div>
    </div>
  );
}