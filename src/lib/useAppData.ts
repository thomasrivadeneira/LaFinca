"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  Usuario,
  Gasto,
  Producto,
  Bicarbonato,
  CernidaSelRegistro,
  Planilla,
  Sucursal,
} from "@/types";
import {
  USUARIOS_DEFAULT,
  PRODUCTOS_DEFAULT,
  BICAS_DEFAULT,
  uid,
} from "./defaults";

const STORAGE_KEY = "planillas-belgrano-v1";

export interface AppData {
  usuarios: Usuario[];
  gastos: Gasto[];
  productos: Producto[];
  bicarbonatos: Bicarbonato[];
  cernidaSel: CernidaSelRegistro[];
  planillas: Planilla[];
}

const initialData: AppData = {
  usuarios: USUARIOS_DEFAULT,
  gastos: [],
  productos: PRODUCTOS_DEFAULT.map((p) => ({ ...p, id: uid() })),
  bicarbonatos: BICAS_DEFAULT.map((b) => ({ ...b, id: uid() })),
  cernidaSel: [],
  planillas: [],
};

function normalizeSucursal(s: unknown): Sucursal {
  if (typeof s !== "string") return "Belgrano";
  const lower = s.toLowerCase().trim();
  if (lower === "roca") return "Roca";
  return "Belgrano";
}

function migrateData(parsed: Partial<AppData>): AppData {
  const gastos: Gasto[] = (parsed.gastos ?? []).map((g) => ({
    ...g,
    sucursal: normalizeSucursal((g as Gasto & { sucursal?: unknown }).sucursal),
  }));

  const planillas: Planilla[] = (parsed.planillas ?? []).map((p) => ({
    ...p,
    sucursal: normalizeSucursal(p.sucursal),
  }));

  return {
    ...initialData,
    ...parsed,
    gastos,
    planillas,
  };
}

export function useAppData() {
  const [data, setData] = useState<AppData>(initialData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppData>;
        setData(migrateData(parsed));
      }
    } catch (e) {
      console.error("Error cargando datos", e);
    }
    setLoaded(true);
  }, []);

  const save = useCallback((next: AppData) => {
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Error guardando datos", e);
    }
  }, []);

  const update = useCallback((mut: (d: AppData) => AppData) => {
    setData((prev) => {
      const next = mut(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Error guardando datos", e);
      }
      return next;
    });
  }, []);

  return { data, loaded, save, update };
}
