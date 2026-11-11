"use client";

import { IoCart } from "react-icons/io5";
import { FaMapMarkerAlt, FaCreditCard, FaEye } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";


enum EStep {
  CART     = 0,
  ADDRESS  = 1,
  PAYMENT  = 2,
  OVERVIEW = 3,
  STATUS   = 4,
}

interface IStep {
  icon: React.ElementType;
  label: string;
  value: EStep;
}

const STEPS: Array<IStep> = [
  { icon: IoCart,         label: "Carrinho",  value: EStep.CART     },
  { icon: FaMapMarkerAlt, label: "Endereço",  value: EStep.ADDRESS  },
  { icon: FaCreditCard,   label: "Pagamento", value: EStep.PAYMENT  },
  { icon: FaEye,          label: "Revisão",   value: EStep.OVERVIEW },
  { icon: FaCircleCheck,  label: "Concluir",  value: EStep.STATUS   },
];

interface PassosCheckoutProps {
  stepAtual: EStep;
}

export function PassosCheckout({ stepAtual }: PassosCheckoutProps) {
  return (
    <div className="flex items-center justify-center w-full mb-10">
      {STEPS.map((passo, index) => {
        const Icone = passo.icon;
        const concluido = index < stepAtual;
        const ativo = index === stepAtual;

        return (
          <div key={passo.value} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                concluido
                  ? "bg-cyan-500 border-cyan-500 text-white"
                  : ativo
                  ? "bg-white border-cyan-500 text-cyan-500"
                  : "bg-white border-slate-200 text-slate-300"
              }`}>
                {concluido ? <FaCircleCheck size={20} color="white" /> : <Icone size={20} />}
              </div>
              <span className={`text-xs font-semibold ${
                ativo ? "text-cyan-500" : concluido ? "text-cyan-400" : "text-slate-300"
              }`}>
                {passo.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 mb-5 rounded-full transition-all ${
                concluido ? "bg-cyan-500" : "bg-slate-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}