"use client";

import type { Planilla, Usuario } from "@/types";
import { Table, Th, Td, Badge, Button } from "./ui";
import { money } from "@/lib/defaults";

interface Props {
  planillas: Planilla[];
  user: Usuario;
  onEdit: (p: Planilla) => void;
  onDelete: (id: string) => void;
}

export default function Historial({ planillas, user, onEdit, onDelete }: Props) {
  const esAdmin = user.rol === "Administrador";

  const eliminar = (p: Planilla) => {
    if (!esAdmin) return;
    if (confirm(`¿Eliminar la planilla del ${p.fecha} (${p.sucursal})?`)) onDelete(p.id);
  };

  return (
    <Table>
      <thead>
        <tr>
          <Th>Fecha</Th>
          <Th>Sucursal</Th>
          <Th align="right">Total</Th>
          <Th align="right">Gastos</Th>
          <Th align="right">Hay</Th>
          <Th>Cargó</Th>
          <Th align="right">Acciones</Th>
        </tr>
      </thead>
      <tbody>
        {planillas.length === 0 ? (
          <tr>
            <Td className="text-center text-[var(--text-muted)]">Sin planillas</Td>
            <Td /><Td /><Td /><Td /><Td /><Td />
          </tr>
        ) : (
          planillas.slice().reverse().map((p) => (
            <tr key={p.id}>
              <Td>{p.fecha}</Td>
              <Td>
                <Badge color={p.sucursal === "Belgrano" ? "blue" : "green"}>
                  {p.sucursal}
                </Badge>
              </Td>
              <Td align="right">{money(p.total)}</Td>
              <Td align="right">
                <span className="inline-flex items-center gap-1.5">
                  {money(p.gastos)}
                  {p.gastosModoManual && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 leading-none">
                      manual
                    </span>
                  )}
                </span>
              </Td>
              <Td align="right" className="font-medium text-emerald-600 dark:text-emerald-400">
                {money(p.hay)}
              </Td>
              <Td className="text-[var(--text-muted)]">{p.usuario}</Td>
              <Td align="right">
                <div className="flex gap-1 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(p)}>Editar</Button>
                  {esAdmin && (
                    <Button size="sm" variant="danger" onClick={() => eliminar(p)}>Eliminar</Button>
                  )}
                </div>
              </Td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
}
