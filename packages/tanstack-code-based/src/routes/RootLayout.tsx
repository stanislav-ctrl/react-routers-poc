import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Navbar } from "@router-poc/shared";

export function RootLayout() {
  const navigate = useNavigate();
  const { location } = useRouterState();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentPath={location.pathname}
        onNavigate={(path) => navigate({ to: path })}
        routerLabel="TanStack Router — Code-Based"
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
