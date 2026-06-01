"use client";

import { useState } from "react";
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

function exportarCSV(nombre: string, cabecera: string[], filas: (string | number)[][]) {
  const csv = [
    cabecera.join(","),
    ...filas.map((r) => r.map((c) => `"${c ?? ""}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombre}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reportes({ data }: Props) {
  const [filtro, setFiltro] = useState<FiltroSuc>("Ambas");

  const planillasFiltradas = filtro === "Ambas"
    ? data.planillas
    : data.planillas.filter((p) => p.sucursal === filtro);

  const gastosFiltrados = filtro === "Ambas"
    ? data.gastos
    : data.gastos.filter((g) => g.sucursal === filtro);

  const totalGastos = gastosFiltrados.reduce((a, g) => a + Number(g.monto || 0), 0);
  const totalVentas = planillasFiltradas.reduce((a, p) => a + Number(p.total || 0), 0);
  const totalStock = data.productos.reduce((a, p) => a + Number(p.stock || 0), 0);
  const valorStock = data.productos.reduce(
    (a, p) => a + Number(p.precio || 0) * Number(p.stock || 0),
    0
  );

  const stats: StatProps[] = [
    { label: "Planillas cargadas", valor: planillasFiltradas.length, icon: "📋", gradient: "from-indigo-500 to-violet-600" },
    { label: "Ventas totales", valor: money(totalVentas), icon: "💰", gradient: "from-emerald-500 to-teal-600" },
    { label: "Gastos totales", valor: money(totalGastos), icon: "📉", gradient: "from-rose-500 to-red-600" },
    { label: "Productos", valor: data.productos.length, icon: "📦", gradient: "from-amber-500 to-orange-600" },
    { label: "Unidades en stock", valor: num(totalStock), icon: "🔢", gradient: "from-cyan-500 to-blue-600" },
    { label: "Valor del stock", valor: money(valorStock), icon: "📊", gradient: "from-fuchsia-500 to-pink-600" },
  ];

  const pillBase = "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all";
  const pillActive = "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30";
  const pillInactive = "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--bg-muted)]";

  return (
    <>
      {/* Filtro de sucursal */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-[var(--text-muted)] font-medium">Sucursal:</span>
        {(["Ambas", ...SUCURSALES] as FiltroSuc[]).map((op) => (
          <button
            key={op}
            onClick={() => setFiltro(op)}
            className={`${pillBase} ${filtro === op ? pillActive : pillInactive}`}
          >
            {op}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <Card className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
          Exportar datos
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() =>
              exportarCSV(
                "planillas",
                ["Fecha", "Sucursal", "Total", "Transferencia", "Posnet", "Gastos", "Hay", "Usuario"],
                planillasFiltradas.map((p) => [
                  p.fecha, p.sucursal, p.total, p.transferencia, p.posnet, p.gastos, p.hay, p.usuario,
                ])
              )
            }
          >
            ⬇ Planillas (CSV)
          </Button>
          <Button
            onClick={() =>
              exportarCSV(
                "gastos",
                ["Fecha", "Sucursal", "Concepto", "Monto", "Usuario"],
                gastosFiltrados.map((g) => [g.fecha, g.sucursal, g.concepto, g.monto, g.usuario])
              )
            }
          >
            ⬇ Gastos (CSV)
          </Button>
          <Button
            onClick={() =>
              exportarCSV(
                "productos",
                ["Producto", "Precio", "Stock"],
                data.productos.map((p) => [p.nombre, p.precio, p.stock])
              )
            }
          >
            ⬇ Productos (CSV)
          </Button>
          <Button
            onClick={() =>
              exportarCSV(
                "bicarbonatos",
                ["Sabor", "Cantidad"],
                data.bicarbonatos.map((b) => [b.nombre, b.cantidad])
              )
            }
          >
            ⬇ Bicarbonatos (CSV)
          </Button>
        </div>
      </Card>
    </>
  );
}
