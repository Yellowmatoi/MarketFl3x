"use client";

import { ReactNode } from "react";
import { AuthProvider } from "../contexts/AuthContexto";
import { CarrinhoProvider } from "../contexts/CarrinhoContexto";
import { FavoritosProvider } from "../contexts/FavoritosContexto";
import { DrawerProvider } from "./DrawerContexto";


export function Providers({ children }: { readonly children: ReactNode }) {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <FavoritosProvider>
          <DrawerProvider>
            {children}
          </DrawerProvider>
        </FavoritosProvider>
      </CarrinhoProvider>
    </AuthProvider>
  );
}