import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchFindings, FindingsList } from "@router-poc/shared";

export const Route = createFileRoute("/findings/threats")({
  component: function ThreatsPage() {
    const { data: items = [] } = useQuery({
      queryKey: ["findings", "threats"],
      queryFn: () => fetchFindings("threats"),
    });
    return <FindingsList items={items} />;
  },
});
