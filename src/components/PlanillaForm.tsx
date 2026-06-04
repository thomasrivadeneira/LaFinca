"use client";

import { useState, useMemo } from "react";
import type { Usuario, Planilla, Gasto, Sucursal } from "@/types";
import { Card, Field, Input, Select, Textarea, Button } from "./ui";
import { uid, money, SUCURSALES } from "@/lib/defaults";

interface Props {
  user: Usuario;
  gastos: Gasto[];
  planillas: Planilla[];
  onSave: (p: Planilla) => void;
  onCancel: () => void;
}

export default function PlanillaForm({ user, gastos, planillas, onSave, onCancel }: Props) {
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
  const [rendicion, setRendicion] = useState("");
  const [msg, setMsg] = useState("");
  const [showDesglose, setShowDesglose] = useState(false);
  const [modoGastosManual, setModoGastosManual] = useState(false);
  const [gastosManual, setGastosManual] = useState("");

  const set = (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value });

  // ─── Gastos del día ───────────────────────────────────────────────────────
  const gastosDelDia = gastos.filter(
    (g) => g.fecha === f.fecha && g.sucursal === f.sucursal
  );
  const totalGastosAuto = gastosDelDia.reduce((a, g) => a + Number(g.monto || 0), 0);
  const totalGastosEfectivo = modoGastosManual ? Number(gastosManual || 0) : totalGastosAuto;

  // ─── Sección Caja ─────────────────────────────────────────────────────────

  // Saldo inicial: rendición de la última planilla anterior de esta sucursal
  const saldoInicial = useMemo(() => {
    const anteriores = planillas
      .filter((p) => p.sucursal === f.sucursal && p.fecha < f.fecha)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    const ultima = anteriores[0];
    if (!ultima) return 0;
    // Si la última planilla tiene rendición usamos ese valor (efectivo real que quedó)
    // Si no, usamos el saldo teórico (hay)
    if (ultima.rendicion && ultima.rendicion !== "") return Number(ultima.rendicion);
    if (ultima.hay && ultima.hay !== "") return Number(ultima.hay);
    return 0;
  }, [planillas, f.sucursal, f.fecha]);

  // Efectivo ingresado = Total - Transferencia - Posnet
  const efectivoIngresado = Math.max(
    0,
    Number(f.total || 0) - Number(f.transferencia || 0) - Number(f.posnet || 0)
  );

  // Saldo teórico = saldo inicial + efectivo ingresado - gastos
  const saldoTeorico = saldoInicial + efectivoIngresado - totalGastosEfectivo;

  // Diferencia = saldo teórico - rendición
  const rendicionNum = Number(rendicion || 0);
  const diferencia = rendicion !== "" ? saldoTeorico - rendicionNum : null;

  // Movimientos para la tabla
  const movimientos = useMemo(() => {
    const rows: { concepto: string; tipo: "entrada" | "salida"; importe: number; saldo: number }[] = [];
    let saldo = saldoInicial;

    // Entrada: venta en efectivo
    if (efectivoIngresado > 0) {
      saldo += efectivoIngresado;
      rows.push({ concepto: "Venta en efectivo", tipo: "entrada", importe: efectivoIngresado, saldo });
    }

    // Salidas: gastos del ABM
    const gastosOrdenados = [...gastosDelDia].sort((a, b) => a.concepto.localeCompare(b.concepto));
    for (const g of gastosOrdenados) {
      saldo -= Number(g.monto);
      rows.push({ concepto: g.concepto, tipo: "salida", importe: Number(g.monto), saldo });
    }

    return rows;
  }, [saldoInicial, efectivoIngresado, gastosDelDia]);

  // ─── Guardar ──────────────────────────────────────────────────────────────
  const guardar = () => {
    const p: Planilla = {
      id: uid(),
      fecha: f.fecha,
      sucursal: f.sucursal,
      total: f.total,
      transferencia: f.transferencia,
      posnet: f.posnet,
      gastos: String(totalGastosEfectivo),
      gastosModoManual: modoGastosManual,
      pedidos_ing: f.pedidos_ing,
      pedidos_debe: f.pedidos_debe,
      debe_haber: f.debe_haber,
      hay: f.hay,
      seleccionada: { habia: f.s_habia, ingreso: f.s_ingreso, prod: f.s_prod, quedan: f.s_quedan },
      cernida: { habia: f.c_habia, ingreso: f.c_ingreso, prod: f.c_prod, quedan: f.c_quedan },
      observaciones: f.obs,
      usuario: user.user,
      ts: Date.now(),
      saldoInicial: String(saldoInicial),
      rendicion: rendicion,
      diferenciaCaja: diferencia !== null ? String(diferencia) : "",
    };
    onSave(p);
    setMsg("✓ Planilla guardada");
    setTimeout(onCancel, 700);
  };

  return (
    <Card className="p-5">
      {/* ── Fecha y sucursal ── */}
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

      {/* ── Totales del día ── */}
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

        {/* Gastos del día */}
        <Field label="Gastos del día">
          <div className="space-y-2">
            <Input
              type={modoGastosManual ? "number" : "text"}
              value={modoGastosManual ? gastosManual : money(totalGastosAuto)}
              onChange={(e) => modoGastosManual && setGastosManual(e.target.value)}
              readOnly={!modoGastosManual}
              placeholder={modoGastosManual ? "Ingresá el monto" : ""}
              className={!modoGastosManual ? "bg-[var(--bg-muted)] cursor-not-allowed opacity-75" : ""}
            />
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[var(--text-muted)]">
                {modoGastosManual ? (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Modo manual activo
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Suma desde el ABM de Gastos
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (modoGastosManual) { setModoGastosManual(false); setGastosManual(""); }
                  else { setModoGastosManual(true); setGastosManual(String(totalGastosAuto)); }
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium whitespace-nowrap"
              >
                {modoGastosManual ? "Volver a automático" : "Editar manualmente"}
              </button>
            </div>

            {!modoGastosManual && (
              gastosDelDia.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic">Sin gastos cargados para esta fecha y sucursal.</p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDesglose((v) => !v)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      className={`transition-transform ${showDesglose ? "rotate-90" : ""}`}>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    {showDesglose ? "Ocultar desglose" : `Ver desglose (${gastosDelDia.length} gasto${gastosDelDia.length > 1 ? "s" : ""})`}
                  </button>
                  {showDesglose && (
                    <div className="mt-1 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-3 space-y-1">
                      {gastosDelDia.map((g) => (
                        <div key={g.id} className="flex justify-between text-xs">
                          <span className="text-[var(--text-muted)]">{g.concepto}</span>
                          <span className="font-medium tabular-nums">{money(g.monto)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-xs font-semibold pt-1.5 border-t border-[var(--border)]">
                        <span>Total</span>
                        <span className="tabular-nums">{money(totalGastosAuto)}</span>
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </Field>
      </div>

      {/* ══ SECCIÓN CAJA ══════════════════════════════════════════════════════ */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Caja — {f.sucursal}
          </p>
          <span className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Saldo inicial */}
        <div className="flex items-center justify-between rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] px-4 py-2.5 mb-3">
          <span className="text-xs font-medium text-[var(--text-muted)]">Saldo inicial (arrastre)</span>
          <span className="text-sm font-semibold tabular-nums">
            {money(saldoInicial)}
          </span>
        </div>

        {/* Tabla de movimientos */}
        {movimientos.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic mb-3">
            Sin movimientos — cargá el total del día y los gastos para ver el detalle.
          </p>
        ) : (
          <div className="rounded-xl border border-[var(--border)] overflow-hidden mb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--bg-muted)]">
                  <th className="text-left px-3 py-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Concepto</th>
                  <th className="text-right px-3 py-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Entrada</th>
                  <th className="text-right px-3 py-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Salida</th>
                  <th className="text-right px-3 py-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {/* Fila de saldo inicial */}
                <tr className="border-t border-[var(--border)] bg-slate-50/50 dark:bg-slate-800/20">
                  <td className="px-3 py-2 text-[var(--text-muted)] italic">Saldo anterior</td>
                  <td className="px-3 py-2 text-right" />
                  <td className="px-3 py-2 text-right" />
                  <td className="px-3 py-2 text-right font-medium tabular-nums">{money(saldoInicial)}</td>
                </tr>
                {movimientos.map((m, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2">{m.concepto}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                      {m.tipo === "entrada" ? money(m.importe) : ""}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-red-500 dark:text-red-400">
                      {m.tipo === "salida" ? money(m.importe) : ""}
                    </td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">{money(m.saldo)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)] bg-[var(--bg-muted)]">
                  <td className="px-3 py-2.5 font-semibold">Saldo teórico</td>
                  <td />
                  <td />
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                    {money(saldoTeorico)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Rendición y diferencia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Rendición — efectivo físico contado">
            <Input
              type="number"
              value={rendicion}
              onChange={(e) => setRendicion(e.target.value)}
              placeholder="Ingresá el efectivo contado"
            />
          </Field>

          <div className="flex flex-col justify-end">
            {diferencia !== null ? (
              <div className={`rounded-xl border px-4 py-3 ${
                diferencia === 0
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700"
                  : diferencia > 0
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
              }`}>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-0.5">Diferencia de caja</p>
                <p className={`text-lg font-bold tabular-nums ${
                  diferencia === 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : diferencia > 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {diferencia > 0 ? "+" : ""}{money(diferencia)}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {diferencia === 0 ? "✓ Caja cuadrada" : diferencia > 0 ? "Sobra efectivo" : "Falta efectivo"}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border)] px-4 py-3">
                <p className="text-xs text-[var(--text-muted)] italic">Ingresá la rendición para ver la diferencia</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ══ FIN CAJA ══════════════════════════════════════════════════════════ */}

      {/* ── Otros campos ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
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
