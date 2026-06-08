"use client";

import { useState } from "react";
import TiposGastos from "./TiposGastos";
import Clientes from "./Clientes";
import type { TipoGasto, Cliente } from "@/types";

const SECCIONES = [
  { key: "tipos-gastos", label: "Tipos de gastos" },
  { key: "clientes", label: "Clientes" },
] as const;

type Seccion = typeof SECCIONES[number]["key"];

interface Props {
  onTiposGastosChange?: (tipos: TipoGasto[]) => void;
  onClientesChange?: (clientes: Cliente[]) => void;
}

export default function Configuracion({ onTiposGastosChange, onClientesChange }: Props) {
  const [seccion, setSeccion] = useState<Seccion>("tipos-gastos");

  const pillBase = "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all";
  const pillActive = "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30";
  const pillInactive = "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--bg-muted)]";

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        {SECCIONES.map((s) => (
          <button
            key={s.key}
            onClick={() => setSeccion(s.key)}
            className={`${pillBase} ${seccion === s.key ? pillActive : pillInactive}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {seccion === "tipos-gastos" && <TiposGastos onChange={onTiposGastosChange} />}
      {seccion === "clientes" && <Clientes onChange={onClientesChange} />}
    </>
  );
}
