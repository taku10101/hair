import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepFormIndicatorProps } from "./types";

/**
 * ステップフォームの進捗インジケーター
 * 各ステップの状態（完了・現在・未完了）を視覚的に表示
 */
export function StepFormIndicator({
  steps,
  currentStep,
  clickable = false,
  onStepClick,
}: StepFormIndicatorProps) {
  return (
    <div className="w-full">
      <nav aria-label="進捗状況">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = clickable && (isCompleted || isCurrent);

            return (
              <li
                key={step.id}
                className={cn("flex flex-1 items-center", index !== steps.length - 1 && "pr-4")}
              >
                <div className="flex flex-col items-center gap-2 flex-1">
                  {/* ステップ番号またはチェックマーク */}
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick?.(index)}
                    disabled={!isClickable}
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      isCurrent &&
                        "border-primary bg-background text-primary ring-4 ring-primary/20",
                      !isCompleted &&
                        !isCurrent &&
                        "border-muted-foreground/30 bg-background text-muted-foreground",
                      isClickable && "cursor-pointer hover:border-primary hover:text-primary",
                      !isClickable && "cursor-not-allowed"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isCompleted ? <Check className="size-5" /> : <span>{index + 1}</span>}
                  </button>

                  {/* ステップタイトル */}
                  <div className="text-center">
                    <div
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isCurrent && "text-primary",
                        isCompleted && "text-foreground",
                        !isCompleted && !isCurrent && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div className="text-xs text-muted-foreground mt-1">{step.description}</div>
                    )}
                  </div>
                </div>

                {/* 連結線 */}
                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      "h-[2px] flex-1 transition-colors",
                      isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
