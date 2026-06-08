"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { TipoGasto } from "@/types";
import { Card, Field, Input, Button, Table, Th, Td } from "./ui";

interface Props {
  onChange?: (tipos: TipoGasto[]) => void;
}

export default function TiposGastos({ onChange }: Props) {
  const [tipos, setTipos] = useState<TipoGasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoGasto, setNuevoGasto] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editGasto, setEditGasto] = useState("");
  const [err, setErr] = useState("");
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    setDbError(null);
    const { data, error } = await supabase
      .from("tipos_gastos")
      .select("*")
      .order("id_gastos");
    if (error) {
      console.error("[Supabase] tipos_gastos SELECT error:", error);
      setDbError(`[${error.code}] ${error.message}${error.details ? " — " + error.details : ""}${error.hint ? " | Hint: " + error.hint : ""}`);
    } else {
      const lista = (data ?? []).map((r) => ({ id_gastos: r.id_gastos, gasto: r.gasto }));
      setTipos(lista);
      onChange?.(lista);
    }
    setLoading(false);
  };

  const agregar = async () => {
    const g = nuevoGasto.trim();
    if (!g) { setErr("Ingresá un nombre de gasto"); return; }
    if (g.length > 20) { setErr("Máximo 20 caracteres"); return; }
    const { error } = await supabase.from("tipos_gastos").insert({ gasto: g });
    if (error) {
      console.error("[Supabase] tipos_gastos INSERT error:", error);
      setErr(`[${error.code}] ${error.message}`);
      return;
    }
    setNuevoGasto("");
    setErr("");
    cargar();
  };

  const guardarEdicion = async () => {
    const g = editGasto.trim();
    if (!g) { setErr("Ingresá un nombre"); return; }
    if (g.length > 20) { setErr("Máximo 20 caracteres"); return; }
    const { error } = await supabase
      .from("tipos_gastos")
      .update({ gasto: g })
      .eq("id_gastos", editId);
    if (error) {
      console.error("[Supabase] tipos_gastos UPDATE error:", error);
      setErr(`[${error.code}] ${error.message}`);
      return;
    }
    setEditId(null);
    setEditGasto("");
    setErr("");
    cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este tipo de gasto?")) return;
    const { error } = await supabase.from("tipos_gastos").delete().eq("id_gastos", id);
    if (error) {
      console.error("[Supabase] tipos_gastos DELETE error:", error);
      setErr(`[${error.code}] ${error.message}`);
      return;
    }
    cargar();
  };

  return (
    <>
      {/* Panel de error de base de datos */}
      {dbError && (
        <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
            Error de conexión con Supabase
          </p>
          <p className="text-xs text-red-600 dark:text-red-300 font-mono break-all">{dbError}</p>
          <div className="mt-3 text-xs text-red-600 dark:text-red-400 space-y-1">
            <p className="font-semibold">Ejecutá este SQL en Supabase → SQL Editor:</p>
            <pre className="bg-red-100 dark:bg-red-900/40 rounded p-2 overflow-x-auto text-[11px] select-all">{SQL_FIX}</pre>
          </div>
          <button
            onClick={cargar}
            className="mt-3 text-xs font-medium text-red-700 dark:text-red-400 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <Card className="p-5 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Nuevo tipo de gasto
        </p>
        <div className="flex gap-2 items-end">
          <Field label="Nombre (máx. 20 caracteres)">
            <Input
              type="text"
              value={nuevoGasto}
              onChange={(e) => setNuevoGasto(e.target.value.slice(0, 20))}
              placeholder="Ej: Limpieza"
              onKeyDown={(e) => e.key === "Enter" && agregar()}
            />
          </Field>
          <Button variant="primary" onClick={agregar}>Agregar</Button>
        </div>
        {err && <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-mono">{err}</p>}
      </Card>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando...</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Gasto</Th>
              <Th align="right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {tipos.length === 0 ? (
              <tr>
                <Td className="text-center text-[var(--text-muted)]">Sin tipos de gasto cargados</Td>
                <Td /><Td />
              </tr>
            ) : (
              tipos.map((t) => (
                <tr key={t.id_gastos}>
                  <Td className="text-[var(--text-muted)] w-16">{t.id_gastos}</Td>
                  <Td>
                    {editId === t.id_gastos ? (
                      <Input
                        type="text"
                        value={editGasto}
                        onChange={(e) => setEditGasto(e.target.value.slice(0, 20))}
                        onKeyDown={(e) => e.key === "Enter" && guardarEdicion()}
                        autoFocus
                      />
                    ) : (
                      t.gasto
                    )}
                  </Td>
                  <Td align="right">
                    <div className="flex gap-1 justify-end">
                      {editId === t.id_gastos ? (
                        <>
                          <Button size="sm" variant="primary" onClick={guardarEdicion}>Guardar</Button>
                          <Button size="sm" onClick={() => { setEditId(null); setEditGasto(""); setErr(""); }}>Cancelar</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => { setEditId(t.id_gastos); setEditGasto(t.gasto); setErr(""); }}>Editar</Button>
                          <Button size="sm" variant="danger" onClick={() => eliminar(t.id_gastos)}>Borrar</Button>
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </>
  );
}

const SQL_FIX = `-- Paso 1: crear tabla
CREATE TABLE IF NOT EXISTS public.tipos_gastos (
  id_gastos SERIAL PRIMARY KEY,
  gasto VARCHAR(20) NOT NULL
);

-- Paso 2: deshabilitar RLS
ALTER TABLE public.tipos_gastos DISABLE ROW LEVEL SECURITY;

-- Paso 3: dar permisos al rol anon
GRANT ALL ON TABLE public.tipos_gastos TO anon;
GRANT ALL ON TABLE public.tipos_gastos TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.tipos_gastos_id_gastos_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.tipos_gastos_id_gastos_seq TO authenticated;

-- Paso 4: forzar recarga del schema cache de PostgREST
NOTIFY pgrst, 'reload schema';`;
