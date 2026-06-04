"use client";

import { useEffect, useState, useCallback } from "react";
import type { Usuario, Gasto, Producto, Bicarbonato, CernidaSelRegistro, Planilla, Sucursal } from "@/types";
import { supabase } from "./supabase";

export interface AppData {
  usuarios: Usuario[];
  gastos: Gasto[];
  productos: Producto[];
  bicarbonatos: Bicarbonato[];
  cernidaSel: CernidaSelRegistro[];
  planillas: Planilla[];
}

const emptyData: AppData = {
  usuarios: [],
  gastos: [],
  productos: [],
  bicarbonatos: [],
  cernidaSel: [],
  planillas: [],
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
    concepto: r.concepto,
    monto: Number(r.monto),
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

  // Carga inicial: trae todas las tablas en paralelo
  useEffect(() => {
    async function load() {
      try {
        const [usuarios, gastos, planillas] = await Promise.all([
          supabase.from("usuarios").select("*").order("user"),
          supabase.from("gastos").select("*").order("fecha", { ascending: false }),
          supabase.from("planillas").select("*").order("fecha", { ascending: false }),
        ]);

        if (usuarios.error) console.error("[Supabase] usuarios:", usuarios.error);
        if (gastos.error)   console.error("[Supabase] gastos:",   gastos.error);
        if (planillas.error) console.error("[Supabase] planillas:", planillas.error);

        setData({
          usuarios: (usuarios.data ?? []).map(rowToUsuario),
          gastos: (gastos.data ?? []).map(rowToGasto),
          planillas: (planillas.data ?? []).map(rowToPlanilla),
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

  // update: recibe una función mutadora igual que antes,
  // pero también persiste los cambios en Supabase.
  // Para granularidad fina, cada componente llama a los helpers de abajo.
  const update = useCallback((mut: (d: AppData) => AppData) => {
    setData((prev) => mut(prev));
  }, []);

  return { data, setData, loaded, update };
}

// ─── Helpers de persistencia (usan supabase directamente) ────────────────────

// PLANILLAS
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

// GASTOS
export async function saveGasto(g: Gasto): Promise<void> {
  const { error } = await supabase.from("gastos").upsert({
    id: g.id,
    fecha: g.fecha,
    sucursal: g.sucursal,
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

// USUARIOS
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
