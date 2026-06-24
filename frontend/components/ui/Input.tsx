import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "w-full rounded-lg border border-paper-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/50",
          "focus:border-marigold focus:outline-none focus:ring-1 focus:ring-marigold transition-colors",
          error && "border-clay focus:border-clay focus:ring-clay",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-clay">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          "w-full rounded-lg border border-paper-line bg-white px-4 py-2.5 text-sm text-ink",
          "focus:border-marigold focus:outline-none focus:ring-1 focus:ring-marigold transition-colors",
          error && "border-clay",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-clay">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  const areaId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        className={clsx(
          "w-full rounded-lg border border-paper-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/50",
          "focus:border-marigold focus:outline-none focus:ring-1 focus:ring-marigold transition-colors",
          error && "border-clay",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-clay">{error}</p>}
    </div>
  );
}
