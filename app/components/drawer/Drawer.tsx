"use client";


import { useDrawer } from "../DrawerContexto";
import { DrawerCarrinho } from "./DrawerCarrinho";
import { DrawerFavoritos } from "./DrawerFavoritos";

export function Drawer() {
  const { drawerAberto, fecharDrawer } = useDrawer();

  if (!drawerAberto) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={fecharDrawer}
      />

      {/* Painel lateral */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">
        {drawerAberto === "carrinho" && <DrawerCarrinho />}
        {drawerAberto === "favoritos" && <DrawerFavoritos />}
      </div>
    </>
  );
}