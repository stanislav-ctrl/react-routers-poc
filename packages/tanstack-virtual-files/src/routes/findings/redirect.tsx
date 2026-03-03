import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/findings/")({
  beforeLoad: () => {
    throw redirect({ to: "/findings/threats" });
  },
});
