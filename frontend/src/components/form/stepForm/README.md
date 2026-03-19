# StepForm コンポーネント

複数画面にわたるフォーム入力を管理するステップフォームコンポーネントです。

## 特徴

- **react-hook-form との完全統合**: 既存のフォームコンポーネントと同じように使用可能
- **URL状態管理**: nuqs を使用してステップ情報をURLで管理（リロード・戻る対応）
- **段階的バリデーション**: 各ステップで指定されたフィールドのみをバリデーション
- **進捗インジケーター**: 視覚的にわかりやすい進捗表示
- **アクセシビリティ対応**: キーボードナビゲーション、ARIA属性のサポート
- **カスタマイズ可能**: ラベル、スタイル、動作をカスタマイズ可能

## 基本的な使い方

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { StepForm, type Step } from "@/components/form"
import { InputField } from "@/components/form"

// スキーマ定義
const schema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  address: z.string().min(1, "住所を入力してください"),
})

type FormData = z.infer<typeof schema>

// ステップ定義
const steps: Step[] = [
  {
    id: "personal",
    title: "個人情報",
    description: "基本情報を入力",
    validationFields: ["name", "email"], // このステップでバリデーションするフィールド
  },
  {
    id: "address",
    title: "住所情報",
    validationFields: ["address"],
  },
  {
    id: "confirm",
    title: "確認",
  },
]

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  })

  const handleSubmit = async (data: FormData) => {
    console.log("送信:", data)
    // API リクエストなど
  }

  return (
    <StepForm steps={steps} form={form} onSubmit={handleSubmit}>
      {(currentStep) => {
        switch (currentStep) {
          case 0:
            return (
              <div className="space-y-4">
                <h2>個人情報を入力</h2>
                <InputField name="name" label="お名前" required />
                <InputField name="email" label="メール" type="email" required />
              </div>
            )

          case 1:
            return (
              <div className="space-y-4">
                <h2>住所を入力</h2>
                <InputField name="address" label="住所" required />
              </div>
            )

          case 2:
            return (
              <div className="space-y-4">
                <h2>入力内容の確認</h2>
                <dl>
                  <dt>お名前:</dt>
                  <dd>{form.watch("name")}</dd>
                  <dt>メール:</dt>
                  <dd>{form.watch("email")}</dd>
                  <dt>住所:</dt>
                  <dd>{form.watch("address")}</dd>
                </dl>
              </div>
            )

          default:
            return null
        }
      }}
    </StepForm>
  )
}
```

## API リファレンス

### StepForm Props

| Prop | 型 | 必須 | 説明 |
|------|------|------|------|
| `steps` | `Step[]` | ✓ | ステップの定義配列 |
| `form` | `UseFormReturn<TFieldValues>` | ✓ | react-hook-form のフォームインスタンス |
| `onSubmit` | `(data: TFieldValues) => void \| Promise<void>` | ✓ | 最終送信時のハンドラ |
| `children` | `(currentStep: number) => React.ReactNode` | ✓ | 各ステップのコンテンツをレンダリングする関数 |
| `className` | `string` | - | カスタムクラス名 |
| `labels` | `{ next?: string; prev?: string; submit?: string }` | - | ナビゲーションボタンのラベル |
| `onStepChange` | `(step: number) => void` | - | ステップ変更時のコールバック |
| `isSubmitting` | `boolean` | - | 送信中の状態 |

### Step 型

```typescript
type Step = {
  id: string                // ステップのID（一意）
  title: string             // ステップのタイトル
  description?: string      // ステップの説明（オプション）
  validationFields?: string[] // バリデーション対象のフィールド名（オプション）
}
```

### useStepForm フック

コンポーネント外でステップ管理が必要な場合に使用できます。

```typescript
const {
  currentStep,      // 現在のステップ（0-indexed）
  goToNextStep,     // 次のステップへ移動（バリデーション実行）
  goToPrevStep,     // 前のステップへ移動
  goToStep,         // 特定のステップへ移動
  isFirstStep,      // 最初のステップかどうか
  isLastStep,       // 最後のステップかどうか
  validateStep,     // 指定ステップのバリデーション
} = useStepForm(steps, form, {
  onStepChange: (step) => console.log("ステップ変更:", step),
  paramName: "step", // URLパラメータ名（デフォルト: "step"）
})
```

## 高度な使い方

### ステップ間でデータを共有

`form.watch()` を使用してステップ間でデータを共有できます。

```tsx
<StepForm steps={steps} form={form} onSubmit={handleSubmit}>
  {(currentStep) => {
    const values = form.watch()

    switch (currentStep) {
      case 0:
        return <Step1 />

      case 1:
        // 前のステップのデータを使用
        return <Step2 previousData={values} />

      case 2:
        // 確認画面で全データを表示
        return <ConfirmStep data={values} />
    }
  }}
</StepForm>
```

### カスタムバリデーション

`validationFields` を使用せず、独自のバリデーションロジックを実装できます。

```tsx
const steps: Step[] = [
  {
    id: "step1",
    title: "ステップ1",
    // validationFields を省略
  },
]

// useStepForm を直接使用
const { currentStep, goToNextStep } = useStepForm(steps, form)

const handleNext = async () => {
  // カスタムバリデーション
  const isValid = await customValidation()
  if (isValid) {
    await goToNextStep()
  }
}
```

### 動的なステップ生成

条件に応じてステップを動的に生成できます。

```tsx
const steps: Step[] = useMemo(() => {
  const baseSteps = [
    { id: "personal", title: "個人情報", validationFields: ["name"] },
  ]

  // 条件に応じてステップを追加
  if (needsAddress) {
    baseSteps.push({
      id: "address",
      title: "住所情報",
      validationFields: ["address"],
    })
  }

  baseSteps.push({ id: "confirm", title: "確認" })

  return baseSteps
}, [needsAddress])
```

### ステップクリックの制御

進捗インジケーターのステップをクリックして移動できます（デフォルトで有効）。

```tsx
<StepFormIndicator
  steps={steps}
  currentStep={currentStep}
  clickable={true}  // クリック可能（デフォルト: false）
  onStepClick={(step) => console.log("クリックされたステップ:", step)}
/>
```

### ナビゲーションのカスタマイズ

```tsx
<StepForm
  steps={steps}
  form={form}
  onSubmit={handleSubmit}
  labels={{
    next: "次へ進む",
    prev: "前に戻る",
    submit: "確定する",
  }}
/>
```

## スタイリング

TailwindCSS を使用してカスタマイズできます。

```tsx
<StepForm
  className="max-w-4xl mx-auto bg-card p-8 rounded-lg shadow-lg"
  steps={steps}
  form={form}
  onSubmit={handleSubmit}
>
  {(currentStep) => (
    <div className="min-h-[500px] space-y-6">
      {/* コンテンツ */}
    </div>
  )}
</StepForm>
```

## URL 状態管理

ステップ情報は URL パラメータとして保存されます（デフォルト: `?step=1`）。

**メリット:**
- ページをリロードしても現在のステップが保持される
- ブラウザの戻る/進むボタンが動作する
- URLを共有してステップを指定できる

**パラメータ名の変更:**

```tsx
const { currentStep } = useStepForm(steps, form, {
  paramName: "currentStep", // ?currentStep=1
})
```

## アクセシビリティ

- `role="group"` と `aria-labelledby` でステップをグループ化
- `aria-current="step"` で現在のステップを明示
- キーボードナビゲーション対応
- フォーカス管理

## 実装例

完全な実装例は `StepFormExample.tsx` を参照してください。

```tsx
import { StepFormExample } from "@/components/form/stepForm/StepFormExample"
```

## Tips

1. **バリデーションフィールドの指定**: 各ステップで必要なフィールドのみを `validationFields` に指定すると、効率的なバリデーションが可能です。

2. **確認画面**: 最終ステップでは `validationFields` を省略し、確認画面として使用するのが一般的です。

3. **エラー表示**: react-hook-form のエラーは自動的に各フィールドに表示されます。

4. **送信中の状態**: `isSubmitting` を使用してボタンを無効化できます。

```tsx
<StepForm
  steps={steps}
  form={form}
  onSubmit={handleSubmit}
  isSubmitting={form.formState.isSubmitting}
/>
```

5. **条件付きレンダリング**: ステップ内で条件に応じてフィールドを表示・非表示にできます。

```tsx
{currentStep === 0 && (
  <>
    <InputField name="name" label="名前" />
    {showOptional && <InputField name="nickname" label="ニックネーム" />}
  </>
)}
```
