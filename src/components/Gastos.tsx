"use client";

import { useState } from "react";
import type { Usuario, Gasto, Sucursal, TipoGasto } from "@/types";
import { Card, Field, Input, Select, Button, Table, Th, Td, Badge, MobileList, MobileCard, MobileRow } from "./ui";
import { money, SUCURSALES } from "@/lib/defaults";

interface Props {
  user: Usuario;
  gastos: Gasto[];
  tiposGastos: TipoGasto[];
  onSave: (gastos: Gasto[]) => void;
}

type FiltroSucursal = "Todas" | Sucursal;

export default function Gastos({ user, gastos, tiposGastos, onSave }: Props) {
  const esAdmin = user.rol === "Administrador";

  const [filtroSucursal, setFiltroSucursal] = useState<FiltroSucursal>("Todas");
  const [filtroTipo, setFiltroTipo] = useState<number | "">("");
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");

  const borrar = (id: string) => {
    if (!esAdmin) return;
    if (confirm("¿Eliminar este gasto?")) onSave(gastos.filter((g) => g.id !== id));
  };

  const limpiarFiltros = () => {
    setFiltroSucursal("Todas");
    setFiltroTipo("");
    setFiltroDesde("");
    setFiltroHasta("");
  };

  const gastosFiltrados = gastos.filter((g) => {
    if (filtroSucursal !== "Todas" && g.sucursal !== filtroSucursal) return false;
    if (filtroDesde && g.fecha < filtroDesde) return false;
    if (filtroHasta && g.fecha > filtroHasta) return false;
    if (filtroTipo !== "" && g.tipo_gasto_id !== filtroTipo) return false;
    return true;
  });

  const total = gastosFiltrados.reduce((a, g) => a + Number(g.monto || 0), 0);

  const hayFiltros = filtroSucursal !== "Todas" || filtroTipo !== "" || filtroDesde !== "" || filtroHasta !== "";

  const pillBase = "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all";
  const pillActive = "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30";
  const pillInactive = "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--bg-muted)]";

  return (
    <>
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Filtros
          </p>
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr] gap-3 items-end">
          <Field label="Fecha desde">
            <Input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} />
          </Field>
          <Field label="Fecha hasta">
            <Input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} />
          </Field>
          <Field label="Tipo de gasto">
            <Select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Todos los tipos</option>
              {tiposGastos.map((t) => (
                <option key={t.id_gastos} value={t.id_gastos}>{t.gasto}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-[var(--text-muted)] font-medium">Sucursal:</span>
          {(["Todas", ...SUCURSALES] as FiltroSucursal[]).map((op) => (
            <button
              key={op}
              onClick={() => setFiltroSucursal(op)}
              className={`${pillBase} ${filtroSucursal === op ? pillActive : pillInactive}`}
            >
              {op}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Tabla (desktop) ── */}
      <Table className="hidden md:block">
        <thead>
          <tr>
            <Th>Fecha</Th>
            <Th>Sucursal</Th>
            <Th>Tipo de gasto</Th>
            <Th align="right">Monto</Th>
            <Th>Cargó</Th>
            {esAdmin && <Th align="right">Acciones</Th>}
          </tr>
        </thead>
        <tbody>
          {gastosFiltrados.length === 0 ? (
            <tr>
              <Td className="text-center text-[var(--text-muted)]" align="left">
                Sin gastos para los filtros seleccionados
              </Td>
              <Td /><Td /><Td /><Td />{esAdmin && <Td />}
            </tr>
          ) : (
            gastosFiltrados.slice().reverse().map((g) => (
              <tr key={g.id}>
                <Td>{g.fecha}</Td>
                <Td>
                  <Badge color={g.sucursal === "Belgrano" ? "blue" : "green"}>{g.sucursal}</Badge>
                </Td>
                <Td>{g.concepto}</Td>
                <Td align="right">{money(g.monto)}</Td>
                <Td className="text-[var(--text-muted)]">{g.usuario}</Td>
                {esAdmin && (
                  <Td align="right">
                    <Button size="sm" variant="danger" onClick={() => borrar(g.id)}>Borrar</Button>
                  </Td>
                )}
              </tr>
            ))
          )}
        </tbody>
        {gastosFiltrados.length > 0 && (
          <tfoot>
            <tr className="bg-[var(--bg-muted)]">
              <Td className="font-semibold" />
              <Td className="font-semibold text-xs text-[var(--text-muted)]">
                {filtroSucursal !== "Todas" ? filtroSucursal : "Todas"}
              </Td>
              <Td className="font-semibold">Total</Td>
              <Td align="right" className="font-semibold">{money(total)}</Td>
              <Td />{esAdmin && <Td />}
            </tr>
          </tfoot>
        )}
      </Table>

      {/* ── Cards (mobile) ── */}
      {gastosFiltrados.length === 0 ? (
        <p className="md:hidden text-sm text-[var(--text-muted)] text-center py-6">
          Sin gastos para los filtros seleccionados
        </p>
      ) : (
        <MobileList>
          {gastosFiltrados.slice().reverse().map((g) => (
            <MobileCard key={g.id}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-sm">{g.concepto}</span>
                <Badge color={g.sucursal === "Belgrano" ? "blue" : "green"}>{g.sucursal}</Badge>
              </div>
              <MobileRow label="Fecha">{g.fecha}</MobileRow>
              <MobileRow label="Monto">
                <span className="font-semibold">{money(g.monto)}</span>
              </MobileRow>
              <MobileRow label="Cargó">
                <span className="text-[var(--text-muted)]">{g.usuario}</span>
              </MobileRow>
              {esAdmin && (
                <div className="pt-2 border-t border-[var(--border)]">
                  <Button variant="danger" onClick={() => borrar(g.id)} className="w-full">Borrar</Button>
                </div>
              )}
            </MobileCard>
          ))}
          <div className="card-elevated p-4 flex items-center justify-between bg-[var(--bg-muted)]">
            <span className="font-semibold text-sm">
              Total{filtroSucursal !== "Todas" ? ` · ${filtroSucursal}` : ""}
            </span>
            <span className="font-bold">{money(total)}</span>
          </div>
        </MobileList>
      )}
    </>
  );
}
