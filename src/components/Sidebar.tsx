"use client";

import { useState, useEffect } from "react";
import type { Usuario, Vista } from "@/types";
import Logo from "./Logo";

interface Props {
  user: Usuario;
  vista: Vista;
  collapsed: boolean;
  mobileOpen: boolean;
  onGo: (v: Vista) => void;
  onLogout: () => void;
  onToggle: () => void;
  onCloseMobile: () => void;
}

export const NAV: {
  view: Vista;
  label: string;
  gradient: string;
  d: string;
  soloAdmin?: boolean;
}[] = [
  {
    view: "carga",
    label: "Planilla diaria",
    gradient: "from-indigo-500 to-violet-600",
    d: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  },
  {
    view: "historial",
    label: "Historial",
    gradient: "from-slate-500 to-slate-700",
    d: "M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8M12 7v5l4 2",
  },
  {
    view: "ventas",
    label: "Ventas",
    gradient: "from-emerald-500 to-teal-600",
    d: "M16 11V7a4 4 0 0 0-8 0v4M5 9h14l-1.5 11.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5z",
  },
  {
    view: "gastos",
    label: "Gastos",
    gradient: "from-fuchsia-500 to-pink-600",
    d: "M21 8V7l-3 2-3-2-3 2-3-2-3 2-3-2v14l3-2 3 2 3-2 3 2 3-2 3 2V8z",
  },
  {
    view: "reportes",
    label: "Reportes",
    gradient: "from-rose-500 to-red-600",
    d: "M12 20V10M18 20V4M6 20v-6",
  },
  {
    view: "configuracion",
    label: "Configuración",
    gradient: "from-amber-500 to-orange-600",
    d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    soloAdmin: true,
  },
];

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };
  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="w-8 h-8 rounded-lg hover:bg-[var(--bg-muted)] flex items-center justify-center transition-all shrink-0"
    >
      {dark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

interface ContentProps {
  user: Usuario;
  vista: Vista;
  collapsed: boolean;
  onGo: (v: Vista) => void;
  onLogout: () => void;
  onToggle?: () => void;
  onClose?: () => void;
}

function SidebarContent({ user, vista, collapsed, onGo, onLogout, onToggle, onClose }: ContentProps) {
  const esAdmin = user.rol === "Administrador";
  const items = NAV.filter((n) => !n.soloAdmin || esAdmin);

  return (
    <div
      className={`flex flex-col h-full bg-[var(--bg-elevated)] border-r border-[var(--border)] transition-all duration-300 overflow-hidden ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      {/* Logo row */}
      <div className="flex items-center h-14 px-3 border-b border-[var(--border)] shrink-0">
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm mx-auto">
            F
          </div>
        ) : (
          <Logo size="sm" />
        )}
        {onToggle && !onClose && (
          <button
            onClick={onToggle}
            className="ml-auto w-7 h-7 rounded-md hover:bg-[var(--bg-muted)] flex items-center justify-center transition-all shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--text-muted)]">
              {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
            </svg>
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-md hover:bg-[var(--bg-muted)] flex items-center justify-center transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--text-muted)]">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {items.map((item) => {
          const active = vista === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onGo(item.view)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-xl transition-all duration-150 ${
                collapsed ? "justify-center px-1 py-2.5" : "gap-3 px-2 py-2.5"
              } ${
                active
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text)]"
              }`}
            >
              <div
                className={`w-11 h-11 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shrink-0 shadow-sm transition-all ${
                  active ? "shadow-md" : ""
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.d} />
                </svg>
              </div>
              {!collapsed && (
                <>
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-[var(--border)] p-2 space-y-1">
        {/* User row */}
        <div className={`flex items-center rounded-xl px-2 py-2 gap-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.user.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold leading-tight truncate">{user.user}</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">{user.rol}</div>
            </div>
          )}
          {!collapsed && <ThemeToggle />}
        </div>

        {collapsed && (
          <div className="flex justify-center py-1">
            <ThemeToggle />
          </div>
        )}

        {/* Logout */}
        <button
          onClick={onLogout}
          title={collapsed ? "Salir" : undefined}
          className={`w-full flex items-center rounded-xl px-2 py-2 gap-2 text-sm text-[var(--text-muted)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          {!collapsed && <span className="font-medium">Salir</span>}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ user, vista, collapsed, mobileOpen, onGo, onLogout, onToggle, onCloseMobile }: Props) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex shrink-0 h-full">
        <SidebarContent
          user={user}
          vista={vista}
          collapsed={collapsed}
          onGo={onGo}
          onLogout={onLogout}
          onToggle={onToggle}
        />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 h-full animate-slide-up" style={{ animationDuration: "0.25s" }}>
            <SidebarContent
              user={user}
              vista={vista}
              collapsed={false}
              onGo={(v) => { onGo(v); onCloseMobile(); }}
              onLogout={onLogout}
              onClose={onCloseMobile}
            />
          </div>
        </div>
      )}
    </>
  );
}
