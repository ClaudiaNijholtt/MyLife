import { type ButtonHTMLAttributes } from "react";
import { LoadingSpinner } from "./loading";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "rounded-2xl px-4 py-3 min-h-12 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-slate-900 text-white shadow-sm hover:opacity-90",
    secondary: "bg-white border border-slate-200 text-slate-900 shadow-sm hover:bg-slate-50",
    danger: "bg-red-800 text-white shadow-sm hover:bg-red-600",
    ghost: "text-slate-900 hover:bg-slate-100",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} flex items-center gap-2 justify-center`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}
