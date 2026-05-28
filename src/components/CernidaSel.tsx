"use client";

import { useState } from "react";
import type { Usuario, CernidaSelRegistro } from "@/types";
import { Card, Field, Input, Select, Button, Table, Th, Td } from "./ui";
import { uid, money, num, PRECIOS_CS } from "@/lib/defaults";

interface Props {
  user: Usuario;
  registros: CernidaSelRegistro[];
  onSave: (r: CernidaSelRegistro[]) => void;
}

export default function CernidaSel({ user, registros, onSave }: Props) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    fecha: hoy,
    tipo: "Cernida" as CernidaSelRegistro["tipo"],
    precio: "1000",
    cantidad: "1",
  });

  const guardar = () => {
    onSave([
      ...registros,
      {
        id: uid(),
        fecha: form.fecha,
        tipo: form.tipo,
        precio: Number(form.precio),
        cantidad: Number(form.cantidad) || 0,
        usuario: user.user,
      },
    ]);
  };

  return (
    <>
      <Card className="p-5 mb-4">
        <h3 className="text-sm font-medium mb-3">Nuevo registro</h3>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end">
          <Field label="Fecha"><Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Field>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as CernidaSelRegistro["tipo"] })}>
              <option>Cernida</option>
              <option>Seleccionada</option>
              <option>Machucada</option>
            </Select>
          </Field>
          <Field label="Precio">
            <Select value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })}>
              {PRECIOS_CS.map((p) => <option key={p} value={p}>{money(p)}</option>)}
            </Select>
          </Field>
          <Field label="Cantidad"><Input type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} /></Field>
          <Button variant="primary" onClick={guardar}>Agregar</Button>
        </div>
      </Card>

      <Table>
        <thead><tr><Th>Fecha</Th><Th>Tipo</Th><Th>Precio</Th><Th align="right">Cantidad</Th><Th align="right">Subtotal</Th></tr></thead>
        <tbody>
          {registros.length === 0 ? (
            <tr><Td className="text-center text-slate-400">Sin registros</Td><Td></Td><Td></Td><Td></Td><Td></Td></tr>
          ) : (
            registros.slice().reverse().map((r) => (
              <tr key={r.id}>
                <Td>{r.fecha}</Td>
                <Td>{r.tipo}</Td>
                <Td>{money(r.precio)}</Td>
                <Td align="right">{num(r.cantidad)}</Td>
                <Td align="right">{money(r.precio * r.cantidad)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
