import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HomePage } from "@router-poc/shared";

export const Route = createFileRoute("/")({
  component: function HomeRoute() {
    const navigate = useNavigate();
    return (
      <HomePage
        routerName="TanStack Router — Virtual Files"
        onNavigate={(path) => navigate({ to: path })}
      />
    );
  },
});
