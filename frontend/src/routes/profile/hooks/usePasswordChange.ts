import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { authenticatedFetch } from "@/lib/apiClient";
import { getFirebaseAuth } from "@/lib/auth/firebase";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const usePasswordChange = () => {
  const { currentUser } = useAuth();
  const firebaseAuth = getFirebaseAuth();

  const [isChanging, setIsChanging] = useState(false);
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const resetForm = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChanging(false);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const updateField = (field: keyof PasswordFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("新しいパスワードが一致しません");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("パスワードは8文字以上である必要があります");
      return;
    }

    try {
      // 1. 現在のパスワードで再認証
      if (!currentUser?.email || !firebaseAuth.currentUser) {
        throw new Error("認証情報が見つかりません");
      }

      const credential = EmailAuthProvider.credential(currentUser.email, formData.currentPassword);
      await reauthenticateWithCredential(firebaseAuth.currentUser, credential);

      // 2. Firebaseでパスワード更新
      await updatePassword(firebaseAuth.currentUser, formData.newPassword);

      // 3. バックエンドに通知（オプション）
      await authenticatedFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      resetForm();
      toast.success("パスワードを変更しました");
    } catch (error) {
      let errorMessage = "パスワードの変更に失敗しました";

      if (error instanceof Error) {
        if (
          error.message.includes("wrong-password") ||
          error.message.includes("invalid-credential")
        ) {
          errorMessage = "現在のパスワードが正しくありません";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    isChanging,
    setIsChanging,
    formData,
    showPasswords,
    updateField,
    togglePasswordVisibility,
    handleChangePassword,
    resetForm,
    isFormValid:
      formData.currentPassword !== "" &&
      formData.newPassword !== "" &&
      formData.confirmPassword !== "",
  };
};
