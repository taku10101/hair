/**
 * Example usage of Form components with React Hook Form and Zod
 *
 * This demonstrates two patterns:
 * 1. Using simple field components (InputField, SelectField)
 * 2. Using FormField with Controller for more control
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CheckboxField,
  DatePickerField,
  Form,
  FormField,
  InputField,
  SelectField,
  TextareaField,
} from "@/components/form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// バリデーションスキーマを定義
const userFormSchema = z.object({
  name: z.string().min(1, { message: "名前は必須です" }),
  email: z.string().email({ message: "有効なメールアドレスを入力してください" }),
  role: z.string().min(1, { message: "役割を選択してください" }),
  bio: z.string().optional(),
  dateOfBirth: z.date().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "利用規約への同意が必要です",
  }),
  newsletter: z.boolean().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function ExampleFormSimple() {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      bio: "",
      dateOfBirth: undefined,
      agreeToTerms: false,
      newsletter: false,
    },
  });

  const onSubmit = (_data: UserFormValues) => {};

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6 max-w-md">
      <InputField
        name="name"
        label="名前"
        description="あなたの名前を入力してください"
        placeholder="山田太郎"
      />

      <InputField
        name="email"
        label="メールアドレス"
        type="email"
        placeholder="yamada@example.com"
      />

      <SelectField
        name="role"
        label="役割"
        placeholder="役割を選択"
        options={[
          { label: "開発者", value: "developer" },
          { label: "デザイナー", value: "designer" },
          { label: "マネージャー", value: "manager" },
        ]}
      />

      <TextareaField
        name="bio"
        label="自己紹介"
        description="任意で自己紹介を入力してください"
        placeholder="あなたについて教えてください..."
      />

      <DatePickerField
        name="dateOfBirth"
        label="生年月日"
        description="生年月日を選択してください"
        captionLayout="dropdown"
        fromYear={1900}
        toYear={new Date().getFullYear()}
      />

      <CheckboxField
        name="agreeToTerms"
        label="利用規約に同意します"
        description="続けるには利用規約への同意が必要です"
      />

      <CheckboxField
        name="newsletter"
        label="ニュースレターを受け取る"
        description="最新情報をメールで受け取ります（任意）"
      />

      <Button type="submit">送信</Button>
    </Form>
  );
}

// Controllerを使用したFormFieldの高度な例
export function ExampleFormAdvanced() {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      bio: "",
      dateOfBirth: undefined,
      agreeToTerms: false,
      newsletter: false,
    },
  });

  const onSubmit = (_data: UserFormValues) => {};

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6 max-w-md">
      <FormField name="name" control={form.control}>
        {(field) => (
          <>
            <FormField.Label>名前</FormField.Label>
            <FormField.Description>あなたの名前を入力してください</FormField.Description>
            <Input {...field} placeholder="山田太郎" />
            <FormField.Error />
          </>
        )}
      </FormField>

      <FormField name="email" control={form.control}>
        {(field) => (
          <>
            <FormField.Label>メールアドレス</FormField.Label>
            <Input {...field} type="email" placeholder="yamada@example.com" />
            <FormField.Error />
          </>
        )}
      </FormField>

      {/* Mix and match - you can use simple fields too */}
      <SelectField
        name="role"
        label="役割"
        placeholder="役割を選択"
        options={[
          { label: "開発者", value: "developer" },
          { label: "デザイナー", value: "designer" },
          { label: "マネージャー", value: "manager" },
        ]}
      />

      <Button type="submit">送信</Button>
    </Form>
  );
}
