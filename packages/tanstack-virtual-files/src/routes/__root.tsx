import {
  createRootRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { Navbar } from "@router-poc/shared";

export const Route = createRootRoute({
  component: function RootLayout() {
    const navigate = useNavigate();
    const { location } = useRouterState();
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar
          currentPath={location.pathname}
          onNavigate={(path) => navigate({ to: path })}
          routerLabel="TanStack Router — Virtual Files"
        />
        <main>
          <Outlet />
        </main>
      </div>
    );
  },
});
