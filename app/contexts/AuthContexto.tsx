"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { IUsuarioLogado } from "../interfaces/usuario";


interface IAuthContexto {
  usuario: IUsuarioLogado | null;
  isLogado: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  definirSessao: (usuario: IUsuarioLogado) => void;
  logout: () => void;
}

const AuthContexto = createContext<IAuthContexto | null>(null);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [usuario, setUsuario] = useState<IUsuarioLogado | null>(null);

  async function login(email: string, senha: string): Promise<boolean> {
    try {
      const res = await fetch(
        `http://localhost:3001/usuarios?email=${email}`
      );

      if (!res.ok) {
        throw new Error("Erro ao buscar usuários");
      }

      const usuarios = await res.json();

      const encontrado = usuarios.find(
        (u: any) => u.email === email && u.senha === senha
      );

      if (!encontrado) return false;

      setUsuario({
        id: encontrado.id,
        nome: encontrado.nome,
        email: encontrado.email,
        avatar: encontrado.avatar,
      });

      return true;
    } catch {
      return false;
    }
  }

  function definirSessao(dadosUsuario: IUsuarioLogado) {
    setUsuario(dadosUsuario);
  }

  function logout() {
    setUsuario(null);
  }

  return (
    <AuthContexto.Provider value={{ usuario, isLogado: !!usuario, login, definirSessao, logout }}>
      {children}
    </AuthContexto.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContexto);
  if (!contexto) throw new Error("useAuth deve ser usado dentro do AuthProvider");
  return contexto;
}