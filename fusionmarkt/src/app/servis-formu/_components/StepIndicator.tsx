import { Check } from "lucide-react";

export type StepDefinition = {
  id: number;
  label: string;
};

type Props = {
  steps: StepDefinition[];
  current: number;
  onStepClick: (step: number) => void;
};

export function StepIndicator({ steps, current, onStepClick }: Props) {
  return (
    <ol className="flex items-start gap-1 sm:gap-2 mb-8">
      {steps.map((step, index) => {
        const isDone = step.id < current;
        const isActive = step.id === current;
        return (
          <li key={step.id} className="flex-1 flex items-start gap-1 sm:gap-2 min-w-0">
            <button
              type="button"
              onClick={() => isDone && onStepClick(step.id)}
              disabled={!isDone}
              aria-current={isActive ? "step" : undefined}
              className={`flex-1 min-w-0 flex flex-col items-center gap-1.5 sm:gap-2 ${
                isDone ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-semibold border transition-colors ${
                  isDone
                    ? "bg-[var(--fusion-success)] border-[var(--fusion-success)] text-white"
                    : isActive
                      ? "bg-[var(--fusion-primary)] border-[var(--fusion-primary)] text-white"
                      : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--foreground-tertiary)]"
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : step.id}
              </span>
              <span
                className={`text-[10px] sm:text-xs text-center leading-tight ${
                  isActive
                    ? "text-[var(--foreground)] font-medium"
                    : "text-[var(--foreground-tertiary)]"
                }`}
              >
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={`hidden sm:block h-px flex-1 mt-[18px] ${
                  isDone ? "bg-[var(--fusion-success)]" : "bg-[var(--glass-border)]"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
