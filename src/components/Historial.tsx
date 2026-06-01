"use client";

import type { Planilla } from "@/types";
import { Table, Th, Td, Badge } from "./ui";
import { money } from "@/lib/defaults";

export default function Historial({ planillas }: { planillas: Planilla[] }) {
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
        </tr>
      </thead>
      <tbody>
        {planillas.length === 0 ? (
          <tr>
            <Td className="text-center text-[var(--text-muted)]">Sin planillas</Td>
            <Td /><Td /><Td /><Td /><Td />
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
              <Td align="right">{money(p.gastos)}</Td>
              <Td align="right" className="font-medium text-emerald-600 dark:text-emerald-400">
                {money(p.hay)}
              </Td>
              <Td className="text-[var(--text-muted)]">{p.usuario}</Td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
}
