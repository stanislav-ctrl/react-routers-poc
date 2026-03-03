import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./routes/RootLayout";
import { HomeRoute } from "./routes/HomeRoute";
import { InventoryLayout } from "./routes/inventory/InventoryLayout";
import { ItemDetailPage } from "./routes/inventory/ItemDetailPage";
import { FindingsLayout } from "./routes/findings/FindingsLayout";
import { ThreatsPage } from "./routes/findings/ThreatsPage";
import { RisksPage } from "./routes/findings/RisksPage";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomeRoute /> },
      {
        path: "/inventory",
        element: <InventoryLayout />,
        children: [{ path: ":id", element: null }],
      },
      { path: "/inventory/:id/detail", element: <ItemDetailPage /> },
      {
        path: "/findings",
        element: <FindingsLayout />,
        children: [
          { index: true, element: <Navigate to="threats" replace /> },
          { path: "threats", element: <ThreatsPage /> },
          { path: "risks", element: <RisksPage /> },
        ],
      },
    ],
  },
]);
