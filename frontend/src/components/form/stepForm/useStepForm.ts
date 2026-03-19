import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useEffect } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import type { Step } from "./types";

/**
 * ステップフォームの状態管理フック
 * URL状態管理（nuqs）を使用してステップ情報を保持
 */
export function useStepForm<TFieldValues extends FieldValues>(
  steps: Step[],
  form: UseFormReturn<TFieldValues>,
  options?: {
    /** ステップ変更時のコールバック */
    onStepChange?: (step: number) => void;
    /** URLパラメータ名（デフォルト: "step"） */
    paramName?: string;
  }
) {
  const paramName = options?.paramName ?? "step";

  // URL状態管理でステップを管理（1から開始）
  const [currentStep, setCurrentStep] = useQueryState(paramName, parseAsInteger.withDefault(1));

  // 0-indexedに変換
  const currentStepIndex = currentStep - 1;

  // ステップ変更時のコールバック
  useEffect(() => {
    if (options?.onStepChange) {
      options.onStepChange(currentStepIndex);
    }
  }, [currentStepIndex, options]);

  /**
   * 指定されたステップのバリデーション
   */
  const validateStep = useCallback(
    async (stepIndex: number): Promise<boolean> => {
      const step = steps[stepIndex];
      if (!step?.validationFields || step.validationFields.length === 0) {
        return true;
      }

      // 型アサーションを使用してreact-hook-formの型システムを満たす
      const result = await form.trigger(step.validationFields as never);
      return result;
    },
    [steps, form]
  );

  /**
   * 次のステップへ移動
   */
  const goToNextStep = useCallback(async () => {
    const isValid = await validateStep(currentStepIndex);
    if (!isValid) {
      return false;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return true;
    }
    return false;
  }, [currentStepIndex, steps.length, currentStep, setCurrentStep, validateStep]);

  /**
   * 前のステップへ移動
   */
  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStepIndex, currentStep, setCurrentStep]);

  /**
   * 特定のステップへ移動
   */
  const goToStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= steps.length) {
        return false;
      }

      // 前のステップへ戻る場合はバリデーション不要
      if (stepIndex < currentStepIndex) {
        setCurrentStep(stepIndex + 1);
        return true;
      }

      // 次のステップへ進む場合は現在のステップをバリデーション
      const isValid = await validateStep(currentStepIndex);
      if (!isValid) {
        return false;
      }

      setCurrentStep(stepIndex + 1);
      return true;
    },
    [steps.length, currentStepIndex, setCurrentStep, validateStep]
  );

  /**
   * 最初のステップかどうか
   */
  const isFirstStep = currentStepIndex === 0;

  /**
   * 最後のステップかどうか
   */
  const isLastStep = currentStepIndex === steps.length - 1;

  return {
    currentStep: currentStepIndex,
    goToNextStep,
    goToPrevStep,
    goToStep,
    isFirstStep,
    isLastStep,
    validateStep,
  };
}
