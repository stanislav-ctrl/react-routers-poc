import { useNavigate } from "react-router";
import { HomePage } from "@router-poc/shared";

export function HomeRoute() {
  const navigate = useNavigate();
  return (
    <HomePage
      routerName="React Router v7"
      onNavigate={(path) => navigate(path)}
    />
  );
}
