import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { FindingsTabs } from "@router-poc/shared";

export function FindingsLayout() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const activeTab = location.pathname.endsWith("risks") ? "risks" : "threats";

  return (
    <FindingsTabs
      activeTab={activeTab}
      onTabChange={(tab) => navigate({ to: `/findings/${tab}` })}
    >
      <Outlet />
    </FindingsTabs>
  );
}
