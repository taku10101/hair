import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/auth";

interface ProtectedRouteProps {
  redirectTo?: string;
}

/**
 * 認証が必要なルートを保護するコンポーネント
 * 未認証の場合は指定されたパスにリダイレクト
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectTo = "/login" }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to={redirectTo} replace />;
};
