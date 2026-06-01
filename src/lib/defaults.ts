import type { Producto, Bicarbonato, Usuario } from "@/types";

export const SUCURSALES = ["Belgrano", "Roca"] as const;

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const money = (n: number | string | null | undefined): string => {
  if (n === "" || n === null || n === undefined || isNaN(Number(n))) return "-";
  return "$" + Number(n).toLocaleString("es-AR");
};

export const num = (n: number | string | null | undefined): string => {
  if (n === "" || n === null || n === undefined || isNaN(Number(n))) return "-";
  return Number(n).toLocaleString("es-AR");
};

export const USUARIOS_DEFAULT: Usuario[] = [
  { id: "u1", user: "admin", pass: "admin", rol: "Administrador", activo: true },
  { id: "u2", user: "operador", pass: "operador", rol: "Operador", activo: true },
];

export const PRODUCTOS_DEFAULT: Omit<Producto, "id">[] = [
  { nombre: "ENCENDEDORES", precio: 800, stock: 46 },
  { nombre: "CHESTER COMUN 10", precio: 3800, stock: 10 },
  { nombre: "CHESTER COMUN 20", precio: 4800, stock: 5 },
  { nombre: "CHESTER CONVERTIBLE 10", precio: 4300, stock: 5 },
  { nombre: "CHESTER CONVERTIBLE 20", precio: 5000, stock: 0 },
  { nombre: "HILLS", precio: 2000, stock: 0 },
  { nombre: "LUCKY CONVERTIBLE 10", precio: 3500, stock: 2 },
  { nombre: "MALBORO CORAL", precio: 4500, stock: 12 },
  { nombre: "MALBORO COVERTIBLE", precio: 4800, stock: 1 },
  { nombre: "MALBORO CRAFT", precio: 4000, stock: 0 },
  { nombre: "MALBORO ORIGINAL", precio: 6200, stock: 0 },
  { nombre: "MILENIO COMUN", precio: 2400, stock: 1 },
  { nombre: "MILENIO CONVERTIBLE", precio: 2600, stock: 3 },
  { nombre: "PHILPMORRIS COMUN 10", precio: 4000, stock: 4 },
  { nombre: "PHILP CONVERTIBLE 10", precio: 4300, stock: 3 },
  { nombre: "VAPER BLACK SHEEP", precio: 32000, stock: 2 },
  { nombre: "VAPER ELFBAR 30K", precio: 27000, stock: 1 },
  { nombre: "BIQUERO COMUN", precio: 700, stock: 22 },
  { nombre: "BIQUERO PREMIUM", precio: 2400, stock: 23 },
  { nombre: "COQUERO", precio: 7000, stock: 3 },
];

export const BICAS_DEFAULT: Omit<Bicarbonato, "id">[] = [
  { nombre: "BANANA", cantidad: 84 },
  { nombre: "CAFE", cantidad: 22 },
  { nombre: "CAMPIÑA", cantidad: 4453 },
  { nombre: "CHAMABICO", cantidad: 342 },
  { nombre: "CHICLE", cantidad: 160 },
  { nombre: "COCO", cantidad: 41 },
  { nombre: "DUMBA", cantidad: 224 },
  { nombre: "DURAZNO", cantidad: 60 },
  { nombre: "FRUTILLA", cantidad: 88 },
  { nombre: "KIWI", cantidad: 64 },
  { nombre: "LIMON", cantidad: 64 },
  { nombre: "MANGO", cantidad: 78 },
  { nombre: "MARACUYA", cantidad: 62 },
  { nombre: "MENTA", cantidad: 46 },
  { nombre: "MENTA STEVIA", cantidad: 440 },
  { nombre: "RED BULL", cantidad: 63 },
  { nombre: "SANDIA", cantidad: 56 },
  { nombre: "UVA", cantidad: 39 },
];

export const PRECIOS_CS = [
  1000, 3000, 3500, 4500, 5500, 6500, 9000, 10000, 11000, 13000, 18000, 20000, 25000,
];
