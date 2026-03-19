import { Outlet } from "react-router";
import { Navigation } from "./navigation";

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
