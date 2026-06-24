import React from "react";
import clsx from "clsx";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("receipt-card p-6 transition-shadow duration-200", className)} {...props}>
      {children}
    </div>
  );
}

type BadgeTone = "marigold" | "workshop" | "ink" | "clay";

const toneStyles: Record<BadgeTone, string> = {
  marigold: "text-marigold-dark",
  workshop: "text-workshop-dark",
  ink: "text-ink",
  clay: "text-clay",
};

export function StampBadge({
  children,
  tone = "marigold",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return <span className={clsx("stamp-badge", toneStyles[tone], className)}>{children}</span>;
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full bg-paper-line/60 px-3 py-1 text-xs font-medium text-ink-soft",
        className
      )}
    >
      {children}
    </span>
  );
}
