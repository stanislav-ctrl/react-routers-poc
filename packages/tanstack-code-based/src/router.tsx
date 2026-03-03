import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import { RootLayout } from "./routes/RootLayout";
import { HomeRoute } from "./routes/HomeRoute";
import { InventoryLayout } from "./routes/inventory/InventoryLayout";
import { ItemDetailPage } from "./routes/inventory/ItemDetailPage";
import { FindingsLayout } from "./routes/findings/FindingsLayout";
import { ThreatsPage } from "./routes/findings/ThreatsPage";
import { RisksPage } from "./routes/findings/RisksPage";

const rootRoute = createRootRoute({ component: RootLayout });
// Layout routes are named so children can reference them in getParentRoute
const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory",
  component: InventoryLayout,
});
const findingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/findings",
  component: FindingsLayout,
});

const routeTree = rootRoute.addChildren([
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomeRoute,
  }),
  inventoryRoute.addChildren([
    createRoute({
      getParentRoute: () => inventoryRoute,
      path: "$id",
      component: () => null,
    }),
  ]),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/inventory/$id/detail",
    component: ItemDetailPage,
  }),
  findingsRoute.addChildren([
    createRoute({
      getParentRoute: () => findingsRoute,
      path: "/",
      beforeLoad: () => {
        throw redirect({ to: "/findings/threats" });
      },
    }),
    createRoute({
      getParentRoute: () => findingsRoute,
      path: "threats",
      component: ThreatsPage,
    }),
    createRoute({
      getParentRoute: () => findingsRoute,
      path: "risks",
      component: RisksPage,
    }),
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
