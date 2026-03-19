import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
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
import type { DbUser } from "@/types/auth";

interface EditUserDialogProps {
  user: DbUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  role: "ADMIN" | "SALARY";
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  const methods = useForm<UserFormData>({
    defaultValues: {
      name: "",
      email: "",
      role: "SALARY",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      methods.reset({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user, methods]);

  const handleSubmit = async (data: UserFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await authenticatedFetch(`/api/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ユーザー編集</DialogTitle>
          <DialogDescription>
            ユーザー情報を編集します。変更後、保存ボタンをクリックしてください。
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <InputField name="name" label="名前" rules={{ required: "名前は必須です" }} />
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
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
