import { useNavigate } from "@tanstack/react-router";
import { HomePage } from "@router-poc/shared";

export function HomeRoute() {
  const navigate = useNavigate();
  return (
    <HomePage
      routerName="TanStack Router — Code-Based"
      onNavigate={(path) => navigate({ to: path })}
    />
  );
}
