"use client";

import type { Usuario, Vista } from "@/types";
import type { AppData } from "@/lib/useAppData";
import { money } from "@/lib/defaults";

interface Props {
  user: Usuario;
  data: AppData;
  onGo: (v: Vista) => void;
}

interface QuickStatProps {
  label: string;
  value: string | number;
  gradient: string;
  icon: string;
  onClick: () => void;
}

function QuickStat({ label, value, gradient, icon, onClick }: QuickStatProps) {
  return (
    <button
      onClick={onClick}
      className="card-elevated p-4 text-left hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group relative overflow-hidden"
    >
      <div className={`absolute -top-5 -right-5 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-[0.08] group-hover:opacity-[0.14] transition-opacity`} />
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-base mb-3 shadow-sm`}>
        {icon}
      </div>
      <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</div>
      <div className="font-display text-xl font-bold leading-none">{value}</div>
    </button>
  );
}

interface QuickActionProps {
  label: string;
  desc: string;
  gradient: string;
  d: string;
  onClick: () => void;
}

function QuickAction({ label, desc, gradient, d, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="card-elevated p-4 text-left flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={d} />
        </svg>
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-sm leading-tight">{label}</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</div>
      </div>
      <span className="ml-auto text-[var(--text-muted)] transition-transform duration-150 group-hover:translate-x-1 shrink-0 text-sm">→</span>
    </button>
  );
}

export default function Menu({ user, data, onGo }: Props) {
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  const totalGastos = data.gastos.reduce((a, g) => a + Number(g.monto || 0), 0);
  const recientes = data.planillas.slice().reverse().slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold">
          {saludo},{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
            {user.user}
          </span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1 capitalize">
          {new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Resumen general
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickStat label="Planillas" value={data.planillas.length} gradient="from-indigo-500 to-violet-600" icon="📋" onClick={() => onGo("historial")} />
          <QuickStat label="Gastos totales" value={money(totalGastos)} gradient="from-fuchsia-500 to-pink-600" icon="💸" onClick={() => onGo("gastos")} />
          <QuickStat label="Registros de gastos" value={data.gastos.length} gradient="from-amber-500 to-orange-600" icon="🧾" onClick={() => onGo("gastos")} />
          <QuickStat label="Usuarios" value={data.usuarios.length} gradient="from-violet-500 to-purple-600" icon="👥" onClick={() => onGo("configuracion")} />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Acciones rápidas
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction
            label="Nueva planilla"
            desc="Cargar el día de hoy"
            gradient="from-indigo-500 to-violet-600"
            d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
            onClick={() => onGo("carga")}
          />
          <QuickAction
            label="Registrar gasto"
            desc="Alta, baja y modificación"
            gradient="from-fuchsia-500 to-pink-600"
            d="M21 8V7l-3 2-3-2-3 2-3-2-3 2-3-2v14l3-2 3 2 3-2 3 2 3-2 3 2V8z"
            onClick={() => onGo("gastos")}
          />
          <QuickAction
            label="Ver reportes"
            desc="Totales y exportar CSV"
            gradient="from-rose-500 to-red-600"
            d="M12 20V10M18 20V4M6 20v-6"
            onClick={() => onGo("reportes")}
          />
        </div>
      </div>

      {/* Recent planillas */}
      {recientes.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Últimas planillas
          </p>
          {/* Tabla (desktop) */}
          <div className="hidden md:block card-elevated overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Fecha", "Sucursal", "Total", "Gastos", "Hay"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-muted)] ${i > 1 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recientes.map((p, i) => (
                  <tr key={p.id} className={`border-t border-[var(--border)] ${i % 2 === 1 ? "bg-[var(--bg-muted)]/40" : ""}`}>
                    <td className="px-4 py-3 text-sm">{p.fecha}</td>
                    <td className="px-4 py-3 text-sm">{p.sucursal}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{money(p.total)}</td>
                    <td className="px-4 py-3 text-sm text-right text-[var(--text-muted)]">{money(p.gastos)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-emerald-600 dark:text-emerald-400">{money(p.hay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
          <div className="md:hidden space-y-3">
            {recientes.map((p) => (
              <div key={p.id} className="card-elevated p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-sm">{p.fecha}</span>
                  <span className="text-xs text-[var(--text-muted)]">{p.sucursal}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Total</span>
                  <span className="text-sm font-semibold">{money(p.total)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Gastos</span>
                  <span className="text-sm text-[var(--text-muted)]">{money(p.gastos)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Hay</span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{money(p.hay)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
