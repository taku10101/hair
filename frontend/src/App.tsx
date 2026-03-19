import { BrowserRouter, Route, Routes } from "react-router";
import { AdminProtectedRoute } from "./components/auth/AdminProtectedRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StepFormExample } from "./components/form/stepForm/StepFormExample";
import { Layout } from "./components/layout/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { HomePage, LoginPage, NotFoundPage, ProfilePage, SignupPage, UsersPage } from "./routes";
import { AdminUsersPage } from "./routes/admin/users";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/step-form-demo" element={<StepFormExample />} />

                {/* 管理者専用ルート */}
                <Route element={<AdminProtectedRoute />}>
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
