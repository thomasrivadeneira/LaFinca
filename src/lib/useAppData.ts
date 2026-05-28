"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  Usuario,
  Gasto,
  Producto,
  Bicarbonato,
  CernidaSelRegistro,
  Planilla,
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

export function useAppData() {
  const [data, setData] = useState<AppData>(initialData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData({ ...initialData, ...parsed });
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

  const update = useCallback(
    (mut: (d: AppData) => AppData) => {
      setData((prev) => {
        const next = mut(prev);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error("Error guardando datos", e);
        }
        return next;
      });
    },
    []
  );

  return { data, loaded, save, update };
}
