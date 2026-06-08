"use client";

import { useState } from "react";
import type { Usuario, Planilla, Gasto, Sucursal, TipoGasto } from "@/types";
import { Card, Field, Input, Select, Textarea, Button } from "./ui";
import { uid, money, SUCURSALES } from "@/lib/defaults";
import { saveGasto, deleteGasto } from "@/lib/useAppData";

interface Props {
  user: Usuario;
  gastos: Gasto[];
  tiposGastos: TipoGasto[];
  onSave: (p: Planilla) => void;
  onCancel: () => void;
  onGastoAdded: (g: Gasto) => void;
  onGastoDeleted: (id: string) => void;
  editing?: Planilla | null;
}

export default function PlanillaForm({ user, gastos, tiposGastos, onSave, onCancel, onGastoAdded, onGastoDeleted, editing = null }: Props) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState(() => editing ? {
    fecha: editing.fecha,
    sucursal: editing.sucursal,
    total: editing.total, transferencia: editing.transferencia, posnet: editing.posnet,
    pedidos_ing: editing.pedidos_ing, pedidos_debe: editing.pedidos_debe, debe_haber: editing.debe_haber, hay: editing.hay,
    s_habia: editing.seleccionada.habia, s_ingreso: editing.seleccionada.ingreso, s_prod: editing.seleccionada.prod, s_quedan: editing.seleccionada.quedan,
    c_habia: editing.cernida.habia, c_ingreso: editing.cernida.ingreso, c_prod: editing.cernida.prod, c_quedan: editing.cernida.quedan,
    obs: editing.observaciones,
  } : {
    fecha: hoy,
    sucursal: "Belgrano" as Sucursal,
    total: "", transferencia: "", posnet: "",
    pedidos_ing: "", pedidos_debe: "", debe_haber: "", hay: "",
    s_habia: "", s_ingreso: "", s_prod: "", s_quedan: "",
    c_habia: "", c_ingreso: "", c_prod: "", c_quedan: "",
    obs: "",
  });
  const [msg, setMsg] = useState("");

  // Gastos inline
  const [tipoGastoId, setTipoGastoId] = useState<number | "">("");
  const [montoGasto, setMontoGasto] = useState("");
  const [guardandoGasto, setGuardandoGasto] = useState(false);
  const [errGasto, setErrGasto] = useState("");

  const set = (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value });

  const gastosDelDia = gastos.filter(
    (g) => g.fecha === f.fecha && g.sucursal === f.sucursal
  );
  const totalGastos = gastosDelDia.reduce((a, g) => a + Number(g.monto || 0), 0);

  const agregarGasto = async () => {
    if (!tipoGastoId) { setErrGasto("Seleccioná un tipo de gasto"); return; }
    if (!montoGasto || Number(montoGasto) <= 0) { setErrGasto("Ingresá un monto válido"); return; }
    const tipo = tiposGastos.find((t) => t.id_gastos === Number(tipoGastoId));
    if (!tipo) return;
    setGuardandoGasto(true);
    const g: Gasto = {
      id: uid(),
      fecha: f.fecha,
      sucursal: f.sucursal,
      tipo_gasto_id: tipo.id_gastos,
      concepto: tipo.gasto,
      monto: Number(montoGasto),
      usuario: user.user,
    };
    await saveGasto(g);
    onGastoAdded(g);
    setTipoGastoId("");
    setMontoGasto("");
    setErrGasto("");
    setGuardandoGasto(false);
  };

  const borrarGasto = async (id: string) => {
    if (!confirm("¿Eliminar este gasto?")) return;
    await deleteGasto(id);
    onGastoDeleted(id);
  };

  const guardar = () => {
    const p: Planilla = {
      id: editing?.id ?? uid(),
      fecha: f.fecha,
      sucursal: f.sucursal,
      total: f.total,
      transferencia: f.transferencia,
      posnet: f.posnet,
      gastos: String(totalGastos),
      gastosModoManual: editing?.gastosModoManual ?? false,
      pedidos_ing: f.pedidos_ing,
      pedidos_debe: f.pedidos_debe,
      debe_haber: f.debe_haber,
      hay: f.hay,
      seleccionada: { habia: f.s_habia, ingreso: f.s_ingreso, prod: f.s_prod, quedan: f.s_quedan },
      cernida: { habia: f.c_habia, ingreso: f.c_ingreso, prod: f.c_prod, quedan: f.c_quedan },
      observaciones: f.obs,
      usuario: editing?.usuario ?? user.user,
      ts: editing?.ts ?? Date.now(),
      saldoInicial: editing?.saldoInicial ?? "",
      rendicion: editing?.rendicion ?? "",
      diferenciaCaja: editing?.diferenciaCaja ?? "",
    };
    onSave(p);
    setMsg(editing ? "✓ Planilla actualizada" : "✓ Planilla guardada");
    setTimeout(onCancel, 700);
  };

  return (
    <Card className="p-5">
      {editing && (
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4">
          Editando planilla del {editing.fecha} ({editing.sucursal})
        </p>
      )}

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Total">
          <Input type="number" value={f.total} onChange={set("total")} />
        </Field>
        <Field label="Transferencia">
          <Input type="number" value={f.transferencia} onChange={set("transferencia")} />
        </Field>
        <Field label="Posnet / QR">
          <Input type="number" value={f.posnet} onChange={set("posnet")} />
        </Field>
      </div>

      {/* ── Gastos del día ── */}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Gastos del día
        </p>

        {tiposGastos.length === 0 ? (
          <p className="text-xs text-amber-600 dark:text-amber-400 italic mb-3">
            No hay tipos de gasto cargados. Agregá tipos en Configuración → Tipos de gastos.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto] gap-2 items-end mb-3">
            <Field label="Tipo de gasto">
              <Select
                value={tipoGastoId}
                onChange={(e) => setTipoGastoId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">— Seleccioná un tipo —</option>
                {tiposGastos.map((t) => (
                  <option key={t.id_gastos} value={t.id_gastos}>{t.gasto}</option>
                ))}
              </Select>
            </Field>
            <Field label="Monto">
              <Input
                type="number"
                value={montoGasto}
                onChange={(e) => setMontoGasto(e.target.value)}
                placeholder="0"
                onKeyDown={(e) => e.key === "Enter" && agregarGasto()}
              />
            </Field>
            <Button variant="primary" onClick={agregarGasto} disabled={guardandoGasto}>
              Agregar
            </Button>
          </div>
        )}

        {errGasto && <p className="text-xs text-red-600 dark:text-red-400 mb-2">{errGasto}</p>}

        {gastosDelDia.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">Sin gastos cargados para esta fecha y sucursal.</p>
        ) : (
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--bg-muted)]">
                  <th className="text-left px-3 py-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tipo</th>
                  <th className="text-right px-3 py-2 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Monto</th>
                  <th className="w-16 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {gastosDelDia.map((g) => (
                  <tr key={g.id} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2">{g.concepto}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{money(g.monto)}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => borrarGasto(g.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors font-medium"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)] bg-[var(--bg-muted)]">
                  <td className="px-3 py-2.5 font-semibold text-sm">Total gastos</td>
                  <td className="px-3 py-2.5 text-right font-bold tabular-nums text-fuchsia-600 dark:text-fuchsia-400">{money(totalGastos)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

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
        <Button variant="primary" onClick={guardar}>{editing ? "Guardar cambios" : "Guardar planilla"}</Button>
        <Button onClick={onCancel}>Cancelar</Button>
      </div>
    </Card>
  );
}
