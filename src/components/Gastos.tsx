"use client";

import { useState } from "react";
import type { Usuario, Gasto, Sucursal, TipoGasto } from "@/types";
import { Card, Field, Input, Select, Button, Table, Th, Td, Badge } from "./ui";
import { uid, money, SUCURSALES } from "@/lib/defaults";

interface Props {
  user: Usuario;
  gastos: Gasto[];
  tiposGastos: TipoGasto[];
  onSave: (gastos: Gasto[]) => void;
}

type Filtro = "Todas" | Sucursal;

export default function Gastos({ user, gastos, tiposGastos, onSave }: Props) {
  const esAdmin = user.rol === "Administrador";
  const hoy = new Date().toISOString().slice(0, 10);

  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<{ fecha: string; sucursal: Sucursal; tipoGastoId: number | ""; monto: string }>({
    fecha: hoy,
    sucursal: "Belgrano",
    tipoGastoId: "",
    monto: "",
  });
  const [err, setErr] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todas");

  const editing = editId ? gastos.find((g) => g.id === editId) ?? null : null;

  const startEdit = (g: Gasto) => {
    setEditId(g.id);
    setForm({
      fecha: g.fecha,
      sucursal: g.sucursal,
      tipoGastoId: g.tipo_gasto_id ?? "",
      monto: String(g.monto),
    });
    setErr("");
  };

  const cancelar = () => {
    setEditId(null);
    setForm({ fecha: hoy, sucursal: "Belgrano", tipoGastoId: "", monto: "" });
    setErr("");
  };

  const guardar = () => {
    if (!form.tipoGastoId) { setErr("Seleccioná un tipo de gasto"); return; }
    if (!form.monto || Number(form.monto) <= 0) { setErr("Ingresá un monto válido"); return; }
    const tipo = tiposGastos.find((t) => t.id_gastos === Number(form.tipoGastoId));
    if (!tipo) { setErr("Tipo de gasto inválido"); return; }
    const monto = Number(form.monto);
    if (editId) {
      onSave(gastos.map((g) =>
        g.id === editId
          ? { ...g, fecha: form.fecha, sucursal: form.sucursal, tipo_gasto_id: tipo.id_gastos, concepto: tipo.gasto, monto }
          : g
      ));
    } else {
      onSave([
        ...gastos,
        {
          id: uid(),
          fecha: form.fecha,
          sucursal: form.sucursal,
          tipo_gasto_id: tipo.id_gastos,
          concepto: tipo.gasto,
          monto,
          usuario: user.user,
        },
      ]);
    }
    cancelar();
  };

  const borrar = (id: string) => {
    if (!esAdmin) return;
    if (confirm("¿Eliminar este gasto?")) onSave(gastos.filter((g) => g.id !== id));
  };

  const gastosFiltrados = filtro === "Todas" ? gastos : gastos.filter((g) => g.sucursal === filtro);
  const total = gastosFiltrados.reduce((a, g) => a + Number(g.monto || 0), 0);

  const pillBase = "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all";
  const pillActive = "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30";
  const pillInactive = "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--bg-muted)]";

  return (
    <>
      <Card className="p-5 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          {editing ? "Modificar gasto" : "Nuevo gasto"}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr_1fr_auto] gap-2 items-end">
          <Field label="Fecha">
            <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
          </Field>
          <Field label="Sucursal">
            <Select
              value={form.sucursal}
              onChange={(e) => setForm({ ...form, sucursal: e.target.value as Sucursal })}
            >
              {SUCURSALES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Tipo de gasto">
            <Select
              value={form.tipoGastoId}
              onChange={(e) => setForm({ ...form, tipoGastoId: e.target.value ? Number(e.target.value) : "" })}
            >
              <option value="">— Seleccioná —</option>
              {tiposGastos.map((t) => (
                <option key={t.id_gastos} value={t.id_gastos}>{t.gasto}</option>
              ))}
            </Select>
          </Field>
          <Field label="Monto">
            <Input
              type="number"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
            />
          </Field>
          <div className="flex gap-2">
            <Button variant="primary" onClick={guardar}>{editing ? "Guardar" : "Agregar"}</Button>
            {editing && <Button onClick={cancelar}>Cancelar</Button>}
          </div>
        </div>
        {err && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{err}</p>}
        {tiposGastos.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 italic">
            No hay tipos de gasto. Agregá tipos en Configuración → Tipos de gastos.
          </p>
        )}
      </Card>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-[var(--text-muted)] font-medium">Filtrar:</span>
        {(["Todas", ...SUCURSALES] as Filtro[]).map((op) => (
          <button
            key={op}
            onClick={() => setFiltro(op)}
            className={`${pillBase} ${filtro === op ? pillActive : pillInactive}`}
          >
            {op}
          </button>
        ))}
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Fecha</Th>
            <Th>Sucursal</Th>
            <Th>Tipo de gasto</Th>
            <Th align="right">Monto</Th>
            <Th>Cargó</Th>
            <Th align="right">Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {gastosFiltrados.length === 0 ? (
            <tr>
              <Td className="text-center text-[var(--text-muted)]" align="left">
                Sin gastos{filtro !== "Todas" ? ` para ${filtro}` : ""}
              </Td>
              <Td /><Td /><Td /><Td /><Td />
            </tr>
          ) : (
            gastosFiltrados.slice().reverse().map((g) => (
              <tr key={g.id}>
                <Td>{g.fecha}</Td>
                <Td>
                  <Badge color={g.sucursal === "Belgrano" ? "blue" : "green"}>{g.sucursal}</Badge>
                </Td>
                <Td>{g.concepto}</Td>
                <Td align="right">{money(g.monto)}</Td>
                <Td className="text-[var(--text-muted)]">{g.usuario}</Td>
                <Td align="right">
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(g)}>Editar</Button>
                    {esAdmin && (
                      <Button size="sm" variant="danger" onClick={() => borrar(g.id)}>Borrar</Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
        {gastosFiltrados.length > 0 && (
          <tfoot>
            <tr className="bg-[var(--bg-muted)]">
              <Td className="font-semibold" />
              <Td className="font-semibold text-xs text-[var(--text-muted)]">
                {filtro !== "Todas" ? filtro : "Todas"}
              </Td>
              <Td className="font-semibold">Total</Td>
              <Td align="right" className="font-semibold">{money(total)}</Td>
              <Td /><Td />
            </tr>
          </tfoot>
        )}
      </Table>

      {!esAdmin && (
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Como operador podés agregar y editar gastos. Solo el administrador puede eliminarlos.
        </p>
      )}
    </>
  );
}
