import { Link } from "react-router-dom";
import { Form, InputField } from "@/components/form";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/Field";
import { AuthLayout } from "../components/AuthLayout";
import { useSignupForm } from "../hooks/useSignupForm";

export const SignupPage = () => {
  const { form, onSubmit } = useSignupForm();
  const {
    formState: { isSubmitting, errors },
  } = form;

  return (
    <AuthLayout title="新規登録" description="アカウントを作成してください">
      <Form form={form} onSubmit={onSubmit} className="space-y-4">
        <InputField
          name="name"
          label="名前"
          type="text"
          autoComplete="name"
          placeholder="山田太郎"
          disabled={isSubmitting}
        />

        <InputField
          name="email"
          label="メールアドレス"
          type="email"
          autoComplete="email"
          placeholder="example@example.com"
          disabled={isSubmitting}
        />

        <InputField
          name="password"
          label="パスワード"
          type="password"
          autoComplete="new-password"
          placeholder="********"
          description="8文字以上で入力してください"
          disabled={isSubmitting}
        />

        {errors.root && <FieldError>{String(errors.root.message)}</FieldError>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "登録中..." : "登録"}
        </Button>
      </Form>

      <div className="text-center text-sm">
        <span className="text-gray-500">既にアカウントをお持ちの方は </span>
        <Link
          to="/login"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          ログイン
        </Link>
      </div>
    </AuthLayout>
  );
};
