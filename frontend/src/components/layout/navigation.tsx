import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/auth";
import { cn } from "@/lib/utils";

const NAVIGATION_LINKS = [
  { to: "/", label: "ホーム" },
  { to: "/users", label: "ユーザー" },
  { to: "/profile", label: "マイページ" },
  { to: "/step-form-demo", label: "ステップフォーム" },
] as const;

const ADMIN_LINKS = [{ to: "/admin/users", label: "ユーザー管理" }] as const;

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, role, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (_error) {}
  };

  return (
    <nav aria-label="メインナビゲーション" className="border-b bg-background">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">
              アプリテンプレート
            </Link>
            <div className="flex space-x-4">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={location.pathname === link.to ? "page" : undefined}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === link.to
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* 管理者専用リンク */}
              {role === "ADMIN" &&
                ADMIN_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={location.pathname === link.to ? "page" : undefined}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === link.to
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser && (
              <>
                <span className="text-sm text-muted-foreground">
                  {currentUser.email}
                  {role && <span className="ml-2 text-xs">({role})</span>}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  ログアウト
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
