import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { Providers } from "./components/Providers";


export const metadata: Metadata = {
  title: {
    default: "mercadofl3x — Anime Shop",
    template: "%s | mercadofl3x",
  },
  description: "O melhor marketplace de animes do Brasil. Action figures, roupas, bonecos e muito mais.",
  keywords: ["anime", "marketplace", "action figure", "mangá", "otaku", "boneco"],
  authors: [{ name: "mercadofl3x" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "mercadofl3x — Anime Shop",
    description: "O melhor marketplace de animes do Brasil.",
    locale: "pt_BR",
    type: "website",
  },
};


export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}