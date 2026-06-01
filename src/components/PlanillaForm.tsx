"use client";

import { useState } from "react";
import type { Usuario, Planilla, Gasto, Sucursal } from "@/types";
import { Card, Field, Input, Select, Textarea, Button } from "./ui";
import { uid, money, SUCURSALES } from "@/lib/defaults";

interface Props {
  user: Usuario;
  gastos: Gasto[];
  onSave: (p: Planilla) => void;
  onCancel: () => void;
}

export default function PlanillaForm({ user, gastos, onSave, onCancel }: Props) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({
    fecha: hoy,
    sucursal: "Belgrano" as Sucursal,
    total: "", transferencia: "", posnet: "",
    pedidos_ing: "", pedidos_debe: "", debe_haber: "", hay: "",
    s_habia: "", s_ingreso: "", s_prod: "", s_quedan: "",
    c_habia: "", c_ingreso: "", c_prod: "", c_quedan: "",
    obs: "",
  });
  const [msg, setMsg] = useState("");
  const [showDesglose, setShowDesglose] = useState(false);

  const set = (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value });

  // Auto-cálculo de gastos del día
  const gastosDelDia = gastos.filter(
    (g) => g.fecha === f.fecha && g.sucursal === f.sucursal
  );
  const totalGastos = gastosDelDia.reduce((a, g) => a + Number(g.monto || 0), 0);

  const guardar = () => {
    const p: Planilla = {
      id: uid(),
      fecha: f.fecha,
      sucursal: f.sucursal,
      total: f.total,
      transferencia: f.transferencia,
      posnet: f.posnet,
      gastos: String(totalGastos),
      pedidos_ing: f.pedidos_ing,
      pedidos_debe: f.pedidos_debe,
      debe_haber: f.debe_haber,
      hay: f.hay,
      seleccionada: { habia: f.s_habia, ingreso: f.s_ingreso, prod: f.s_prod, quedan: f.s_quedan },
      cernida: { habia: f.c_habia, ingreso: f.c_ingreso, prod: f.c_prod, quedan: f.c_quedan },
      observaciones: f.obs,
      usuario: user.user,
      ts: Date.now(),
    };
    onSave(p);
    setMsg("✓ Planilla guardada");
    setTimeout(onCancel, 700);
  };

  return (
    <Card className="p-5">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Fecha">
          <Input type="date" value={f.fecha} onChange={set("fecha")} />
        </Field>
        <Field label="Sucursal">
          <Select value={f.sucursal} onChange={set("sucursal")}>
            {SUCURSALES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-4 mb-3">
        Totales del día
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Total">
          <Input type="number" value={f.total} onChange={set("total")} />
        </Field>
        <Field label="Transferencia">
          <Input type="number" value={f.transferencia} onChange={set("transferencia")} />
        </Field>
        <Field label="Posnet / QR">
          <Input type="number" value={f.posnet} onChange={set("posnet")} />
        </Field>

        {/* Gastos auto-calculados */}
        <Field label="Gastos del día (auto)">
          <Input
            type="text"
            value={money(totalGastos)}
            readOnly
            className="bg-[var(--bg-muted)] cursor-not-allowed opacity-75"
          />
        </Field>
      </div>

      {/* Desglose de gastos */}
      <div className="mt-2 mb-1">
        {gastosDelDia.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">
            Sin gastos cargados para esta fecha y sucursal.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowDesglose((v) => !v)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`transition-transform ${showDesglose ? "rotate-90" : ""}`}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              {showDesglose ? "Ocultar desglose" : `Ver desglose (${gastosDelDia.length} gasto${gastosDelDia.length > 1 ? "s" : ""})`}
            </button>
            {showDesglose && (
              <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-3 space-y-1">
                {gastosDelDia.map((g) => (
                  <div key={g.id} className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">{g.concepto}</span>
                    <span className="font-medium tabular-nums">{money(g.monto)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-semibold pt-1.5 border-t border-[var(--border)]">
                  <span>Total</span>
                  <span className="tabular-nums">{money(totalGastos)}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <Field label="Pedidos ingresos">
          <Input type="number" value={f.pedidos_ing} onChange={set("pedidos_ing")} />
        </Field>
        <Field label="Pedidos debe">
          <Input type="number" value={f.pedidos_debe} onChange={set("pedidos_debe")} />
        </Field>
        <Field label="Debe / Haber">
          <Input type="number" value={f.debe_haber} onChange={set("debe_haber")} />
        </Field>
        <Field label="Hay">
          <Input type="number" value={f.hay} onChange={set("hay")} />
        </Field>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-5 mb-3">
        Seleccionada (kg)
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Había"><Input type="number" value={f.s_habia} onChange={set("s_habia")} /></Field>
        <Field label="Ingresaron"><Input type="number" value={f.s_ingreso} onChange={set("s_ingreso")} /></Field>
        <Field label="Producción"><Input type="number" value={f.s_prod} onChange={set("s_prod")} /></Field>
        <Field label="Quedan"><Input type="number" value={f.s_quedan} onChange={set("s_quedan")} /></Field>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-5 mb-3">
        Cernida (kg)
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Había"><Input type="number" value={f.c_habia} onChange={set("c_habia")} /></Field>
        <Field label="Ingresaron"><Input type="number" value={f.c_ingreso} onChange={set("c_ingreso")} /></Field>
        <Field label="Producción"><Input type="number" value={f.c_prod} onChange={set("c_prod")} /></Field>
        <Field label="Quedan"><Input type="number" value={f.c_quedan} onChange={set("c_quedan")} /></Field>
      </div>

      <div className="mt-4">
        <Field label="Observaciones">
          <Textarea
            rows={2}
            value={f.obs}
            onChange={set("obs")}
            placeholder="Ej: Sobran $2.400 / Falta en mercadería 2.400"
          />
        </Field>
      </div>

      {msg && (
        <p className="text-sm text-green-600 dark:text-green-400 mt-3 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {msg}
        </p>
      )}

      <div className="flex gap-2 mt-5">
        <Button variant="primary" onClick={guardar}>Guardar planilla</Button>
        <Button onClick={onCancel}>Cancelar</Button>
      </div>
    </Card>
  );
}
