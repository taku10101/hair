import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { InputField, SelectField } from "@/components/form";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { authenticatedFetch } from "@/lib/apiClient";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface InviteUserFormData {
  email: string;
  name: string;
  password: string;
  role: "ADMIN" | "SALARY";
}

export function InviteUserDialog({ open, onOpenChange, onSuccess }: InviteUserDialogProps) {
  const methods = useForm<InviteUserFormData>({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      role: "SALARY",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: InviteUserFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await authenticatedFetch("/api/auth/invite", {
        method: "POST",
        body: JSON.stringify(data),
      });

      toast.success("ユーザーを招待しました。");
      methods.reset();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "招待に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ユーザーを招待</DialogTitle>
          <DialogDescription>
            新しいユーザーを招待します。入力された情報でユーザーアカウントが作成されます。
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <InputField
                name="email"
                label="メールアドレス"
                type="email"
                rules={{
                  required: "メールアドレスは必須です",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "有効なメールアドレスを入力してください",
                  },
                }}
              />
              <InputField name="name" label="名前" rules={{ required: "名前は必須です" }} />
              <InputField
                name="password"
                label="パスワード"
                type="password"
                rules={{
                  required: "パスワードは必須です",
                  minLength: {
                    value: 8,
                    message: "パスワードは8文字以上で入力してください",
                  },
                }}
              />
              <SelectField
                name="role"
                label="ロール"
                options={[
                  { label: "SALARY", value: "SALARY" },
                  { label: "ADMIN", value: "ADMIN" },
                ]}
              />
              {error && <div className="text-sm text-destructive">{error}</div>}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "招待中..." : "招待"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
