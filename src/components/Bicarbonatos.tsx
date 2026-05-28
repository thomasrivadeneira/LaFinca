"use client";

import { useState } from "react";
import type { Usuario, Bicarbonato } from "@/types";
import { Card, Field, Input, Button, Table, Th, Td } from "./ui";
import { uid, num } from "@/lib/defaults";

interface Props {
  user: Usuario;
  bicarbonatos: Bicarbonato[];
  onSave: (b: Bicarbonato[]) => void;
}

export default function Bicarbonatos({ user, bicarbonatos, onSave }: Props) {
  const esAdmin = user.rol === "Administrador";
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", cantidad: "" });

  const editing = editId ? bicarbonatos.find((b) => b.id === editId) ?? null : null;

  const startEdit = (b: Bicarbonato) => {
    setEditId(b.id);
    setForm({ nombre: b.nombre, cantidad: String(b.cantidad) });
  };

  const cancelar = () => { setEditId(null); setForm({ nombre: "", cantidad: "" }); };

  const guardar = () => {
    if (!form.nombre.trim()) return;
    const cantidad = Number(form.cantidad) || 0;
    if (editId) {
      onSave(bicarbonatos.map((b) => b.id === editId ? { ...b, nombre: form.nombre.trim(), cantidad } : b));
    } else {
      onSave([...bicarbonatos, { id: uid(), nombre: form.nombre.trim(), cantidad }]);
    }
    cancelar();
  };

  const borrar = (id: string) => {
    if (!esAdmin) return;
    if (confirm("¿Eliminar?")) onSave(bicarbonatos.filter((b) => b.id !== id));
  };

  const total = bicarbonatos.reduce((a, b) => a + Number(b.cantidad || 0), 0);

  return (
    <>
      <Card className="p-5 mb-4">
        <h3 className="text-sm font-medium mb-3">{editing ? "Modificar" : "Nuevo sabor"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto] gap-2 items-end">
          <Field label="Sabor"><Input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
          <Field label="Cantidad"><Input type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} /></Field>
          <div className="flex gap-2">
            <Button variant="primary" onClick={guardar}>{editing ? "Guardar" : "Agregar"}</Button>
            {editing && <Button onClick={cancelar}>Cancelar</Button>}
          </div>
        </div>
      </Card>

      <Table>
        <thead><tr><Th>Sabor</Th><Th align="right">Cantidad</Th><Th align="right">Acciones</Th></tr></thead>
        <tbody>
          {bicarbonatos.map((b) => (
            <tr key={b.id}>
              <Td>{b.nombre}</Td>
              <Td align="right">{num(b.cantidad)}</Td>
              <Td align="right">
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" onClick={() => startEdit(b)}>Editar</Button>
                  {esAdmin && <Button variant="danger" onClick={() => borrar(b.id)}>Borrar</Button>}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 dark:bg-slate-900/50">
            <Td className="font-medium">Total</Td>
            <Td align="right" className="font-medium">{num(total)}</Td>
            <Td></Td>
          </tr>
        </tfoot>
      </Table>
    </>
  );
}
