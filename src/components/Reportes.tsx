"use client";

import { useState, useMemo } from "react";
import type { Sucursal } from "@/types";
import type { AppData } from "@/lib/useAppData";
import { Card, Button } from "./ui";
import { money, num, SUCURSALES } from "@/lib/defaults";

interface Props {
  data: AppData;
}

type FiltroSuc = "Ambas" | Sucursal;

interface StatProps {
  label: string;
  valor: string | number;
  icon: string;
  gradient: string;
}

const Stat = ({ label, valor, icon, gradient }: StatProps) => (
  <div className="card-elevated p-5 relative overflow-hidden">
    <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-10`} />
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-base mb-3`}>
      {icon}
    </div>
    <div className="text-xs font-medium text-[var(--text-muted)] mb-1">{label}</div>
    <div className="font-display text-2xl font-bold leading-none">{valor}</div>
  </div>
);

function exportarCSV(nombre: string, cabecera: string[], filas: (string | number)[][][]) {
  const csv = [
    cabecera.join(","),
    ...filas.flat().map((r) => r.map((c) => `"${c ?? ""}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombre}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportarCSVSimple(nombre: string, cabecera: string[], filas: (string | number)[][]) {
  exportarCSV(nombre, cabecera, [filas]);
}

const pillBase = "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all";
const pillActive = "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30";
const pillInactive = "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--bg-muted)]";

export default function Reportes({ data }: Props) {
  const [filtroSuc, setFiltroSuc] = useState<FiltroSuc>("Ambas");
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<number | "todos">("todos");

  // Meses disponibles derivados de los gastos
  const mesesDisponibles = useMemo(() => {
    const set = new Set<string>();
    data.gastos.forEach((g) => {
      if (g.fecha) set.add(g.fecha.slice(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [data.gastos]);

  // Gastos filtrados por sucursal + mes + tipo
  const gastosFiltrados = useMemo(() => {
    return data.gastos.filter((g) => {
      if (filtroSuc !== "Ambas" && g.sucursal !== filtroSuc) return false;
      if (filtroMes !== "todos" && !g.fecha.startsWith(filtroMes)) return false;
      if (filtroTipo !== "todos" && g.tipo_gasto_id !== filtroTipo) return false;
      return true;
    });
  }, [data.gastos, filtroSuc, filtroMes, filtroTipo]);

  const planillasFiltradas = useMemo(() => {
    return filtroSuc === "Ambas"
      ? data.planillas
      : data.planillas.filter((p) => p.sucursal === filtroSuc);
  }, [data.planillas, filtroSuc]);

  // Resumen por tipo de gasto
  const resumenPorTipo = useMemo(() => {
    const map = new Map<number, { nombre: string; total: number; cantidad: number }>();
    gastosFiltrados.forEach((g) => {
      if (!g.tipo_gasto_id) return;
      const existing = map.get(g.tipo_gasto_id);
      const nombre = data.tiposGastos.find((t) => t.id_gastos === g.tipo_gasto_id)?.gasto ?? g.concepto;
      if (existing) {
        existing.total += Number(g.monto);
        existing.cantidad += 1;
      } else {
        map.set(g.tipo_gasto_id, { nombre, total: Number(g.monto), cantidad: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [gastosFiltrados, data.tiposGastos]);

  // Resumen por sucursal
  const resumenPorSucursal = useMemo(() => {
    return SUCURSALES.map((suc) => ({
      sucursal: suc,
      total: gastosFiltrados.filter((g) => g.sucursal === suc).reduce((a, g) => a + Number(g.monto), 0),
      cantidad: gastosFiltrados.filter((g) => g.sucursal === suc).length,
    }));
  }, [gastosFiltrados]);

  const totalGastos = gastosFiltrados.reduce((a, g) => a + Number(g.monto || 0), 0);
  const totalVentas = planillasFiltradas.reduce((a, p) => a + Number(p.total || 0), 0);

  const stats: StatProps[] = [
    { label: "Planillas cargadas", valor: planillasFiltradas.length, icon: "📋", gradient: "from-indigo-500 to-violet-600" },
    { label: "Ventas totales", valor: money(totalVentas), icon: "💰", gradient: "from-emerald-500 to-teal-600" },
    { label: "Gastos totales", valor: money(totalGastos), icon: "📉", gradient: "from-rose-500 to-red-600" },
    { label: "Movimientos", valor: gastosFiltrados.length, icon: "🧾", gradient: "from-fuchsia-500 to-pink-600" },
  ];

  const labelMes = (mes: string) => {
    const [y, m] = mes.split("-");
    const nombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${nombres[Number(m) - 1]} ${y}`;
  };

  return (
    <>
      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Sucursal */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--text-muted)] font-medium">Sucursal:</span>
          {(["Ambas", ...SUCURSALES] as FiltroSuc[]).map((op) => (
            <button key={op} onClick={() => setFiltroSuc(op)}
              className={`${pillBase} ${filtroSuc === op ? pillActive : pillInactive}`}>
              {op}
            </button>
          ))}
        </div>

        {/* Mes */}
        {mesesDisponibles.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)] font-medium">Mes:</span>
            <button onClick={() => setFiltroMes("todos")}
              className={`${pillBase} ${filtroMes === "todos" ? pillActive : pillInactive}`}>
              Todos
            </button>
            {mesesDisponibles.map((m) => (
              <button key={m} onClick={() => setFiltroMes(m)}
                className={`${pillBase} ${filtroMes === m ? pillActive : pillInactive}`}>
                {labelMes(m)}
              </button>
            ))}
          </div>
        )}

        {/* Tipo de gasto */}
        {data.tiposGastos.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-[var(--text-muted)] font-medium">Tipo:</span>
            <button onClick={() => setFiltroTipo("todos")}
              className={`${pillBase} ${filtroTipo === "todos" ? pillActive : pillInactive}`}>
              Todos
            </button>
            {data.tiposGastos.map((t) => (
              <button key={t.id_gastos} onClick={() => setFiltroTipo(t.id_gastos)}
                className={`${pillBase} ${filtroTipo === t.id_gastos ? pillActive : pillInactive}`}>
                {t.gasto}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>

      {/* ── Detalle de gastos ── */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Detalle de gastos
          </p>
          <Button size="sm" onClick={() =>
            exportarCSVSimple("gastos_detalle",
              ["Fecha", "Sucursal", "Tipo", "Monto", "Usuario"],
              gastosFiltrados.map((g) => [g.fecha, g.sucursal, g.concepto, g.monto, g.usuario])
            )
          }>
            ⬇ CSV
          </Button>
        </div>

        {gastosFiltrados.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] italic">Sin gastos para los filtros seleccionados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-muted)]">
                  <th className="text-left px-3 py-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-3 py-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Sucursal</th>
                  <th className="text-left px-3 py-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tipo</th>
                  <th className="text-right px-3 py-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Monto</th>
                  <th className="text-left px-3 py-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Cargó</th>
                </tr>
              </thead>
              <tbody>
                {gastosFiltrados.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).map((g) => (
                  <tr key={g.id} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 tabular-nums">{g.fecha}</td>
                    <td className="px-3 py-2">{g.sucursal}</td>
                    <td className="px-3 py-2 font-medium">{g.concepto}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">{money(g.monto)}</td>
                    <td className="px-3 py-2 text-[var(--text-muted)]">{g.usuario}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)] bg-[var(--bg-muted)]">
                  <td colSpan={3} className="px-3 py-2.5 font-semibold text-sm">Total</td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums text-fuchsia-600 dark:text-fuchsia-400">{money(totalGastos)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* ── Resumen por tipo ── */}
      {resumenPorTipo.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Por tipo de gasto
              </p>
              <Button size="sm" onClick={() =>
                exportarCSVSimple("gastos_por_tipo",
                  ["Tipo", "Cantidad", "Total"],
                  resumenPorTipo.map((r) => [r.nombre, r.cantidad, r.total])
                )
              }>
                ⬇ CSV
              </Button>
            </div>
            <div className="space-y-2">
              {resumenPorTipo.map((r) => (
                <div key={r.nombre} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{r.nombre}</span>
                    <span className="text-xs text-[var(--text-muted)] ml-1.5">× {r.cantidad}</span>
                  </div>
                  <span className="tabular-nums font-semibold">{money(r.total)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--border)]">
                <span className="font-semibold">Total</span>
                <span className="tabular-nums font-bold text-fuchsia-600 dark:text-fuchsia-400">{money(totalGastos)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              Por sucursal
            </p>
            <div className="space-y-2">
              {resumenPorSucursal.map((r) => (
                <div key={r.sucursal} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{r.sucursal}</span>
                    <span className="text-xs text-[var(--text-muted)] ml-1.5">× {r.cantidad}</span>
                  </div>
                  <span className="tabular-nums font-semibold">{money(r.total)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--border)]">
                <span className="font-semibold">Total</span>
                <span className="tabular-nums font-bold text-fuchsia-600 dark:text-fuchsia-400">{money(totalGastos)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Exportar ── */}
      <Card className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Exportar datos
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() =>
            exportarCSVSimple("planillas",
              ["Fecha", "Sucursal", "Total", "Transferencia", "Posnet", "Gastos", "Hay", "Usuario"],
              planillasFiltradas.map((p) => [p.fecha, p.sucursal, p.total, p.transferencia, p.posnet, p.gastos, p.hay, p.usuario])
            )
          }>
            ⬇ Planillas (CSV)
          </Button>
          <Button onClick={() =>
            exportarCSVSimple("gastos_completo",
              ["Fecha", "Sucursal", "Tipo", "Monto", "Usuario"],
              gastosFiltrados.map((g) => [g.fecha, g.sucursal, g.concepto, g.monto, g.usuario])
            )
          }>
            ⬇ Gastos (CSV)
          </Button>
        </div>
      </Card>
    </>
  );
}
