"use client";

import { useState } from "react";
import type { Usuario, Venta, Sucursal, Cliente, ArticuloVenta, Cobro, MedioPago } from "@/types";
import { Card, Field, Input, Select, Button, Table, Th, Td, Badge } from "./ui";
import { uid, money, num, SUCURSALES } from "@/lib/defaults";

interface Props {
  user: Usuario;
  ventas: Venta[];
  clientes: Cliente[];
  cobros: Cobro[];
  onSaveVentas: (ventas: Venta[]) => void;
  onSaveCobro: (cobro: Cobro) => void;
  onDeleteCobro: (id: string) => void;
}

const ARTICULOS: ArticuloVenta[] = ["SELECCIONADA", "CERNIDA"];
const MEDIOS: MedioPago[] = ["Efectivo", "Transferencia", "Posnet/QR"];

type Filtro = "Todas" | Sucursal;

function cobradoDeVenta(ventaId: string, cobros: Cobro[]): number {
  return cobros
    .filter((c) => c.venta_id === ventaId)
    .reduce((s, c) => s + c.importe, 0);
}

function estadoVenta(total: number, cobrado: number): "Pendiente" | "Parcial" | "Cobrado" {
  if (cobrado <= 0) return "Pendiente";
  if (cobrado >= total) return "Cobrado";
  return "Parcial";
}

export default function Ventas({ user, ventas, clientes, cobros, onSaveVentas, onSaveCobro, onDeleteCobro }: Props) {
  const esAdmin = user.rol === "Administrador";
  const hoy = new Date().toISOString().slice(0, 10);

  // ── Estado formulario venta ───────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    fecha: string;
    sucursal: Sucursal;
    clienteId: number | "";
    articulo: ArticuloVenta;
    cantidad: string;
    precio: string;
  }>({
    fecha: hoy,
    sucursal: "Belgrano",
    clienteId: "",
    articulo: "SELECCIONADA",
    cantidad: "",
    precio: "",
  });
  const [errVenta, setErrVenta] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todas");

  // ── Estado panel de cobros ────────────────────────────────────────────────────
  const [ventaCobroId, setVentaCobroId] = useState<string | null>(null);
  const [formCobro, setFormCobro] = useState<{ fecha: string; importe: string; medio: MedioPago; observacion: string }>({
    fecha: hoy,
    importe: "",
    medio: "Efectivo",
    observacion: "",
  });
  const [errCobro, setErrCobro] = useState("");
  const [savingCobro, setSavingCobro] = useState(false);

  const editing = editId ? ventas.find((v) => v.id === editId) ?? null : null;
  const ventaCobro = ventaCobroId ? ventas.find((v) => v.id === ventaCobroId) ?? null : null;

  // ── Handlers venta ────────────────────────────────────────────────────────────
  const startEdit = (v: Venta) => {
    setVentaCobroId(null);
    setEditId(v.id);
    setForm({
      fecha: v.fecha,
      sucursal: v.sucursal,
      clienteId: v.cliente_id ?? "",
      articulo: v.articulo,
      cantidad: String(v.cantidad),
      precio: String(v.precio),
    });
    setErrVenta("");
  };

  const cancelarVenta = () => {
    setEditId(null);
    setForm({ fecha: hoy, sucursal: "Belgrano", clienteId: "", articulo: "SELECCIONADA", cantidad: "", precio: "" });
    setErrVenta("");
  };

  const guardarVenta = () => {
    if (!form.clienteId) { setErrVenta("Seleccioná un cliente"); return; }
    if (!form.cantidad || Number(form.cantidad) <= 0) { setErrVenta("Ingresá una cantidad válida"); return; }
    if (!form.precio || Number(form.precio) <= 0) { setErrVenta("Ingresá un precio válido"); return; }
    const cliente = clientes.find((c) => c.id === Number(form.clienteId));
    if (!cliente) { setErrVenta("Cliente inválido"); return; }
    const cantidad = Number(form.cantidad);
    const precio = Number(form.precio);
    const total = cantidad * precio;
    if (editId) {
      onSaveVentas(ventas.map((v) =>
        v.id === editId
          ? { ...v, fecha: form.fecha, sucursal: form.sucursal, cliente_id: cliente.id, cliente: cliente.nombre, articulo: form.articulo, cantidad, precio, total }
          : v
      ));
    } else {
      onSaveVentas([
        ...ventas,
        {
          id: uid(),
          fecha: form.fecha,
          sucursal: form.sucursal,
          cliente_id: cliente.id,
          cliente: cliente.nombre,
          articulo: form.articulo,
          cantidad,
          precio,
          total,
          usuario: user.user,
        },
      ]);
    }
    cancelarVenta();
  };

  const borrarVenta = (id: string) => {
    if (!esAdmin) return;
    if (confirm("¿Eliminar esta venta? También se eliminarán sus cobros.")) {
      onSaveVentas(ventas.filter((v) => v.id !== id));
    }
  };

  // ── Handlers cobros ───────────────────────────────────────────────────────────
  const abrirCobros = (v: Venta) => {
    setEditId(null);
    cancelarVenta();
    if (ventaCobroId === v.id) {
      setVentaCobroId(null);
      return;
    }
    setVentaCobroId(v.id);
    setFormCobro({ fecha: hoy, importe: "", medio: "Efectivo", observacion: "" });
    setErrCobro("");
  };

  const guardarCobro = async () => {
    if (!ventaCobro) return;
    const importe = Number(formCobro.importe);
    if (!formCobro.importe || importe <= 0) { setErrCobro("Ingresá un importe válido"); return; }
    const cobrado = cobradoDeVenta(ventaCobro.id, cobros);
    const saldo = ventaCobro.total - cobrado;
    if (importe > saldo) { setErrCobro(`El importe no puede superar el saldo ($${saldo.toLocaleString("es-AR")})`); return; }
    setSavingCobro(true);
    const nuevo: Cobro = {
      id: uid(),
      venta_id: ventaCobro.id,
      fecha: formCobro.fecha,
      importe,
      medio: formCobro.medio,
      observacion: formCobro.observacion.trim(),
      usuario: user.user,
    };
    await onSaveCobro(nuevo);
    setFormCobro({ fecha: hoy, importe: "", medio: "Efectivo", observacion: "" });
    setErrCobro("");
    setSavingCobro(false);
  };

  const borrarCobro = (id: string) => {
    if (!esAdmin) return;
    if (confirm("¿Eliminar este cobro?")) onDeleteCobro(id);
  };

  // ── Filtrado y totales ────────────────────────────────────────────────────────
  const ventasFiltradas = filtro === "Todas" ? ventas : ventas.filter((v) => v.sucursal === filtro);
  const totalVentas = ventasFiltradas.reduce((a, v) => a + Number(v.total || 0), 0);
  const totalCobrado = ventasFiltradas.reduce((a, v) => a + cobradoDeVenta(v.id, cobros), 0);

  const pillBase = "px-3 py-1.5 text-xs font-medium rounded-lg border transition-all";
  const pillActive = "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30";
  const pillInactive = "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--bg-muted)]";

  const totalPreview = form.cantidad && form.precio ? Number(form.cantidad) * Number(form.precio) : 0;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Formulario venta */}
      <Card className="p-5 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          {editing ? "Modificar venta" : "Nueva venta"}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.5fr_1fr_1fr_1fr_auto] gap-2 items-end">
          <Field label="Fecha">
            <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
          </Field>
          <Field label="Sucursal">
            <Select value={form.sucursal} onChange={(e) => setForm({ ...form, sucursal: e.target.value as Sucursal })}>
              {SUCURSALES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Cliente">
            <Select value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value ? Number(e.target.value) : "" })}>
              <option value="">— Seleccioná —</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Artículo">
            <Select value={form.articulo} onChange={(e) => setForm({ ...form, articulo: e.target.value as ArticuloVenta })}>
              {ARTICULOS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </Field>
          <Field label="Cantidad">
            <Input type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
          </Field>
          <Field label="Precio unitario">
            <Input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
          </Field>
          <div className="flex gap-2">
            <Button variant="primary" onClick={guardarVenta}>{editing ? "Guardar" : "Agregar"}</Button>
            {editing && <Button onClick={cancelarVenta}>Cancelar</Button>}
          </div>
        </div>
        {totalPreview > 0 && (
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Total: <span className="font-semibold text-[var(--text)]">{money(totalPreview)}</span>
          </p>
        )}
        {errVenta && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errVenta}</p>}
        {clientes.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 italic">
            No hay clientes cargados. Agregalos en Configuración → Clientes.
          </p>
        )}
      </Card>

      {/* Panel de cobros */}
      {ventaCobro && (
        <Card className="p-5 mb-4 border-emerald-200 dark:border-emerald-700">
          <div className="flex items-start justify-between mb-3 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5">
                Cobros — {ventaCobro.cliente}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {ventaCobro.articulo} · {ventaCobro.fecha} · Total: <span className="font-semibold">{money(ventaCobro.total)}</span>
              </p>
            </div>
            <button
              onClick={() => setVentaCobroId(null)}
              className="shrink-0 w-7 h-7 rounded-md hover:bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-muted)] transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Historial de cobros de esta venta */}
          {(() => {
            const cobrosDeVenta = cobros.filter((c) => c.venta_id === ventaCobro.id).slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
            const cobrado = cobrosDeVenta.reduce((s, c) => s + c.importe, 0);
            const saldo = ventaCobro.total - cobrado;
            return (
              <>
                {cobrosDeVenta.length > 0 && (
                  <div className="mb-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Fecha</th>
                          <th className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Medio</th>
                          <th className="text-right px-2 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Importe</th>
                          <th className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Observación</th>
                          <th className="text-left px-2 py-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Cargó</th>
                          {esAdmin && <th />}
                        </tr>
                      </thead>
                      <tbody>
                        {cobrosDeVenta.map((c) => (
                          <tr key={c.id} className="border-b border-[var(--border)]">
                            <td className="px-2 py-2">{c.fecha}</td>
                            <td className="px-2 py-2">{c.medio}</td>
                            <td className="px-2 py-2 text-right font-medium text-emerald-600 dark:text-emerald-400">{money(c.importe)}</td>
                            <td className="px-2 py-2 text-[var(--text-muted)]">{c.observacion || "—"}</td>
                            <td className="px-2 py-2 text-[var(--text-muted)]">{c.usuario}</td>
                            {esAdmin && (
                              <td className="px-2 py-2 text-right">
                                <Button size="sm" variant="danger" onClick={() => borrarCobro(c.id)}>Borrar</Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex gap-6 mt-2 px-2 text-xs">
                      <span className="text-[var(--text-muted)]">
                        Cobrado: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{money(cobrado)}</span>
                      </span>
                      <span className="text-[var(--text-muted)]">
                        Saldo: <span className={`font-semibold ${saldo > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>{money(saldo)}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Formulario nuevo cobro */}
                {saldo > 0 ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                      Registrar cobro
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_2fr_auto] gap-2 items-end">
                      <Field label="Fecha">
                        <Input type="date" value={formCobro.fecha} onChange={(e) => setFormCobro({ ...formCobro, fecha: e.target.value })} />
                      </Field>
                      <Field label={`Importe (máx. ${money(saldo)})`}>
                        <Input
                          type="number"
                          value={formCobro.importe}
                          max={saldo}
                          onChange={(e) => setFormCobro({ ...formCobro, importe: e.target.value })}
                        />
                      </Field>
                      <Field label="Medio de pago">
                        <Select value={formCobro.medio} onChange={(e) => setFormCobro({ ...formCobro, medio: e.target.value as MedioPago })}>
                          {MEDIOS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </Select>
                      </Field>
                      <Field label="Observación (opcional)">
                        <Input
                          type="text"
                          value={formCobro.observacion}
                          onChange={(e) => setFormCobro({ ...formCobro, observacion: e.target.value.slice(0, 100) })}
                          placeholder="Ej: Pago de seña"
                        />
                      </Field>
                      <Button variant="primary" onClick={guardarCobro} disabled={savingCobro}>
                        {savingCobro ? "..." : "Cobrar"}
                      </Button>
                    </div>
                    {errCobro && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errCobro}</p>}
                  </>
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Venta totalmente cobrada
                  </p>
                )}
              </>
            );
          })()}
        </Card>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-[var(--text-muted)] font-medium">Filtrar:</span>
        {(["Todas", ...SUCURSALES] as Filtro[]).map((op) => (
          <button key={op} onClick={() => setFiltro(op)} className={`${pillBase} ${filtro === op ? pillActive : pillInactive}`}>
            {op}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <Table>
        <thead>
          <tr>
            <Th>Fecha</Th>
            <Th>Sucursal</Th>
            <Th>Cliente</Th>
            <Th>Artículo</Th>
            <Th align="right">Cantidad</Th>
            <Th align="right">Precio</Th>
            <Th align="right">Total</Th>
            <Th align="right">Saldo</Th>
            <Th>Estado</Th>
            <Th>Cargó</Th>
            <Th align="right">Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {ventasFiltradas.length === 0 ? (
            <tr>
              <Td className="text-center text-[var(--text-muted)]" align="left">
                Sin ventas{filtro !== "Todas" ? ` para ${filtro}` : ""}
              </Td>
              <Td /><Td /><Td /><Td /><Td /><Td /><Td /><Td /><Td /><Td />
            </tr>
          ) : (
            ventasFiltradas.slice().reverse().map((v) => {
              const cobrado = cobradoDeVenta(v.id, cobros);
              const saldo = v.total - cobrado;
              const estado = estadoVenta(v.total, cobrado);
              const esCobrandoEsta = ventaCobroId === v.id;
              return (
                <tr key={v.id} className={esCobrandoEsta ? "bg-emerald-50 dark:bg-emerald-900/10" : ""}>
                  <Td>{v.fecha}</Td>
                  <Td>
                    <Badge color={v.sucursal === "Belgrano" ? "blue" : "green"}>{v.sucursal}</Badge>
                  </Td>
                  <Td>{v.cliente}</Td>
                  <Td>{v.articulo}</Td>
                  <Td align="right">{num(v.cantidad)}</Td>
                  <Td align="right">{money(v.precio)}</Td>
                  <Td align="right">{money(v.total)}</Td>
                  <Td align="right" className={saldo > 0 ? "text-red-600 dark:text-red-400 font-medium" : "text-emerald-600 dark:text-emerald-400 font-medium"}>
                    {money(saldo)}
                  </Td>
                  <Td>
                    <Badge color={estado === "Cobrado" ? "green" : estado === "Parcial" ? "yellow" : "red"}>
                      {estado}
                    </Badge>
                  </Td>
                  <Td className="text-[var(--text-muted)]">{v.usuario}</Td>
                  <Td align="right">
                    <div className="flex gap-1 justify-end">
                      {estado !== "Cobrado" && (
                        <Button
                          size="sm"
                          variant={esCobrandoEsta ? "primary" : "ghost"}
                          onClick={() => abrirCobros(v)}
                        >
                          Cobrar
                        </Button>
                      )}
                      {estado === "Cobrado" && (
                        <Button size="sm" variant="ghost" onClick={() => abrirCobros(v)}>
                          Ver cobros
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => startEdit(v)}>Editar</Button>
                      {esAdmin && (
                        <Button size="sm" variant="danger" onClick={() => borrarVenta(v.id)}>Borrar</Button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
        {ventasFiltradas.length > 0 && (
          <tfoot>
            <tr className="bg-[var(--bg-muted)]">
              <Td /><Td />
              <Td className="font-semibold">Total</Td>
              <Td /><Td /><Td />
              <Td align="right" className="font-semibold">{money(totalVentas)}</Td>
              <Td align="right" className="font-semibold text-red-600 dark:text-red-400">{money(totalVentas - totalCobrado)}</Td>
              <Td /><Td /><Td />
            </tr>
          </tfoot>
        )}
      </Table>

      {!esAdmin && (
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Como operador podés agregar, editar y cobrar ventas. Solo el administrador puede eliminarlas.
        </p>
      )}
    </>
  );
}
