import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Form } from "../Form";
import { StepFormIndicator } from "./StepFormIndicator";
import { StepFormNavigation } from "./StepFormNavigation";
import type { StepFormProps } from "./types";
import { useStepForm } from "./useStepForm";

/**
 * 複数画面にわたるフォーム入力を管理するステップフォームコンポーネント
 *
 * @example
 * ```tsx
 * const steps = [
 *   { id: 'personal', title: '個人情報', validationFields: ['name', 'email'] },
 *   { id: 'address', title: '住所情報', validationFields: ['zipCode', 'address'] },
 *   { id: 'confirm', title: '確認' }
 * ]
 *
 * <StepForm steps={steps} form={form} onSubmit={handleSubmit}>
 *   {(currentStep) => {
 *     switch (currentStep) {
 *       case 0:
 *         return <PersonalInfoStep />
 *       case 1:
 *         return <AddressInfoStep />
 *       case 2:
 *         return <ConfirmStep />
 *     }
 *   }}
 * </StepForm>
 * ```
 */
export function StepForm<TFieldValues extends FieldValues>({
  steps,
  form,
  onSubmit,
  children,
  className,
  labels = {},
  onStepChange,
  isSubmitting = false,
}: StepFormProps<TFieldValues>) {
  const { currentStep, goToNextStep, goToPrevStep, goToStep, isLastStep } = useStepForm(
    steps,
    form,
    { onStepChange }
  );

  const navigationLabels = {
    next: labels.next ?? "次へ",
    prev: labels.prev ?? "戻る",
    submit: labels.submit ?? "送信",
  };

  const handleSubmit = async (data: TFieldValues) => {
    if (!isLastStep) {
      // 最後のステップでない場合は次へ進む
      await goToNextStep();
      return;
    }

    // 最後のステップの場合は送信
    await onSubmit(data);
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* 進捗インジケーター */}
      <StepFormIndicator
        steps={steps}
        currentStep={currentStep}
        clickable={true}
        onStepClick={goToStep}
      />

      {/* フォーム本体 */}
      <Form form={form} onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 現在のステップのコンテンツ */}
          <div role="group" aria-labelledby={`step-${currentStep}-title`} className="min-h-[400px]">
            {children(currentStep)}
          </div>

          {/* ナビゲーションボタン */}
          <StepFormNavigation
            currentStep={currentStep}
            totalSteps={steps.length}
            onPrev={goToPrevStep}
            onNext={goToNextStep}
            labels={navigationLabels}
            isSubmitting={isSubmitting}
          />
        </div>
      </Form>
    </div>
  );
}
