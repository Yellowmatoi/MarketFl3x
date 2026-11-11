"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type DrawerTipo = "carrinho" | "favoritos" | null;

interface DrawerContextoTipo {
  drawerAberto: DrawerTipo;
  abrirDrawer: (tipo: DrawerTipo) => void;
  fecharDrawer: () => void;
}

const DrawerContexto = createContext<DrawerContextoTipo | null>(null);

export function DrawerProvider({ children }: { readonly children: ReactNode }) {
  const [drawerAberto, setDrawerAberto] = useState<DrawerTipo>(null);

  function abrirDrawer(tipo: DrawerTipo) {
    setDrawerAberto(tipo);
  }

  function fecharDrawer() {
    setDrawerAberto(null);
  }

  return (
    <DrawerContexto.Provider value={{ drawerAberto, abrirDrawer, fecharDrawer }}>
      {children}
    </DrawerContexto.Provider>
  );
}

export function useDrawer() {
  const contexto = useContext(DrawerContexto);
  if (!contexto) throw new Error("useDrawer deve ser usado dentro do DrawerProvider");
  return contexto;
}