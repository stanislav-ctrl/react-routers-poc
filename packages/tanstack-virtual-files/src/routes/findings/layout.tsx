import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { FindingsTabs } from "@router-poc/shared";

export const Route = createFileRoute("/findings")({
  component: function FindingsLayout() {
    const navigate = useNavigate();
    const { location } = useRouterState();
    const activeTab = location.pathname.endsWith("risks") ? "risks" : "threats";

    return (
      <FindingsTabs
        activeTab={activeTab}
        onTabChange={(tab) => navigate({ to: `/findings/${tab}` })}
      >
        <Link to="/findings/threats"></Link>
        <Outlet />
      </FindingsTabs>
    );
  },
});
