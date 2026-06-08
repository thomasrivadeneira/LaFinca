"use client";

import { useEffect, useState, useCallback } from "react";
import type { Usuario, Gasto, Producto, Bicarbonato, CernidaSelRegistro, Planilla, Sucursal, TipoGasto, Cliente, Venta, ArticuloVenta, Cobro, MedioPago } from "@/types";
import { supabase } from "./supabase";

export interface AppData {
  usuarios: Usuario[];
  gastos: Gasto[];
  productos: Producto[];
  bicarbonatos: Bicarbonato[];
  cernidaSel: CernidaSelRegistro[];
  planillas: Planilla[];
  tiposGastos: TipoGasto[];
  clientes: Cliente[];
  ventas: Venta[];
  cobros: Cobro[];
}

const emptyData: AppData = {
  usuarios: [],
  gastos: [],
  productos: [],
  bicarbonatos: [],
  cernidaSel: [],
  planillas: [],
  tiposGastos: [],
  clientes: [],
  ventas: [],
  cobros: [],
};

function normalizeSucursal(s: unknown): Sucursal {
  if (typeof s !== "string") return "Belgrano";
  return s.toLowerCase().trim() === "roca" ? "Roca" : "Belgrano";
}

// ─── Mappers Supabase row → tipos locales ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToUsuario(r: any): Usuario {
  return { id: r.id, user: r.user, pass: r.pass, rol: r.rol, activo: r.activo };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToGasto(r: any): Gasto {
  return {
    id: r.id,
    fecha: r.fecha,
    sucursal: normalizeSucursal(r.sucursal),
    tipo_gasto_id: r.tipo_gasto_id ?? null,
    concepto: r.concepto ?? "",
    monto: Number(r.monto),
    usuario: r.usuario,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTipoGasto(r: any): TipoGasto {
  return { id_gastos: r.id_gastos, gasto: r.gasto };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCliente(r: any): Cliente {
  return { id: r.id, nombre: r.nombre };
}

function normalizeArticulo(a: unknown): ArticuloVenta {
  return a === "CERNIDA" ? "CERNIDA" : "SELECCIONADA";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToVenta(r: any): Venta {
  return {
    id: r.id,
    fecha: r.fecha,
    sucursal: normalizeSucursal(r.sucursal),
    cliente_id: r.cliente_id ?? null,
    cliente: r.cliente ?? "",
    articulo: normalizeArticulo(r.articulo),
    cantidad: Number(r.cantidad),
    precio: Number(r.precio),
    total: Number(r.total),
    usuario: r.usuario,
  };
}

function normalizeMedio(m: unknown): MedioPago {
  if (m === "Transferencia" || m === "Posnet/QR") return m;
  return "Efectivo";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCobro(r: any): Cobro {
  return {
    id: r.id,
    venta_id: r.venta_id,
    fecha: r.fecha,
    importe: Number(r.importe),
    medio: normalizeMedio(r.medio),
    observacion: r.observacion ?? "",
    usuario: r.usuario,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPlanilla(r: any): Planilla {
  return {
    id: r.id,
    fecha: r.fecha,
    sucursal: normalizeSucursal(r.sucursal),
    total: r.total ?? "",
    transferencia: r.transferencia ?? "",
    posnet: r.posnet ?? "",
    gastos: r.gastos ?? "",
    gastosModoManual: r.gastos_modo_manual ?? false,
    pedidos_ing: r.pedidos_ing ?? "",
    pedidos_debe: r.pedidos_debe ?? "",
    debe_haber: r.debe_haber ?? "",
    hay: r.hay ?? "",
    seleccionada: r.seleccionada ?? { habia: "", ingreso: "", prod: "", quedan: "" },
    cernida: r.cernida ?? { habia: "", ingreso: "", prod: "", quedan: "" },
    observaciones: r.observaciones ?? "",
    usuario: r.usuario,
    ts: Number(r.ts),
    saldoInicial: r.saldo_inicial ?? "",
    rendicion: r.rendicion ?? "",
    diferenciaCaja: r.diferencia_caja ?? "",
  };
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useAppData() {
  const [data, setData] = useState<AppData>(emptyData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [usuarios, gastos, planillas, tiposGastos, clientes, ventas, cobros] = await Promise.all([
          supabase.from("usuarios").select("*").order("user"),
          supabase.from("gastos").select("*").order("fecha", { ascending: false }),
          supabase.from("planillas").select("*").order("fecha", { ascending: false }),
          supabase.from("tipos_gastos").select("*").order("id_gastos"),
          supabase.from("clientes").select("*").order("nombre"),
          supabase.from("ventas").select("*").order("fecha", { ascending: false }),
          supabase.from("cobros").select("*").order("fecha", { ascending: false }),
        ]);

        if (usuarios.error)    console.error("[Supabase] usuarios:", usuarios.error);
        if (gastos.error)      console.error("[Supabase] gastos:", gastos.error);
        if (planillas.error)   console.error("[Supabase] planillas:", planillas.error);
        if (tiposGastos.error) console.error("[Supabase] tipos_gastos:", tiposGastos.error);
        if (clientes.error)    console.error("[Supabase] clientes:", clientes.error);
        if (ventas.error)      console.error("[Supabase] ventas:", ventas.error);
        if (cobros.error)      console.error("[Supabase] cobros:", cobros.error);

        setData({
          usuarios: (usuarios.data ?? []).map(rowToUsuario),
          gastos: (gastos.data ?? []).map(rowToGasto),
          planillas: (planillas.data ?? []).map(rowToPlanilla),
          tiposGastos: (tiposGastos.data ?? []).map(rowToTipoGasto),
          clientes: (clientes.data ?? []).map(rowToCliente),
          ventas: (ventas.data ?? []).map(rowToVenta),
          cobros: (cobros.data ?? []).map(rowToCobro),
          productos: [],
          bicarbonatos: [],
          cernidaSel: [],
        });
      } catch (e) {
        console.error("[Supabase] Error crítico cargando datos:", e);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const update = useCallback((mut: (d: AppData) => AppData) => {
    setData((prev) => mut(prev));
  }, []);

  return { data, setData, loaded, update };
}

// ─── Helpers de persistencia ──────────────────────────────────────────────────

export async function savePlanilla(p: Planilla): Promise<void> {
  const { error } = await supabase.from("planillas").upsert({
    id: p.id,
    fecha: p.fecha,
    sucursal: p.sucursal,
    total: p.total,
    transferencia: p.transferencia,
    posnet: p.posnet,
    gastos: p.gastos,
    gastos_modo_manual: p.gastosModoManual ?? false,
    pedidos_ing: p.pedidos_ing,
    pedidos_debe: p.pedidos_debe,
    debe_haber: p.debe_haber,
    hay: p.hay,
    seleccionada: p.seleccionada,
    cernida: p.cernida,
    observaciones: p.observaciones,
    usuario: p.usuario,
    ts: p.ts,
    saldo_inicial: p.saldoInicial ?? "",
    rendicion: p.rendicion ?? "",
    diferencia_caja: p.diferenciaCaja ?? "",
  });
  if (error) console.error("[Supabase] savePlanilla:", error);
}

export async function deletePlanilla(id: string): Promise<void> {
  const { error } = await supabase.from("planillas").delete().eq("id", id);
  if (error) console.error("[Supabase] deletePlanilla:", error);
}

export async function saveGasto(g: Gasto): Promise<void> {
  const { error } = await supabase.from("gastos").upsert({
    id: g.id,
    fecha: g.fecha,
    sucursal: g.sucursal,
    tipo_gasto_id: g.tipo_gasto_id ?? null,
    concepto: g.concepto,
    monto: g.monto,
    usuario: g.usuario,
  });
  if (error) console.error("[Supabase] saveGasto:", error);
}

export async function deleteGasto(id: string): Promise<void> {
  const { error } = await supabase.from("gastos").delete().eq("id", id);
  if (error) console.error("[Supabase] deleteGasto:", error);
}

export async function saveUsuario(u: Usuario): Promise<void> {
  const { error } = await supabase.from("usuarios").upsert({
    id: u.id,
    user: u.user,
    pass: u.pass,
    rol: u.rol,
    activo: u.activo,
  });
  if (error) console.error("[Supabase] saveUsuario:", error);
}

export async function deleteUsuario(id: string): Promise<void> {
  const { error } = await supabase.from("usuarios").delete().eq("id", id);
  if (error) console.error("[Supabase] deleteUsuario:", error);
}

export async function saveVenta(v: Venta): Promise<void> {
  const { error } = await supabase.from("ventas").upsert({
    id: v.id,
    fecha: v.fecha,
    sucursal: v.sucursal,
    cliente_id: v.cliente_id ?? null,
    cliente: v.cliente,
    articulo: v.articulo,
    cantidad: v.cantidad,
    precio: v.precio,
    total: v.total,
    usuario: v.usuario,
  });
  if (error) console.error("[Supabase] saveVenta:", error);
}

export async function deleteVenta(id: string): Promise<void> {
  const { error } = await supabase.from("ventas").delete().eq("id", id);
  if (error) console.error("[Supabase] deleteVenta:", error);
}

export async function saveCobro(c: Cobro): Promise<void> {
  const { error } = await supabase.from("cobros").upsert({
    id: c.id,
    venta_id: c.venta_id,
    fecha: c.fecha,
    importe: c.importe,
    medio: c.medio,
    observacion: c.observacion,
    usuario: c.usuario,
  });
  if (error) console.error("[Supabase] saveCobro:", error);
}

export async function deleteCobro(id: string): Promise<void> {
  const { error } = await supabase.from("cobros").delete().eq("id", id);
  if (error) console.error("[Supabase] deleteCobro:", error);
}
