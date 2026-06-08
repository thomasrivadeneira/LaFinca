"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Cliente } from "@/types";
import { Card, Field, Input, Button, Table, Th, Td } from "./ui";

interface Props {
  onChange?: (clientes: Cliente[]) => void;
}

export default function Clientes({ onChange }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoCliente, setNuevoCliente] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [err, setErr] = useState("");
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    setDbError(null);
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nombre");
    if (error) {
      console.error("[Supabase] clientes SELECT error:", error);
      setDbError(`[${error.code}] ${error.message}${error.details ? " — " + error.details : ""}${error.hint ? " | Hint: " + error.hint : ""}`);
    } else {
      const lista = (data ?? []).map((r) => ({ id: r.id, nombre: r.nombre }));
      setClientes(lista);
      onChange?.(lista);
    }
    setLoading(false);
  };

  const agregar = async () => {
    const n = nuevoCliente.trim();
    if (!n) { setErr("Ingresá un nombre de cliente"); return; }
    if (n.length > 60) { setErr("Máximo 60 caracteres"); return; }
    const { error } = await supabase.from("clientes").insert({ nombre: n });
    if (error) {
      console.error("[Supabase] clientes INSERT error:", error);
      setErr(`[${error.code}] ${error.message}`);
      return;
    }
    setNuevoCliente("");
    setErr("");
    cargar();
  };

  const guardarEdicion = async () => {
    const n = editNombre.trim();
    if (!n) { setErr("Ingresá un nombre"); return; }
    if (n.length > 60) { setErr("Máximo 60 caracteres"); return; }
    const { error } = await supabase
      .from("clientes")
      .update({ nombre: n })
      .eq("id", editId);
    if (error) {
      console.error("[Supabase] clientes UPDATE error:", error);
      setErr(`[${error.code}] ${error.message}`);
      return;
    }
    setEditId(null);
    setEditNombre("");
    setErr("");
    cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) {
      console.error("[Supabase] clientes DELETE error:", error);
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
          Nuevo cliente
        </p>
        <div className="flex gap-2 items-end">
          <Field label="Nombre (máx. 60 caracteres)">
            <Input
              type="text"
              value={nuevoCliente}
              onChange={(e) => setNuevoCliente(e.target.value.slice(0, 60))}
              placeholder="Ej: Juan Pérez"
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
              <Th>Nombre</Th>
              <Th align="right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <Td className="text-center text-[var(--text-muted)]">Sin clientes cargados</Td>
                <Td /><Td />
              </tr>
            ) : (
              clientes.map((c) => (
                <tr key={c.id}>
                  <Td className="text-[var(--text-muted)] w-16">{c.id}</Td>
                  <Td>
                    {editId === c.id ? (
                      <Input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value.slice(0, 60))}
                        onKeyDown={(e) => e.key === "Enter" && guardarEdicion()}
                        autoFocus
                      />
                    ) : (
                      c.nombre
                    )}
                  </Td>
                  <Td align="right">
                    <div className="flex gap-1 justify-end">
                      {editId === c.id ? (
                        <>
                          <Button size="sm" variant="primary" onClick={guardarEdicion}>Guardar</Button>
                          <Button size="sm" onClick={() => { setEditId(null); setEditNombre(""); setErr(""); }}>Cancelar</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => { setEditId(c.id); setEditNombre(c.nombre); setErr(""); }}>Editar</Button>
                          <Button size="sm" variant="danger" onClick={() => eliminar(c.id)}>Borrar</Button>
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
CREATE TABLE IF NOT EXISTS public.clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL
);

-- Paso 2: deshabilitar RLS
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;

-- Paso 3: dar permisos al rol anon
GRANT ALL ON TABLE public.clientes TO anon;
GRANT ALL ON TABLE public.clientes TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.clientes_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.clientes_id_seq TO authenticated;

-- Paso 4: forzar recarga del schema cache de PostgREST
NOTIFY pgrst, 'reload schema';`;
