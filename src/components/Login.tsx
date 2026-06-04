"use client";

import { useState, useEffect } from "react";
import type { Usuario } from "@/types";
import { supabase } from "@/lib/supabase";
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
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="w-9 h-9 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all"
    >
      {dark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-300">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
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

  const submit = async () => {
    const userTrim = user.trim();
    if (!userTrim || !pass) {
      setErr("Completá usuario y contraseña");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      // Traemos todos los usuarios activos y comparamos en JS
      // (evita problemas con "user" como palabra reservada de PostgreSQL)
      const { data: rows, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("activo", true);

      if (error) {
        console.error("[Supabase] Login error:", error);
        setErr("No se pudo conectar a la base de datos. Verificá tu conexión.");
        setLoading(false);
        return;
      }

      console.log("[Debug] rows from Supabase:", JSON.stringify(rows));
      console.log("[Debug] buscando user:", JSON.stringify(userTrim), "pass:", JSON.stringify(pass));

      const data = (rows ?? []).find(
        (r) => r.user === userTrim && r.pass === pass
      ) ?? null;

      if (!data) {
        setErr("Usuario o contraseña incorrectos");
        setLoading(false);
        return;
      }

      const u: Usuario = {
        id: data.id,
        user: data.user,
        pass: data.pass,
        rol: data.rol,
        activo: data.activo,
      };
      onLogin(u);
    } catch (e) {
      console.error("[Supabase] Error de conexión:", e);
      setErr("No se pudo conectar a la base de datos. Verificá tu conexión.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-700 relative flex-col justify-between p-10 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/10 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Top: theme toggle */}
        <div className="flex justify-end relative z-10">
          <ThemeToggle />
        </div>

        {/* Middle: branding */}
        <div className="relative z-10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            La Finca
            <br />
            <span className="text-white/70 text-2xl font-medium">Planillas</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Sistema de gestión de planillas diarias, gastos, stock de productos y bicarbonatos.
          </p>
        </div>

        {/* Bottom: badges */}
        <div className="relative z-10 flex gap-2 flex-wrap">
          {["Planillas", "Gastos", "Stock", "Reportes"].map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/70 border border-white/10">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Mobile theme toggle */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={() => {
              const next = !document.documentElement.classList.contains("dark");
              document.documentElement.classList.toggle("dark", next);
              try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
            }}
            className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-muted)] flex items-center justify-center transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 dark:text-amber-400">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" className="dark:hidden" />
              <g className="hidden dark:inline">
                <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
              </g>
            </svg>
          </button>
        </div>

        <div className="w-full max-w-sm animate-scale-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold">Bienvenido</h2>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Iniciá sesión para continuar
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={user}
                autoFocus
                onChange={(e) => { setUser(e.target.value); setErr(""); }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Tu usuario"
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={pass}
                onChange={(e) => { setPass(e.target.value); setErr(""); }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all"
              />
            </div>

            {err && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {err}
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-indigo-500/25 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  Ingresando...
                </span>
              ) : "Ingresar"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] mb-2 text-center">Acceso inicial</p>
            <div className="flex justify-center">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] font-mono text-[var(--text)]">
                admin / admin123
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
