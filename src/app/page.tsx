"use client";

import { useState } from "react";
import type { Usuario, Vista, Gasto, Planilla, TipoGasto, Venta, Cliente, Cobro } from "@/types";
import { useAppData, savePlanilla, deletePlanilla, saveGasto, deleteGasto, saveUsuario, deleteUsuario, saveVenta, deleteVenta, saveCobro, deleteCobro } from "@/lib/useAppData";
import Login from "@/components/Login";
import Sidebar, { NAV } from "@/components/Sidebar";
import Menu from "@/components/Menu";
import PlanillaForm from "@/components/PlanillaForm";
import Gastos from "@/components/Gastos";
import Ventas from "@/components/Ventas";
import Historial from "@/components/Historial";
import Reportes from "@/components/Reportes";
import Configuracion from "@/components/Configuracion";

const TITULOS: Record<Vista, string> = {
  menu: "Inicio",
  carga: "Planilla diaria",
  gastos: "Gastos",
  ventas: "Ventas",
  historial: "Historial",
  reportes: "Reportes",
  configuracion: "Configuración",
};

const HOME_ICON = "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z";

export default function Home() {
  const { data, setData, loaded, update, tableErrors } = useAppData();
  const [user, setUser] = useState<Usuario | null>(null);
  const [vista, setVista] = useState<Vista>("menu");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [planillaEditando, setPlanillaEditando] = useState<Planilla | null>(null);

  const irA = (v: Vista) => {
    setPlanillaEditando(null);
    setVista(v);
  };

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

  // ─── Handlers con persistencia en Supabase ─────────────────────────────────

  const handleSavePlanilla = async (p: Planilla) => {
    await savePlanilla(p);
    setData((prev) => {
      const existe = prev.planillas.some((x) => x.id === p.id);
      return {
        ...prev,
        planillas: existe
          ? prev.planillas.map((x) => (x.id === p.id ? p : x))
          : [p, ...prev.planillas],
      };
    });
    setPlanillaEditando(null);
    setVista("historial");
  };

  const handleEditPlanilla = (p: Planilla) => {
    setPlanillaEditando(p);
    setVista("carga");
  };

  const handleDeletePlanilla = async (id: string) => {
    await deletePlanilla(id);
    setData((prev) => ({ ...prev, planillas: prev.planillas.filter((p) => p.id !== id) }));
  };

  const handleSaveGastos = async (newGastos: Gasto[]) => {
    const old = data.gastos;
    for (const g of old) {
      if (!newGastos.find((x) => x.id === g.id)) await deleteGasto(g.id);
    }
    for (const g of newGastos) {
      const prev = old.find((x) => x.id === g.id);
      if (!prev || JSON.stringify(prev) !== JSON.stringify(g)) await saveGasto(g);
    }
    setData((prev) => ({ ...prev, gastos: newGastos }));
  };

  const handleGastoAdded = (g: Gasto) => {
    setData((prev) => ({ ...prev, gastos: [g, ...prev.gastos] }));
  };

  const handleGastoDeleted = (id: string) => {
    setData((prev) => ({ ...prev, gastos: prev.gastos.filter((g) => g.id !== id) }));
  };

  const handleTiposGastosChange = (tipos: TipoGasto[]) => {
    setData((prev) => ({ ...prev, tiposGastos: tipos }));
  };

  const handleClientesChange = (clientes: Cliente[]) => {
    setData((prev) => ({ ...prev, clientes }));
  };

  const handleSaveVentas = async (newVentas: Venta[]) => {
    const old = data.ventas;
    for (const v of old) {
      if (!newVentas.find((x) => x.id === v.id)) {
        await deleteVenta(v.id);
        // eliminar cobros huerfanos de esta venta
        for (const c of data.cobros.filter((c) => c.venta_id === v.id)) {
          await deleteCobro(c.id);
        }
      }
    }
    for (const v of newVentas) {
      const prev = old.find((x) => x.id === v.id);
      if (!prev || JSON.stringify(prev) !== JSON.stringify(v)) await saveVenta(v);
    }
    const ventasEliminadas = old.filter((v) => !newVentas.find((x) => x.id === v.id)).map((v) => v.id);
    setData((prev) => ({
      ...prev,
      ventas: newVentas,
      cobros: prev.cobros.filter((c) => !ventasEliminadas.includes(c.venta_id)),
    }));
  };

  const handleSaveCobro = async (cobro: Cobro) => {
    await saveCobro(cobro);
    setData((prev) => ({ ...prev, cobros: [cobro, ...prev.cobros] }));
  };

  const handleDeleteCobro = async (id: string) => {
    await deleteCobro(id);
    setData((prev) => ({ ...prev, cobros: prev.cobros.filter((c) => c.id !== id) }));
  };

  const handleSaveUsuarios = async (newUsuarios: typeof data.usuarios) => {
    const old = data.usuarios;
    // Eliminados
    for (const u of old) {
      if (!newUsuarios.find((x) => x.id === u.id)) await deleteUsuario(u.id);
    }
    // Agregados o modificados
    for (const u of newUsuarios) {
      const prev = old.find((x) => x.id === u.id);
      if (!prev || JSON.stringify(prev) !== JSON.stringify(u)) await saveUsuario(u);
    }
    setData((prev) => ({ ...prev, usuarios: newUsuarios }));
  };

  // ───────────────────────────────────────────────────────────────────────────

  const navItem = NAV.find((n) => n.view === vista);
  const iconD = navItem?.d ?? HOME_ICON;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      <Sidebar
        user={user}
        vista={vista}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onGo={irA}
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
              <Menu user={user} data={data} onGo={irA} />
            )}

            {vista === "carga" && (
              <PlanillaForm
                user={user}
                gastos={data.gastos}
                tiposGastos={data.tiposGastos}
                ventas={data.ventas}
                cobros={data.cobros}
                editing={planillaEditando}
                onSave={handleSavePlanilla}
                onCancel={() => { setPlanillaEditando(null); setVista(planillaEditando ? "historial" : "menu"); }}
                onGastoAdded={handleGastoAdded}
                onGastoDeleted={handleGastoDeleted}
              />
            )}

            {vista === "gastos" && (
              <Gastos
                user={user}
                gastos={data.gastos}
                tiposGastos={data.tiposGastos}
                onSave={handleSaveGastos}
              />
            )}

            {vista === "ventas" && (
              <Ventas
                user={user}
                ventas={data.ventas}
                clientes={data.clientes}
                cobros={data.cobros}
                ventasError={tableErrors.ventas}
                cobrosError={tableErrors.cobros}
                onSaveVentas={handleSaveVentas}
                onSaveCobro={handleSaveCobro}
                onDeleteCobro={handleDeleteCobro}
              />
            )}

            {vista === "historial" && (
              <Historial
                planillas={data.planillas}
                user={user}
                onEdit={handleEditPlanilla}
                onDelete={handleDeletePlanilla}
              />
            )}

            {vista === "reportes" && <Reportes data={data} />}

            {vista === "configuracion" && user.rol === "Administrador" && (
              <Configuracion
                onTiposGastosChange={handleTiposGastosChange}
                onClientesChange={handleClientesChange}
                usuarios={data.usuarios}
                onSaveUsuarios={handleSaveUsuarios}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
