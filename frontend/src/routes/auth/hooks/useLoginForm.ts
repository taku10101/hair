import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { type LoginFormData, loginSchema } from "@/schemas";

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
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
