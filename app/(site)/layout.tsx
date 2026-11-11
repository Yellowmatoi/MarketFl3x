import { BarraLateral } from "../components/barralateral/BarraLateral";
import { Cabecalho } from "../components/cabecalho/Cabecalho";
import { Drawer } from "../components/drawer/Drawer";


export default function SiteLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Cabecalho />
      <div className="flex flex-1">
        <BarraLateral />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <Drawer />
    </div> 
  );
}