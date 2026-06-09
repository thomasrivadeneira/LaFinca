"use client";

import type { Planilla, Usuario } from "@/types";
import { Table, Th, Td, Badge, Button, MobileList, MobileCard, MobileRow } from "./ui";
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

  const ordenadas = planillas.slice().reverse();

  return (
    <>
      {/* ── Tabla (desktop) ── */}
      <Table className="hidden md:block">
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
            ordenadas.map((p) => (
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

      {/* ── Cards (mobile) ── */}
      {planillas.length === 0 ? (
        <p className="md:hidden text-sm text-[var(--text-muted)] text-center py-6">Sin planillas</p>
      ) : (
        <MobileList>
          {ordenadas.map((p) => (
            <MobileCard key={p.id}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-sm">{p.fecha}</span>
                <Badge color={p.sucursal === "Belgrano" ? "blue" : "green"}>{p.sucursal}</Badge>
              </div>
              <MobileRow label="Total">{money(p.total)}</MobileRow>
              <MobileRow label="Gastos">
                <span className="inline-flex items-center gap-1.5">
                  {money(p.gastos)}
                  {p.gastosModoManual && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 leading-none">
                      manual
                    </span>
                  )}
                </span>
              </MobileRow>
              <MobileRow label="Hay">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{money(p.hay)}</span>
              </MobileRow>
              <MobileRow label="Cargó">
                <span className="text-[var(--text-muted)]">{p.usuario}</span>
              </MobileRow>
              <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                <Button variant="ghost" onClick={() => onEdit(p)} className="flex-1">Editar</Button>
                {esAdmin && (
                  <Button variant="danger" onClick={() => eliminar(p)} className="flex-1">Eliminar</Button>
                )}
              </div>
            </MobileCard>
          ))}
        </MobileList>
      )}
    </>
  );
}
