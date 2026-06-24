import React from "react";
import clsx from "clsx";

export default function ProgressBar({
  value,
  label,
  tone = "marigold",
  className,
}: {
  value: number;
  label?: string;
  tone?: "marigold" | "workshop";
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const barColor = tone === "workshop" ? "bg-workshop" : "bg-marigold";

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-mono text-ink-soft">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-paper-line overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
