"use client";

import { useState } from "react";
import type { Usuario, Vista } from "@/types";
import { useAppData } from "@/lib/useAppData";
import Login from "@/components/Login";
import Menu from "@/components/Menu";
import TopBar from "@/components/TopBar";
import PlanillaForm from "@/components/PlanillaForm";
import Gastos from "@/components/Gastos";
import Usuarios from "@/components/Usuarios";
import Productos from "@/components/Productos";
import Bicarbonatos from "@/components/Bicarbonatos";
import CernidaSel from "@/components/CernidaSel";
import Historial from "@/components/Historial";
import Reportes from "@/components/Reportes";

const TITULOS: Record<Vista, string> = {
  menu: "Menú principal",
  carga: "Planilla diaria",
  gastos: "Gastos",
  historial: "Historial de planillas",
  usuarios: "ABM de usuarios",
  productos: "Stock de productos",
  bicarbonatos: "Bicarbonatos / Sabores",
  cernidasel: "Cernida / Seleccionada / Machucada",
  reportes: "Reportes",
};

export default function Home() {
  const { data, loaded, update } = useAppData();
  const [user, setUser] = useState<Usuario | null>(null);
  const [vista, setVista] = useState<Vista>("menu");

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)] animate-pulse">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Login
        usuarios={data.usuarios}
        onLogin={(u) => {
          setUser(u);
          setVista("menu");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-4">
        <TopBar
          titulo={TITULOS[vista]}
          user={user}
          enMenu={vista === "menu"}
          onGoMenu={() => setVista("menu")}
          onLogout={() => {
            setUser(null);
            setVista("menu");
          }}
        />

        <main className="animate-fade-in">
          {vista === "menu" && <Menu user={user} onGo={setVista} />}

          {vista === "carga" && (
            <PlanillaForm
              user={user}
              onSave={(p) => update((d) => ({ ...d, planillas: [...d.planillas, p] }))}
              onCancel={() => setVista("menu")}
            />
          )}

          {vista === "gastos" && (
            <Gastos
              user={user}
              gastos={data.gastos}
              onSave={(gastos) => update((d) => ({ ...d, gastos }))}
            />
          )}

          {vista === "usuarios" && user.rol === "Administrador" && (
            <Usuarios
              usuarios={data.usuarios}
              onSave={(usuarios) => update((d) => ({ ...d, usuarios }))}
            />
          )}

          {vista === "productos" && (
            <Productos
              user={user}
              productos={data.productos}
              onSave={(productos) => update((d) => ({ ...d, productos }))}
            />
          )}

          {vista === "bicarbonatos" && (
            <Bicarbonatos
              user={user}
              bicarbonatos={data.bicarbonatos}
              onSave={(bicarbonatos) => update((d) => ({ ...d, bicarbonatos }))}
            />
          )}

          {vista === "cernidasel" && (
            <CernidaSel
              user={user}
              registros={data.cernidaSel}
              onSave={(cernidaSel) => update((d) => ({ ...d, cernidaSel }))}
            />
          )}

          {vista === "historial" && <Historial planillas={data.planillas} />}

          {vista === "reportes" && <Reportes data={data} />}
        </main>
      </div>

      <footer className="text-center text-xs text-[var(--text-muted)] py-4 border-t border-[var(--border)]">
        La Finca · Sistema de planillas
      </footer>
    </div>
  );
}
