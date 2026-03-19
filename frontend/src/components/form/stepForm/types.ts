import type { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * ステップの定義
 */
export type Step = {
  /** ステップのID（一意） */
  id: string;
  /** ステップのタイトル */
  title: string;
  /** ステップの説明（オプション） */
  description?: string;
  /** ステップのバリデーションフィールド（オプション） */
  validationFields?: string[];
};

/**
 * StepFormコンポーネントのProps
 */
export type StepFormProps<TFieldValues extends FieldValues> = {
  /** ステップの定義配列 */
  steps: Step[];
  /** react-hook-formのフォームインスタンス */
  form: UseFormReturn<TFieldValues>;
  /** 最終送信時のハンドラ */
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  /** 各ステップのコンテンツをレンダリングする関数 */
  children: (currentStep: number) => React.ReactNode;
  /** カスタムクラス名（オプション） */
  className?: string;
  /** ナビゲーションボタンのラベルをカスタマイズ（オプション） */
  labels?: {
    next?: string;
    prev?: string;
    submit?: string;
  };
  /** ステップ変更時のコールバック（オプション） */
  onStepChange?: (step: number) => void;
  /** 送信中の状態（オプション） */
  isSubmitting?: boolean;
};

/**
 * StepFormNavigationコンポーネントのProps
 */
export type StepFormNavigationProps = {
  /** 現在のステップインデックス */
  currentStep: number;
  /** 総ステップ数 */
  totalSteps: number;
  /** 前へボタンのハンドラ */
  onPrev: () => void;
  /** 次へボタンのハンドラ */
  onNext: () => void;
  /** 次へボタンの無効化状態 */
  isNextDisabled?: boolean;
  /** ボタンラベル */
  labels: {
    next: string;
    prev: string;
    submit: string;
  };
  /** 送信中の状態 */
  isSubmitting?: boolean;
};

/**
 * StepFormIndicatorコンポーネントのProps
 */
export type StepFormIndicatorProps = {
  /** ステップの定義配列 */
  steps: Step[];
  /** 現在のステップインデックス */
  currentStep: number;
  /** ステップをクリック可能にするか */
  clickable?: boolean;
  /** ステップクリック時のハンドラ */
  onStepClick?: (step: number) => void;
};
