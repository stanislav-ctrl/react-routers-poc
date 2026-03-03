import { rootRoute, route, index } from "@tanstack/virtual-file-routes";

export const virtualRouteConfig = rootRoute("__root.tsx", [
  index("index.tsx"),

  route("/inventory", "inventory/layout.tsx", [
    index("inventory/list.tsx"),
    route("$id", "inventory/flyout.tsx"),
  ]),

  route("/inventory/$id/detail", "inventory/detail.tsx"),

  route("/findings", "findings/layout.tsx", [
    index("findings/redirect.tsx"),
    route("threats", "findings/threats.tsx"),
    route("risks", "findings/risks.tsx"),
  ]),
]);
