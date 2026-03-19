import { zodResolver } from "@hookform/resolvers/zod";
import { sendEmailVerification } from "firebase/auth";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { authenticatedFetch } from "@/lib/apiClient";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { type SignupFormData, signupSchema } from "@/schemas";

export const useSignupForm = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      // Step 1: Firebase認証（パスワードはサーバーに送らない）
      const userCredential = await signUp(data.email, data.password);

      // Step 2: メール確認送信（開発環境ではスキップ可能）
      if (import.meta.env.VITE_ENABLE_EMAIL_VERIFICATION !== "false") {
        await sendEmailVerification(userCredential.user);
      }

      // Step 3: DB同期（ユーザー情報をDBに保存）
      await authenticatedFetch("/api/auth/sync", {
        method: "POST",
        body: JSON.stringify({ name: data.name }),
      });

      navigate("/");
    } catch (err) {
      const { field = "root", message } = getAuthErrorMessage(err);
      form.setError(field, { message });
    }
  };

  return {
    form,
    onSubmit,
  };
};
