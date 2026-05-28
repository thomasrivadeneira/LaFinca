"use client";

import { useState, useEffect } from "react";
import type { Usuario } from "@/types";
import Logo from "./Logo";

interface Props {
  usuarios: Usuario[];
  onLogin: (u: Usuario) => void;
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
      className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-muted)] flex items-center justify-center transition-all"
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function Login({ usuarios, onLogin }: Props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    const u = usuarios.find(
      (x) => x.user === user.trim() && x.pass === pass && x.activo
    );
    if (u) {
      setLoading(true);
      setTimeout(() => onLogin(u), 600);
    } else {
      setErr("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm animate-scale-in">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Iniciá sesión para continuar
          </p>
        </div>

        <div className="card-elevated p-7 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Usuario
            </label>
            <input
              type="text"
              value={user}
              autoFocus
              onChange={(e) => { setUser(e.target.value); setErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Tu usuario"
              className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
            />
          </div>

          {err && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {err}
            </p>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all active:scale-95 shadow-sm shadow-indigo-500/30 disabled:opacity-60 mt-2"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-5">
          <span className="text-xs text-[var(--text-muted)]">Usuarios de prueba:</span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--bg-muted)] border border-[var(--border)] font-mono text-[var(--text)]">
            admin/admin
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--bg-muted)] border border-[var(--border)] font-mono text-[var(--text)]">
            operador/operador
          </span>
        </div>
      </div>
    </div>
  );
}
