import type { User } from "firebase/auth";
import { useCallback } from "react";
import { env } from "@/lib/env";
import type { DbUser, UserRole } from "@/types/auth";

interface UseFetchUserDataResult {
  fetchUserData: (
    firebaseUser: User,
    callbacks: {
      onSuccess: (user: DbUser, role: UserRole) => void;
    }
  ) => Promise<void>;
}

/**
 * APIからユーザー情報を取得するカスタムフック
 */
export const useFetchUserData = (): UseFetchUserDataResult => {
  const fetchUserData = useCallback(
    async (
      firebaseUser: User,
      callbacks: {
        onSuccess: (user: DbUser, role: UserRole) => void;
      }
    ) => {
      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch(`${env.VITE_API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          callbacks.onSuccess(data.user, data.user.role);
        }
      } catch (_error) {}
    },
    []
  );

  return { fetchUserData };
};
