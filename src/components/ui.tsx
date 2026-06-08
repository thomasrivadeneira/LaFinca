"use client";

import { ReactNode } from "react";

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`card-elevated ${className}`}>
    {children}
  </div>
);

export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
    {children}
  </p>
);

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">{label}</label>
    {children}
  </div>
);

const baseInput =
  "w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors placeholder:text-[var(--text-muted)]";

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${baseInput} ${props.className ?? ""}`} />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`${baseInput} ${props.className ?? ""}`}>
    {props.children}
  </select>
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`${baseInput} ${props.className ?? ""}`} />
);

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}

export const Button = ({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...rest
}: BtnProps) => {
  const styles = {
    primary:
      "bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white border-indigo-600 shadow-sm shadow-indigo-500/30",
    secondary:
      "bg-[var(--bg-elevated)] hover:bg-[var(--bg-muted)] border-[var(--border)] text-[var(--text)]",
    danger:
      "bg-[var(--bg-elevated)] hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-[var(--border)]",
    ghost:
      "bg-transparent hover:bg-[var(--bg-muted)] border-transparent text-[var(--text)]",
  }[variant];

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3.5 py-2 text-sm",
  }[size];

  return (
    <button
      {...rest}
      className={`font-medium border rounded-xl transition-all active:scale-95 ${styles} ${sizes} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

export const Table = ({ children }: { children: ReactNode }) => (
  <div className="card-elevated overflow-hidden">
    <table className="w-full border-collapse">{children}</table>
  </div>
);

export const Th = ({
  children,
  align = "left",
}: {
  children?: ReactNode;
  align?: "left" | "right";
}) => (
  <th
    className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-muted)] text-${align}`}
  >
    {children}
  </th>
);

export const Td = ({
  children,
  align = "left",
  className = "",
}: {
  children?: ReactNode;
  align?: "left" | "right";
  className?: string;
}) => (
  <td
    className={`px-3 py-2.5 text-sm border-b border-[var(--border)] text-${align} ${className}`}
  >
    {children}
  </td>
);

export const Badge = ({
  children,
  color = "blue",
}: {
  children: ReactNode;
  color?: "blue" | "green" | "red" | "gray" | "yellow";
}) => {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-800",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-green-200 dark:ring-green-800",
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-800",
    gray: "bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-600",
    yellow: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-700",
  }[color];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md ring-1 ring-inset font-medium ${colors}`}>
      {children}
    </span>
  );
};
