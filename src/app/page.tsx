"use client";

import { useState } from "react";
import type { Usuario, Vista } from "@/types";
import { useAppData } from "@/lib/useAppData";
import Login from "@/components/Login";
import Sidebar, { NAV } from "@/components/Sidebar";
import Menu from "@/components/Menu";
import PlanillaForm from "@/components/PlanillaForm";
import Gastos from "@/components/Gastos";
import Usuarios from "@/components/Usuarios";
import Historial from "@/components/Historial";
import Reportes from "@/components/Reportes";

const TITULOS: Record<Vista, string> = {
  menu: "Inicio",
  carga: "Planilla diaria",
  gastos: "Gastos",
  historial: "Historial",
  usuarios: "Usuarios",
  reportes: "Reportes",
};

const HOME_ICON = "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z";

export default function Home() {
  const { data, loaded, update } = useAppData();
  const [user, setUser] = useState<Usuario | null>(null);
  const [vista, setVista] = useState<Vista>("menu");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span className="text-sm">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login
        usuarios={data.usuarios}
        onLogin={(u) => { setUser(u); setVista("menu"); }}
      />
    );
  }

  const navItem = NAV.find((n) => n.view === vista);
  const iconD = navItem?.d ?? HOME_ICON;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      <Sidebar
        user={user}
        vista={vista}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onGo={setVista}
        onLogout={() => { setUser(null); setVista("menu"); }}
        onToggle={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Content header */}
        <header className="shrink-0 h-14 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-5 flex items-center gap-3">
          <button
            className="lg:hidden w-8 h-8 rounded-lg hover:bg-[var(--bg-muted)] flex items-center justify-center transition-all"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] shrink-0">
            <path d={iconD} />
          </svg>
          <h1 className="font-display font-semibold text-sm">{TITULOS[vista]}</h1>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)] border border-[var(--border)] rounded-lg px-2.5 py-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-[9px] font-bold">
                {user.user.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-[var(--text)]">{user.user}</span>
              <span className="text-[var(--text-muted)]">·</span>
              <span>{user.rol}</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main key={vista} className="flex-1 overflow-y-auto p-5 lg:p-7 animate-fade-in">
          <div className="max-w-5xl mx-auto">
            {vista === "menu" && (
              <Menu user={user} data={data} onGo={setVista} />
            )}

            {vista === "carga" && (
              <PlanillaForm
                user={user}
                gastos={data.gastos}
                onSave={(p) => {
                  update((d) => ({ ...d, planillas: [...d.planillas, p] }));
                  setVista("historial");
                }}
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

            {vista === "historial" && <Historial planillas={data.planillas} />}

            {vista === "reportes" && <Reportes data={data} />}
          </div>
        </main>
      </div>
    </div>
  );
}
