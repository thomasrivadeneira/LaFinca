"use client";

import { useState } from "react";
import type { Usuario, Producto } from "@/types";
import { Card, Field, Input, Button, Table, Th, Td } from "./ui";
import { uid, money, num } from "@/lib/defaults";

interface Props {
  user: Usuario;
  productos: Producto[];
  onSave: (productos: Producto[]) => void;
}

export default function Productos({ user, productos, onSave }: Props) {
  const esAdmin = user.rol === "Administrador";
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", precio: "", stock: "" });
  const [filtro, setFiltro] = useState("");

  const editing = editId ? productos.find((p) => p.id === editId) ?? null : null;

  const startEdit = (p: Producto) => {
    setEditId(p.id);
    setForm({ nombre: p.nombre, precio: String(p.precio), stock: String(p.stock) });
  };

  const cancelar = () => {
    setEditId(null);
    setForm({ nombre: "", precio: "", stock: "" });
  };

  const guardar = () => {
    if (!form.nombre.trim()) return;
    const precio = Number(form.precio) || 0;
    const stock = Number(form.stock) || 0;
    if (editId) {
      onSave(productos.map((p) => p.id === editId ? { ...p, nombre: form.nombre.trim(), precio, stock } : p));
    } else {
      onSave([...productos, { id: uid(), nombre: form.nombre.trim(), precio, stock }]);
    }
    cancelar();
  };

  const borrar = (id: string) => {
    if (!esAdmin) return;
    if (confirm("¿Eliminar este producto?")) onSave(productos.filter((p) => p.id !== id));
  };

  const filtrados = productos.filter((p) => p.nombre.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <>
      <Card className="p-5 mb-4">
        <h3 className="text-sm font-medium mb-3">{editing ? "Modificar producto" : "Nuevo producto"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
          <Field label="Producto"><Input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
          <Field label="Precio"><Input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></Field>
          <Field label="Stock"><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
          <div className="flex gap-2">
            <Button variant="primary" onClick={guardar}>{editing ? "Guardar" : "Agregar"}</Button>
            {editing && <Button onClick={cancelar}>Cancelar</Button>}
          </div>
        </div>
      </Card>

      <div className="mb-2">
        <Input type="text" placeholder="🔍 Buscar producto..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
      </div>

      <Table>
        <thead><tr><Th>Producto</Th><Th align="right">Precio</Th><Th align="right">Stock</Th><Th align="right">Acciones</Th></tr></thead>
        <tbody>
          {filtrados.length === 0 ? (
            <tr><Td className="text-center text-slate-400">Sin productos</Td><Td></Td><Td></Td><Td></Td></tr>
          ) : (
            filtrados.map((p) => (
              <tr key={p.id}>
                <Td>{p.nombre}</Td>
                <Td align="right">{money(p.precio)}</Td>
                <Td align="right">{num(p.stock)}</Td>
                <Td align="right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" onClick={() => startEdit(p)}>Editar</Button>
                    {esAdmin && <Button variant="danger" onClick={() => borrar(p.id)}>Borrar</Button>}
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
