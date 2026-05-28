"use client";

import type { Usuario, Vista } from "@/types";

interface Props {
  user: Usuario;
  onGo: (v: Vista) => void;
}

interface CardDef {
  view: Vista;
  titulo: string;
  desc: string;
  gradient: string;
  iconPath: string;
  soloAdmin?: boolean;
}

const CARDS: CardDef[] = [
  {
    view: "carga",
    titulo: "Planilla diaria",
    desc: "Resumen del día",
    gradient: "from-indigo-500 to-violet-600",
    iconPath: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  },
  {
    view: "gastos",
    titulo: "Gastos",
    desc: "Alta, baja y modificación",
    gradient: "from-fuchsia-500 to-pink-600",
    iconPath: "M21 8V7l-3 2-3-2-3 2-3-2-3 2-3-2v14l3-2 3 2 3-2 3 2 3-2 3 2V8z",
  },
  {
    view: "productos",
    titulo: "Stock de productos",
    desc: "Cigarrillos, vapers, bolos",
    gradient: "from-amber-500 to-orange-600",
    iconPath: "M20 7l-8-4-8 4m16 0v10l-8 4m8-14L12 11m0 0L4 7m8 4v10",
  },
  {
    view: "bicarbonatos",
    titulo: "Bicarbonatos",
    desc: "Conteos por sabor",
    gradient: "from-emerald-500 to-teal-600",
    iconPath: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z",
  },
  {
    view: "cernidasel",
    titulo: "Cernida y Seleccionada",
    desc: "Carga por precio",
    gradient: "from-cyan-500 to-blue-600",
    iconPath: "M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4",
  },
  {
    view: "historial",
    titulo: "Historial",
    desc: "Ver lo cargado",
    gradient: "from-slate-500 to-slate-700",
    iconPath: "M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8M12 7v5l4 2",
  },
  {
    view: "reportes",
    titulo: "Reportes",
    desc: "Totales y exportar",
    gradient: "from-rose-500 to-red-600",
    iconPath: "M12 20V10M18 20V4M6 20v-6",
  },
  {
    view: "usuarios",
    titulo: "Usuarios",
    desc: "ABM completo",
    gradient: "from-violet-500 to-purple-600",
    iconPath:
      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    soloAdmin: true,
  },
];

export default function Menu({ user, onGo }: Props) {
  const esAdmin = user.rol === "Administrador";
  const visible = CARDS.filter((c) => !c.soloAdmin || esAdmin);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold">
          Hola,{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
            {user.user}
          </span>
        </h2>
        <p className="text-[var(--text-muted)] text-sm mt-0.5">¿Qué querés hacer hoy?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((c, i) => (
          <button
            key={c.view}
            onClick={() => onGo(c.view)}
            className="text-left card-elevated p-4 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group animate-slide-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={c.iconPath} />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[15px] leading-tight">{c.titulo}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{c.desc}</div>
            </div>
            <span className="text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-1 shrink-0">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
