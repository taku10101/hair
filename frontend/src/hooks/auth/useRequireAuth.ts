import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

/**
 * 認証が必要なページで使用するフック
 * 未認証の場合はログインページにリダイレクト
 */
export const useRequireAuth = (redirectTo = "/login") => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [currentUser, loading, navigate, redirectTo]);

  return { currentUser, loading };
};
