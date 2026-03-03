import { Outlet, useLocation, useNavigate } from "react-router";
import { Navbar } from "@router-poc/shared";

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}
        routerLabel="React Router v7"
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
