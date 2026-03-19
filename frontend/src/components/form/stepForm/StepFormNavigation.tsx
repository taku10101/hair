import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { StepFormNavigationProps } from "./types";

/**
 * ステップフォームのナビゲーションボタン
 * 前へ・次へ・送信ボタンを提供
 */
export function StepFormNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  isNextDisabled = false,
  labels,
  isSubmitting = false,
}: StepFormNavigationProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between gap-4 pt-6 border-t">
      {/* 前へボタン */}
      {!isFirstStep ? (
        <Button type="button" variant="outline" onClick={onPrev} disabled={isSubmitting}>
          <ChevronLeft />
          {labels.prev}
        </Button>
      ) : (
        <div />
      )}

      {/* 次へ / 送信ボタン */}
      {/* key を指定して React の DOM 再利用を防止（type="button" → "submit" の変更でフォーム送信が発火する問題を回避） */}
      {isLastStep ? (
        <Button
          key="submit"
          type="submit"
          disabled={isNextDisabled || isSubmitting}
          className="ml-auto"
        >
          {isSubmitting ? "送信中..." : labels.submit}
        </Button>
      ) : (
        <Button
          key="next"
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
          className="ml-auto"
        >
          {labels.next}
          <ChevronRight />
        </Button>
      )}
    </div>
  );
}
