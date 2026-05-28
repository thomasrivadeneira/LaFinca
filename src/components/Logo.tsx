"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export default function Logo({ size = "md", onClick }: LogoProps) {
  const sizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-3xl",
  };

  return (
    <span
      onClick={onClick}
      className={`font-display font-bold tracking-tight select-none ${sizes[size]} ${onClick ? "cursor-pointer" : ""}`}
    >
      <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
        La Finca
      </span>
      <span className="text-slate-700 dark:text-slate-200"> · Planillas</span>
    </span>
  );
}
