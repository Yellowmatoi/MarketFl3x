import { PropsCampoFormulario } from "../../interfaces/auth";

export function CampoFormulario({ rotulo, tipo, placeholder, valor, aoMudar, nome }: PropsCampoFormulario) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-600">{rotulo}</label>
      <input
        type={tipo}
        name={nome}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className="h-11 px-3 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 focus:bg-white transition-all"
      />
    </div>
  );
}