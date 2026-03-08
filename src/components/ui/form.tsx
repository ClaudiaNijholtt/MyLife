import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-slate-600 mb-1 select-none">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base md:text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 touch-manipulation ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-slate-600 mb-1 select-none">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base md:text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 touch-manipulation ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function Select({ label, error, className = "", children, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-slate-600 mb-1 select-none">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base md:text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 touch-manipulation ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
