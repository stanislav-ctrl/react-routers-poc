import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/inventory/$id")({
  component: () => null,
});
