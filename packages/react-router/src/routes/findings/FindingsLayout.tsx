import { Outlet, useLocation, useNavigate } from "react-router";
import { FindingsTabs } from "@router-poc/shared";

export function FindingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.endsWith("risks") ? "risks" : "threats";

  return (
    <FindingsTabs
      activeTab={activeTab}
      onTabChange={(tab) => navigate(`/findings/${tab}`)}
    >
      <Outlet />
    </FindingsTabs>
  );
}
