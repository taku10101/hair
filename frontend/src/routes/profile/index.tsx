import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { useAuth } from "@/hooks/auth";
import { usePasswordChange } from "./hooks/usePasswordChange";
import { useProfileForm } from "./hooks/useProfileForm";

export function ProfilePage() {
  const { currentUser } = useAuth();
  const profileForm = useProfileForm();
  const passwordChange = usePasswordChange();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">マイページ</h1>
        <p className="text-muted-foreground mt-2">アカウント情報の確認と編集</p>
      </div>

      <Separator />

      {/* プロフィール情報 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">プロフィール情報</h2>

        <div className="space-y-4">
          <div>
            <Label>メールアドレス</Label>
            <Input value={currentUser.email || ""} disabled className="mt-1" />
          </div>

          <div>
            <Label>表示名</Label>
            {profileForm.isEditing ? (
              <div className="space-y-2 mt-1">
                <Input
                  value={profileForm.name}
                  onChange={(e) => profileForm.setName(e.target.value)}
                  placeholder="表示名を入力"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={profileForm.handleSubmit}
                    disabled={profileForm.isUpdating}
                    size="sm"
                  >
                    {profileForm.isUpdating ? "更新中..." : "保存"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={profileForm.handleCancel}
                    disabled={profileForm.isUpdating}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <Input value={currentUser.displayName || ""} disabled />
                <Button variant="outline" size="sm" onClick={() => profileForm.setIsEditing(true)}>
                  編集
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label>メール確認状態</Label>
            <Input
              value={currentUser.emailVerified ? "確認済み" : "未確認"}
              disabled
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* パスワード変更 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">パスワード変更</h2>

        {!passwordChange.isChanging ? (
          <Button variant="outline" onClick={() => passwordChange.setIsChanging(true)}>
            パスワードを変更する
          </Button>
        ) : (
          <div className="space-y-4 border rounded-lg p-4">
            <PasswordField
              id="current-password"
              label="現在のパスワード"
              value={passwordChange.formData.currentPassword}
              onChange={(e) => passwordChange.updateField("currentPassword", e.target.value)}
              showPassword={passwordChange.showPasswords.current}
              onToggle={() => passwordChange.togglePasswordVisibility("current")}
            />

            <PasswordField
              id="new-password"
              label="新しいパスワード"
              value={passwordChange.formData.newPassword}
              onChange={(e) => passwordChange.updateField("newPassword", e.target.value)}
              showPassword={passwordChange.showPasswords.new}
              onToggle={() => passwordChange.togglePasswordVisibility("new")}
              placeholder="8文字以上"
            />

            <PasswordField
              id="confirm-password"
              label="新しいパスワード（確認）"
              value={passwordChange.formData.confirmPassword}
              onChange={(e) => passwordChange.updateField("confirmPassword", e.target.value)}
              showPassword={passwordChange.showPasswords.confirm}
              onToggle={() => passwordChange.togglePasswordVisibility("confirm")}
            />

            <div className="flex gap-2">
              <Button
                onClick={passwordChange.handleChangePassword}
                disabled={!passwordChange.isFormValid}
              >
                パスワードを変更
              </Button>
              <Button variant="outline" onClick={passwordChange.resetForm}>
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onToggle: () => void;
  placeholder?: string;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  showPassword,
  onToggle,
  placeholder,
}: PasswordFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="pr-10"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label={showPassword ? "パスワードを非表示" : "パスワードを表示"}
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <title>目を閉じるアイコン</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <title>目を開くアイコン</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
