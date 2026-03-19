import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { updateProfile } from "../api";

export const useProfileForm = () => {
  const { currentUser, refreshUserData } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.displayName || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsUpdating(true);
      await updateProfile({ name });
      await refreshUserData();
      setIsEditing(false);
      toast.success("プロフィールを更新しました");
    } catch (error) {
      const message = error instanceof Error ? error.message : "プロフィールの更新に失敗しました";
      toast.error(message);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setName(currentUser?.displayName || "");
    setIsEditing(false);
  };

  return {
    isEditing,
    setIsEditing,
    name,
    setName,
    isUpdating,
    handleSubmit,
    handleCancel,
  };
};
