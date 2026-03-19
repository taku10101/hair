import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckboxField } from "../CheckboxField";
import { InputField } from "../InputField";
import { SelectField } from "../SelectField";
import { TextareaField } from "../TextareaField";
import { StepForm } from "./StepForm";
import type { Step } from "./types";

// バリデーションスキーマ
const stepFormSchema = z.object({
  // ステップ1: 個人情報
  name: z.string().min(1, "名前を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  phone: z.string().min(1, "電話番号を入力してください"),

  // ステップ2: 住所情報
  zipCode: z.string().regex(/^\d{3}-?\d{4}$/, "郵便番号の形式が正しくありません"),
  prefecture: z.string().min(1, "都道府県を選択してください"),
  city: z.string().min(1, "市区町村を入力してください"),
  address: z.string().min(1, "番地を入力してください"),

  // ステップ3: その他情報
  interests: z.array(z.string()).optional(),
  message: z.string().optional(),
  agree: z.boolean().refine((val) => val === true, {
    message: "利用規約に同意してください",
  }),
});

type StepFormData = z.infer<typeof stepFormSchema>;

// ステップ定義
const steps: Step[] = [
  {
    id: "personal",
    title: "個人情報",
    description: "基本情報を入力",
    validationFields: ["name", "email", "phone"],
  },
  {
    id: "address",
    title: "住所情報",
    description: "お届け先を入力",
    validationFields: ["zipCode", "prefecture", "city", "address"],
  },
  {
    id: "other",
    title: "その他",
    description: "追加情報を入力",
    validationFields: ["agree"],
  },
  {
    id: "confirm",
    title: "確認",
    description: "内容を確認",
  },
];

/**
 * StepFormコンポーネントの使用例
 */
export function StepFormExample() {
  const form = useForm<StepFormData>({
    resolver: zodResolver(stepFormSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      zipCode: "",
      prefecture: "",
      city: "",
      address: "",
      interests: [],
      message: "",
      agree: false,
    },
  });

  const handleSubmit = async (_data: StepFormData) => {
    // APIリクエストなどの処理
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("送信完了しました");
  };

  const prefectures = [
    { value: "tokyo", label: "東京都" },
    { value: "osaka", label: "大阪府" },
    { value: "kyoto", label: "京都府" },
  ];

  const watchedValues = form.watch();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ステップフォームサンプル</h1>

      <StepForm
        steps={steps}
        form={form}
        onSubmit={handleSubmit}
        isSubmitting={form.formState.isSubmitting}
      >
        {(currentStep) => {
          switch (currentStep) {
            case 0:
              return (
                <div className="space-y-4">
                  <h2 id="step-0-title" className="text-xl font-semibold">
                    個人情報を入力してください
                  </h2>
                  <InputField name="name" label="お名前" placeholder="山田 太郎" required />
                  <InputField
                    name="email"
                    label="メールアドレス"
                    type="email"
                    placeholder="example@example.com"
                    required
                  />
                  <InputField
                    name="phone"
                    label="電話番号"
                    type="tel"
                    placeholder="090-1234-5678"
                    required
                  />
                </div>
              );

            case 1:
              return (
                <div className="space-y-4">
                  <h2 id="step-1-title" className="text-xl font-semibold">
                    住所情報を入力してください
                  </h2>
                  <InputField name="zipCode" label="郵便番号" placeholder="123-4567" required />
                  <SelectField
                    name="prefecture"
                    label="都道府県"
                    options={prefectures}
                    placeholder="選択してください"
                    required
                  />
                  <InputField name="city" label="市区町村" placeholder="渋谷区" required />
                  <InputField
                    name="address"
                    label="番地・建物名"
                    placeholder="1-2-3 サンプルビル101"
                    required
                  />
                </div>
              );

            case 2:
              return (
                <div className="space-y-4">
                  <h2 id="step-2-title" className="text-xl font-semibold">
                    その他の情報
                  </h2>
                  <TextareaField
                    name="message"
                    label="ご要望・メッセージ"
                    placeholder="ご自由にご記入ください"
                    rows={5}
                  />
                  <CheckboxField name="agree" label="利用規約に同意する" required />
                </div>
              );

            case 3:
              return (
                <div className="space-y-4">
                  <h2 id="step-3-title" className="text-xl font-semibold">
                    入力内容の確認
                  </h2>
                  <div className="bg-muted rounded-lg p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">個人情報</h3>
                      <dl className="space-y-2">
                        <div className="flex gap-4">
                          <dt className="font-medium w-32">お名前:</dt>
                          <dd>{watchedValues.name}</dd>
                        </div>
                        <div className="flex gap-4">
                          <dt className="font-medium w-32">メール:</dt>
                          <dd>{watchedValues.email}</dd>
                        </div>
                        <div className="flex gap-4">
                          <dt className="font-medium w-32">電話番号:</dt>
                          <dd>{watchedValues.phone}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">住所情報</h3>
                      <dl className="space-y-2">
                        <div className="flex gap-4">
                          <dt className="font-medium w-32">郵便番号:</dt>
                          <dd>{watchedValues.zipCode}</dd>
                        </div>
                        <div className="flex gap-4">
                          <dt className="font-medium w-32">都道府県:</dt>
                          <dd>
                            {prefectures.find((p) => p.value === watchedValues.prefecture)?.label ||
                              watchedValues.prefecture}
                          </dd>
                        </div>
                        <div className="flex gap-4">
                          <dt className="font-medium w-32">市区町村:</dt>
                          <dd>{watchedValues.city}</dd>
                        </div>
                        <div className="flex gap-4">
                          <dt className="font-medium w-32">番地:</dt>
                          <dd>{watchedValues.address}</dd>
                        </div>
                      </dl>
                    </div>

                    {watchedValues.message && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                          メッセージ
                        </h3>
                        <p className="whitespace-pre-wrap">{watchedValues.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              );

            default:
              return null;
          }
        }}
      </StepForm>
    </div>
  );
}
