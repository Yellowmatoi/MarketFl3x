export default function PaginaPerfil() {
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Meu Perfil</h1>

      <div className="flex flex-col gap-6 max-w-xl">

        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-base font-bold text-slate-800">Informações pessoais</p>

          {[
            { label: "Nome", valor: "—" },
            { label: "E-mail", valor: "—" },
            { label: "Telefone", valor: "—" },
          ].map((campo) => (
            <div key={campo.label} className="flex flex-col gap-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{campo.label}</p>
              <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                {campo.valor}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-3">
          <p className="text-base font-bold text-slate-800">Meus pedidos</p>
          <p className="text-sm text-slate-400">Nenhum pedido realizado ainda.</p>
        </div>

      </div>
    </>
  );
}