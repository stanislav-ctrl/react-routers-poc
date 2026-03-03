# Router POC — Design Document
**Date:** 2026-03-02

## Goal

A proof-of-concept comparing React Router v6 and TanStack Router (three routing approaches) implementing identical pages and functionality. The goal is to see how each router expresses the same route tree.

## Structure

Monorepo with pnpm workspaces:

```
router-poc/
├── pnpm-workspace.yaml
├── package.json                  # root: "dev" runs all apps concurrently
├── shared/                       # shared mock data, API fns, UI components
│   ├── src/
│   │   ├── data/                 # mock JSON: inventory items, threats, risks
│   │   ├── api.ts                # fetchInventory, fetchItem, fetchFindings (simulated delay)
│   │   └── components/           # InventoryList, FlyoutDrawer, ItemDetail, FindingsTabs, Navbar
│   └── package.json
└── packages/
    ├── react-router/             # port 3001
    ├── tanstack-file-based/      # port 3002
    ├── tanstack-code-based/      # port 3003
    └── tanstack-virtual-files/   # port 3004
```

Each app: Vite + React + TypeScript + Tailwind CSS. Only the routing layer differs.

## Route Tree (identical in all 4 apps)

```
/                          → Homepage
/inventory                 → Inventory list
/inventory/:id             → Inventory list + flyout drawer (layout route)
/inventory/:id/detail      → Full item detail page
/findings                  → Redirect → /findings/threats
/findings/threats          → Findings — Threats tab
/findings/risks            → Findings — Risks tab
```

## Pages & Components

### Shared UI (shared/src/components/)
- `Navbar` — top nav linking to Home, Inventory, Findings
- `InventoryList` — clickable list of inventory items
- `FlyoutDrawer` — slide-in drawer from right; shows item summary + "View Full Page" link
- `ItemDetail` — full detail view (name, description, status, tags)
- `FindingsTabs` — tab bar (Threats / Risks) + outlet for sub-routes
- `ThreatsList` / `RisksList` — list of findings

### Mock Data (shared/src/data/)
- 10 inventory items: `{ id, name, description, status, tags }`
- 5 threats + 5 risks: `{ id, title, severity, description }`

### Data Layer
- TanStack Query wraps all fetches
- `shared/src/api.ts` exports `fetchInventory()`, `fetchItem(id)`, `fetchFindings(type)`
- Each returns a Promise with a 300ms simulated delay

## Flyout Behavior

- Clicking an inventory item navigates to `/inventory/:id`
- The list stays visible; a slide-in drawer appears from the right
- "View Full Page" button → `/inventory/:id/detail`
- Escape key or backdrop click → navigate back to `/inventory`

## Router Implementation Differences

| App | Approach | Key characteristic |
|-----|----------|--------------------|
| `react-router` | React Router v6 | `createBrowserRouter` + route objects |
| `tanstack-file-based` | TanStack Router | Files in `src/routes/`, Vite plugin auto-generates tree |
| `tanstack-code-based` | TanStack Router | `createRoute()` calls assembled manually in code |
| `tanstack-virtual-files` | TanStack Router | `@tanstack/virtual-file-routes` config object |

## Tooling

- **Package manager:** pnpm workspaces
- **Build:** Vite
- **Styling:** Tailwind CSS v4
- **Data fetching:** TanStack Query v5
- **Language:** TypeScript
