import type { RoadmapStep } from "@/lib/types";
import { ShieldCheck, Wrench, Scale, Calculator, Megaphone, Rocket, CheckCircle2, Circle } from "lucide-react";
import clsx from "clsx";

const phaseConfig: Record<string, { icon: any; label: string; color: string }> = {
  VALIDATION: { icon: ShieldCheck, label: "Validation", color: "text-workshop" },
  SKILLS_TOOLS: { icon: Wrench, label: "Skills & Tools", color: "text-marigold" },
  LEGAL: { icon: Scale, label: "Legal & Registration", color: "text-ink" },
  COST: { icon: Calculator, label: "Cost Estimation", color: "text-clay" },
  MARKETING: { icon: Megaphone, label: "Marketing Basics", color: "text-marigold-dark" },
  LAUNCH: { icon: Rocket, label: "Launch", color: "text-workshop-dark" },
};

export default function RoadmapStepList({
  steps,
  completedStepIds,
  onToggleStep,
}: {
  steps: RoadmapStep[];
  completedStepIds?: Set<string>;
  onToggleStep?: (stepId: string, isComplete: boolean) => void;
}) {
  return (
    <ol className="relative space-y-0">
      {steps.map((step, idx) => {
        const config = phaseConfig[step.phase] || phaseConfig.VALIDATION;
        const Icon = config.icon;
        const isComplete = completedStepIds?.has(step.id);
        const isLast = idx === steps.length - 1;

        return (
          <li key={step.id} className="relative flex gap-4 pb-8">
            {!isLast && <span className="absolute left-[19px] top-10 h-full w-px bg-paper-line" aria-hidden />}

            <button
              type="button"
              disabled={!onToggleStep}
              onClick={() => onToggleStep?.(step.id, !isComplete)}
              className={clsx(
                "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors",
                isComplete ? "border-workshop text-workshop" : "border-paper-line text-ink-soft",
                onToggleStep && "cursor-pointer hover:border-marigold hover:text-marigold"
              )}
              aria-label={isComplete ? "Mark as not complete" : "Mark as complete"}
            >
              {isComplete ? <CheckCircle2 size={20} /> : <Icon size={18} />}
            </button>

            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <span className={clsx("text-xs font-mono uppercase tracking-wider", config.color)}>{config.label}</span>
                <span className="text-xs text-ink-soft">· ~{step.estDays} days</span>
              </div>
              <h4 className={clsx("mt-1 font-display text-lg font-semibold", isComplete ? "text-ink-soft line-through" : "text-ink")}>
                {step.title}
              </h4>
              <p className="mt-1 text-sm text-ink-soft">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
