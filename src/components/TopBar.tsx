"use client";

import { useState, useEffect } from "react";
import type { Usuario } from "@/types";
import Logo from "./Logo";

interface Props {
  titulo: string;
  user: Usuario;
  enMenu: boolean;
  onGoMenu: () => void;
  onLogout: () => void;
}

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
      className="w-8 h-8 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-muted)] flex items-center justify-center transition-all"
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

export default function TopBar({ titulo, user, enMenu, onGoMenu, onLogout }: Props) {
  const inicial = user.user.charAt(0).toUpperCase();

  return (
    <div className="card-elevated px-4 py-3 mb-5 flex items-center gap-3">
      <Logo size="sm" onClick={onGoMenu} />

      {!enMenu && (
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
          <span>/</span>
          <span className="text-[var(--text)] font-medium">{titulo}</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {inicial}
        </div>

        <div className="hidden sm:block text-right">
          <div className="text-xs font-medium leading-tight">{user.user}</div>
          <div className="text-[10px] text-[var(--text-muted)]">{user.rol}</div>
        </div>

        {!enMenu && (
          <button
            onClick={onGoMenu}
            className="text-sm px-3 py-1.5 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-muted)] transition-all active:scale-95"
          >
            Menú
          </button>
        )}

        <button
          onClick={onLogout}
          className="text-sm px-3 py-1.5 border border-[var(--border)] rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800 transition-all active:scale-95"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
