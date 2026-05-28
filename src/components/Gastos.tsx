"use client";

import { useState } from "react";
import type { Usuario, Gasto } from "@/types";
import { Card, Field, Input, Button, Table, Th, Td } from "./ui";
import { uid, money } from "@/lib/defaults";

interface Props {
  user: Usuario;
  gastos: Gasto[];
  onSave: (gastos: Gasto[]) => void;
}

export default function Gastos({ user, gastos, onSave }: Props) {
  const esAdmin = user.rol === "Administrador";
  const hoy = new Date().toISOString().slice(0, 10);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ fecha: hoy, concepto: "", monto: "" });
  const [err, setErr] = useState("");

  const editing = editId ? gastos.find((g) => g.id === editId) ?? null : null;

  const startEdit = (g: Gasto) => {
    setEditId(g.id);
    setForm({ fecha: g.fecha, concepto: g.concepto, monto: String(g.monto) });
    setErr("");
  };

  const cancelar = () => {
    setEditId(null);
    setForm({ fecha: hoy, concepto: "", monto: "" });
    setErr("");
  };

  const guardar = () => {
    if (!form.concepto.trim() || !form.monto) {
      setErr("Concepto y monto son obligatorios");
      return;
    }
    const monto = Number(form.monto);
    if (editId) {
      onSave(gastos.map((g) => (g.id === editId ? { ...g, ...form, monto } : g)));
    } else {
      onSave([...gastos, { id: uid(), fecha: form.fecha, concepto: form.concepto.trim(), monto, usuario: user.user }]);
    }
    cancelar();
  };

  const borrar = (id: string) => {
    if (!esAdmin) return;
    if (confirm("¿Eliminar este gasto?")) onSave(gastos.filter((g) => g.id !== id));
  };

  const total = gastos.reduce((a, g) => a + Number(g.monto || 0), 0);

  return (
    <>
      <Card className="p-5 mb-4">
        <h3 className="text-sm font-medium mb-3">{editing ? "Modificar gasto" : "Nuevo gasto"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr_auto] gap-2 items-end">
          <Field label="Fecha"><Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Field>
          <Field label="Concepto"><Input type="text" value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} placeholder="Ej: Heladera, escoba..." /></Field>
          <Field label="Monto"><Input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} /></Field>
          <div className="flex gap-2">
            <Button variant="primary" onClick={guardar}>{editing ? "Guardar" : "Agregar"}</Button>
            {editing && <Button onClick={cancelar}>Cancelar</Button>}
          </div>
        </div>
        {err && <div className="text-sm text-red-600 dark:text-red-400 mt-2">{err}</div>}
      </Card>

      <Table>
        <thead>
          <tr><Th>Fecha</Th><Th>Concepto</Th><Th align="right">Monto</Th><Th>Cargó</Th><Th align="right">Acciones</Th></tr>
        </thead>
        <tbody>
          {gastos.length === 0 ? (
            <tr><Td className="text-center text-slate-400">Sin gastos cargados</Td><Td></Td><Td></Td><Td></Td><Td></Td></tr>
          ) : (
            gastos.slice().reverse().map((g) => (
              <tr key={g.id}>
                <Td>{g.fecha}</Td>
                <Td>{g.concepto}</Td>
                <Td align="right">{money(g.monto)}</Td>
                <Td className="text-slate-500">{g.usuario}</Td>
                <Td align="right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" onClick={() => startEdit(g)}>Editar</Button>
                    {esAdmin && <Button variant="danger" onClick={() => borrar(g.id)}>Borrar</Button>}
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
        {gastos.length > 0 && (
          <tfoot>
            <tr className="bg-slate-50 dark:bg-slate-900/50">
              <Td className="font-medium">Total</Td>
              <Td></Td>
              <Td align="right" className="font-medium">{money(total)}</Td>
              <Td></Td><Td></Td>
            </tr>
          </tfoot>
        )}
      </Table>

      {!esAdmin && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Como operador podés agregar y editar gastos. Solo el administrador puede eliminarlos.
        </p>
      )}
    </>
  );
}
