import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/auth";

interface AdminProtectedRouteProps {
  redirectTo?: string;
}

/**
 * 管理者専用ルートを保護するコンポーネント
 * 管理者以外の場合は指定されたパスにリダイレクト
 */
export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ redirectTo = "/" }) => {
  const { currentUser, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "ADMIN") {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
