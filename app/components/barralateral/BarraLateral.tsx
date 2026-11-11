"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ISecao {
  titulo: string;
  itens: { nome: string; href: string }[];
}

function IconeChevron({ aberto }: { aberto: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SecaoAccordion({ secao, pathname }: { secao: ISecao; pathname: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        className="flex items-center justify-between px-2 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
      >
        {secao.titulo}
        <IconeChevron aberto={aberto} />
      </button>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          aberto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden flex flex-col gap-1">
          {secao.itens.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === item.href
                  ? "bg-cyan-50 text-cyan-600 font-semibold"
                  : "text-slate-500 hover:bg-slate-100 hover:text-cyan-500"
              }`}
            >
              {item.nome}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BarraLateral() {
  const pathname = usePathname();

  const secoes: ISecao[] = [
    {
      titulo: "Navegação",
      itens: [
        { nome: "Página inicial", href: "/" },
        { nome: "Favoritos",      href: "/favoritos" },
        { nome: "Carrinho",       href: "/carrinho" },
        { nome: "Meu perfil",     href: "/perfil" },
      ],
    },
    {
      titulo: "Categorias",
      itens: [
        { nome: "Todos",          href: "/" },
        { nome: "Roupas",         href: "/?categoria=roupas" },
        { nome: "Bonecos",        href: "/?categoria=bonecos" },
        { nome: "Action Figures", href: "/?categoria=action-figures" },
        { nome: "Mangás",         href: "/?categoria=mangas" },
        { nome: "Acessórios",     href: "/?categoria=acessorios" },
      ],
    },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 px-4 py-6 flex flex-col gap-4">
      {secoes.map((secao) => (
        <SecaoAccordion key={secao.titulo} secao={secao} pathname={pathname} />
      ))}
    </aside>
  );
}