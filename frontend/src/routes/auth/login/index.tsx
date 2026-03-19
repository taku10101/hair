import { Link } from "react-router-dom";
import { Form, InputField } from "@/components/form";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/Field";
import { AuthLayout } from "../components/AuthLayout";
import { useLoginForm } from "../hooks/useLoginForm";

export const LoginPage = () => {
  const { form, onSubmit } = useLoginForm();
  const {
    formState: { isSubmitting, errors },
  } = form;

  return (
    <AuthLayout title="ログイン" description="アカウントにログインしてください">
      <Form form={form} onSubmit={onSubmit} className="space-y-4">
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
          autoComplete="current-password"
          placeholder="********"
          disabled={isSubmitting}
        />

        {errors.root && <FieldError>{String(errors.root.message)}</FieldError>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </Button>
      </Form>

      <div className="text-center text-sm">
        <span className="text-gray-500">アカウントをお持ちでない方は </span>
        <Link
          to="/signup"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          新規登録
        </Link>
      </div>
    </AuthLayout>
  );
};
