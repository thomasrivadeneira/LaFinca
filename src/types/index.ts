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
}

export type Vista =
  | "menu"
  | "carga"
  | "gastos"
  | "historial"
  | "usuarios"
  | "productos"
  | "bicarbonatos"
  | "cernidasel"
  | "reportes";
