export type Rol = "Administrador" | "Operador";
export type Sucursal = "Belgrano" | "Roca";

export interface Usuario {
  id: string;
  user: string;
  pass: string;
  rol: Rol;
  activo: boolean;
}

export interface Gasto {
  id: string;
  fecha: string;
  sucursal: Sucursal;
  tipo_gasto_id: number | null;
  concepto: string;
  monto: number;
  usuario: string;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
}

export interface Bicarbonato {
  id: string;
  nombre: string;
  cantidad: number;
}

export interface CernidaSelRegistro {
  id: string;
  fecha: string;
  tipo: "Cernida" | "Seleccionada" | "Machucada";
  precio: number;
  cantidad: number;
  usuario: string;
}

export interface Planilla {
  id: string;
  fecha: string;
  sucursal: Sucursal;
  total: string;
  transferencia: string;
  posnet: string;
  gastos: string;
  pedidos_ing: string;
  pedidos_debe: string;
  debe_haber: string;
  hay: string;
  seleccionada: { habia: string; ingreso: string; prod: string; quedan: string };
  cernida: { habia: string; ingreso: string; prod: string; quedan: string };
  observaciones: string;
  usuario: string;
  ts: number;
  gastosModoManual?: boolean;
  saldoInicial?: string;
  rendicion?: string;
  diferenciaCaja?: string;
}

export interface TipoGasto {
  id_gastos: number;
  gasto: string;
}

export interface Cliente {
  id: number;
  nombre: string;
}

export type ArticuloVenta = "SELECCIONADA" | "CERNIDA";

export type MedioPago = "Efectivo" | "Transferencia" | "Posnet/QR";

export interface Cobro {
  id: string;
  venta_id: string;
  fecha: string;
  importe: number;
  medio: MedioPago;
  observacion: string;
  usuario: string;
}

export interface Venta {
  id: string;
  fecha: string;
  sucursal: Sucursal;
  cliente_id: number | null;
  cliente: string;
  articulo: ArticuloVenta;
  cantidad: number;
  precio: number;
  total: number;
  usuario: string;
}

export type Vista =
  | "menu"
  | "carga"
  | "gastos"
  | "ventas"
  | "historial"
  | "reportes"
  | "configuracion";
