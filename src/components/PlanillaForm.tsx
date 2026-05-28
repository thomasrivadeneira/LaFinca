"use client";

import { useState } from "react";
import type { Usuario, Planilla } from "@/types";
import { Card, Field, Input, Textarea, Button } from "./ui";
import { uid } from "@/lib/defaults";

interface Props {
  user: Usuario;
  onSave: (p: Planilla) => void;
  onCancel: () => void;
}

export default function PlanillaForm({ user, onSave, onCancel }: Props) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({
    fecha: hoy, sucursal: "Belgrano",
    total: "", transferencia: "", posnet: "", gastos: "",
    pedidos_ing: "", pedidos_debe: "", debe_haber: "", hay: "",
    s_habia: "", s_ingreso: "", s_prod: "", s_quedan: "",
    c_habia: "", c_ingreso: "", c_prod: "", c_quedan: "",
    obs: "",
  });
  const [msg, setMsg] = useState("");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const guardar = () => {
    const p: Planilla = {
      id: uid(), fecha: f.fecha, sucursal: f.sucursal,
      total: f.total, transferencia: f.transferencia, posnet: f.posnet, gastos: f.gastos,
      pedidos_ing: f.pedidos_ing, pedidos_debe: f.pedidos_debe,
      debe_haber: f.debe_haber, hay: f.hay,
      seleccionada: { habia: f.s_habia, ingreso: f.s_ingreso, prod: f.s_prod, quedan: f.s_quedan },
      cernida: { habia: f.c_habia, ingreso: f.c_ingreso, prod: f.c_prod, quedan: f.c_quedan },
      observaciones: f.obs, usuario: user.user, ts: Date.now(),
    };
    onSave(p);
    setMsg("✓ Planilla guardada");
    setTimeout(onCancel, 700);
  };

  return (
    <Card className="p-5">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Fecha"><Input type="date" value={f.fecha} onChange={set("fecha")} /></Field>
        <Field label="Sucursal"><Input type="text" value={f.sucursal} onChange={set("sucursal")} /></Field>
      </div>

      <h3 className="text-sm font-medium mt-4 mb-2">Totales del día</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Total"><Input type="number" value={f.total} onChange={set("total")} /></Field>
        <Field label="Transferencia"><Input type="number" value={f.transferencia} onChange={set("transferencia")} /></Field>
        <Field label="Posnet / QR"><Input type="number" value={f.posnet} onChange={set("posnet")} /></Field>
        <Field label="Gastos"><Input type="number" value={f.gastos} onChange={set("gastos")} /></Field>
        <Field label="Pedidos ingresos"><Input type="number" value={f.pedidos_ing} onChange={set("pedidos_ing")} /></Field>
        <Field label="Pedidos debe"><Input type="number" value={f.pedidos_debe} onChange={set("pedidos_debe")} /></Field>
        <Field label="Debe / Haber"><Input type="number" value={f.debe_haber} onChange={set("debe_haber")} /></Field>
        <Field label="Hay"><Input type="number" value={f.hay} onChange={set("hay")} /></Field>
      </div>

      <h3 className="text-sm font-medium mt-5 mb-2">Seleccionada (kg)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Había"><Input type="number" value={f.s_habia} onChange={set("s_habia")} /></Field>
        <Field label="Ingresaron"><Input type="number" value={f.s_ingreso} onChange={set("s_ingreso")} /></Field>
        <Field label="Producción"><Input type="number" value={f.s_prod} onChange={set("s_prod")} /></Field>
        <Field label="Quedan"><Input type="number" value={f.s_quedan} onChange={set("s_quedan")} /></Field>
      </div>

      <h3 className="text-sm font-medium mt-5 mb-2">Cernida (kg)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Había"><Input type="number" value={f.c_habia} onChange={set("c_habia")} /></Field>
        <Field label="Ingresaron"><Input type="number" value={f.c_ingreso} onChange={set("c_ingreso")} /></Field>
        <Field label="Producción"><Input type="number" value={f.c_prod} onChange={set("c_prod")} /></Field>
        <Field label="Quedan"><Input type="number" value={f.c_quedan} onChange={set("c_quedan")} /></Field>
      </div>

      <div className="mt-4">
        <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Observaciones</label>
        <Textarea rows={2} value={f.obs} onChange={set("obs")} placeholder="Ej: Sobran $2.400 / Falta en mercadería 2.400" />
      </div>

      {msg && <div className="text-sm text-green-600 dark:text-green-400 mt-3">{msg}</div>}

      <div className="flex gap-2 mt-4">
        <Button variant="primary" onClick={guardar}>Guardar planilla</Button>
        <Button onClick={onCancel}>Cancelar</Button>
      </div>
    </Card>
  );
}
