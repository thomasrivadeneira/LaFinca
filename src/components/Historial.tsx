"use client";

import type { Planilla } from "@/types";
import { Table, Th, Td } from "./ui";
import { money } from "@/lib/defaults";

export default function Historial({ planillas }: { planillas: Planilla[] }) {
  return (
    <Table>
      <thead><tr><Th>Fecha</Th><Th>Sucursal</Th><Th align="right">Total</Th><Th align="right">Gastos</Th><Th align="right">Hay</Th><Th>Cargó</Th></tr></thead>
      <tbody>
        {planillas.length === 0 ? (
          <tr><Td className="text-center text-slate-400">Sin planillas</Td><Td></Td><Td></Td><Td></Td><Td></Td><Td></Td></tr>
        ) : (
          planillas.slice().reverse().map((p) => (
            <tr key={p.id}>
              <Td>{p.fecha}</Td>
              <Td>{p.sucursal}</Td>
              <Td align="right">{money(p.total)}</Td>
              <Td align="right">{money(p.gastos)}</Td>
              <Td align="right">{money(p.hay)}</Td>
              <Td className="text-slate-500">{p.usuario}</Td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
}
