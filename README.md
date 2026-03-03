# Router POC

Comparing React Router v7 and TanStack Router (3 approaches) with identical pages and functionality.

| App                               | Router approach                                              | Port                  |
| --------------------------------- | ------------------------------------------------------------ | --------------------- |
| `packages/react-router`           | React Router v7 — `createBrowserRouter`                      | http://localhost:3001 |
| `packages/tanstack-file-based`    | TanStack Router — file-based (Vite plugin, `src/routes/`)    | http://localhost:3002 |
| `packages/tanstack-code-based`    | TanStack Router — code-based (`createRoute` + `addChildren`) | http://localhost:3003 |
| `packages/tanstack-virtual-files` | TanStack Router — virtual files (`routes.virtual.ts` config) | http://localhost:3004 |

## Start all apps

```bash
pnpm install
pnpm dev
```

Each app runs on its own port with colored labels in the terminal.

## Route tree (identical in all 4 apps)

```
/                          → Home page
/inventory                 → Inventory list
/inventory/:id             → Inventory list + flyout drawer
/inventory/:id/detail      → Full item detail page (no list)
/findings                  → Redirects to /findings/threats
/findings/threats          → Findings — Threats tab
/findings/risks            → Findings — Risks tab
```

## Architecture

```
router-poc/
├── shared/                        # @router-poc/shared
│   └── src/
│       ├── data/                  # Mock inventory items, threats, risks
│       ├── api.ts                 # fetchInventory, fetchItem, fetchFindings (TanStack Query)
│       └── components/            # Router-agnostic UI: Navbar, InventoryList, FlyoutDrawer,
│                                  # ItemDetail, FindingsTabs, FindingsList, HomePage
└── packages/
    ├── react-router/              # :3001 — React Router v7
    ├── tanstack-file-based/       # :3002 — TanStack Router file-based
    ├── tanstack-code-based/       # :3003 — TanStack Router code-based
    └── tanstack-virtual-files/    # :3004 — TanStack Router virtual files
```

## Routing approaches compared

### React Router v7 (`packages/react-router`)

**How it works**
- Route tree defined as a single config object passed to `createBrowserRouter`
- `useNavigate()`, `useParams()`, `useLocation()` hooks from `react-router-dom`
- Parent layout routes can read child route params via `useParams()`

**Constraints**
- No build-time type safety for route paths — typos in `navigate('/invnetory')` are silent at compile time
- No Vite plugin or codegen step required, but also no auto-completion for route params/search params
- `useParams()` returns `Record<string, string | undefined>` — you must cast or assert types manually
- Large apps end up with a single growing router config file unless manually split

---

### TanStack Router — Code-Based (`packages/tanstack-code-based`)

**How it works**
- Routes created with `createRootRoute()` / `createRoute({ getParentRoute, path, component })`
- Tree assembled explicitly with `.addChildren([])`
- `declare module '@tanstack/react-router'` block registers the router for global type inference

**Constraints**
- Route tree assembly is manual — adding a route requires wiring `getParentRoute`, adding to `.addChildren()`, and keeping both in sync
- No Vite plugin needed, but also no codegen — the full tree lives in one file that grows with the app
- `useParams({ strict: false })` for optional parent-reads has no compile-time guarantee the param exists; TypeScript accepts the cast but won't catch param name typos
- `declare module` registration must be in a file that runs at app startup — easy to forget in a new entry point

---

### TanStack Router — File-Based (`packages/tanstack-file-based`)

**How it works**
- Route files in `src/routes/` follow naming conventions (flat or directory-based)
- Vite plugin (`@tanstack/router-plugin`) auto-generates `routeTree.gen.ts` — full type safety for `navigate`, `useParams`, `Link`
- Each file exports `const Route = createFileRoute('/exact/path')({...})`
- Directory `route.tsx` = layout; `index.tsx` = index; `$param.tsx` = dynamic segment; `name_/` = layout escape

**Constraints**
- **Vite-only** — the codegen plugin only exists for Vite; no official webpack/esbuild equivalent
- `routeTree.gen.ts` must be generated before `tsc` can type-check — cold `tsc -b` without a prior `vite build` fails
- Route structure is implicit from filenames — non-obvious conventions (`_`, `_layout`, `route.tsx`) have a learning curve
- Moving or renaming a route file changes its URL unless you add an explicit redirect — easy to break links
- The `createFileRoute('/path')` string must match what the plugin generates; a mismatch causes a runtime warning and a TypeScript error

---

### TanStack Router — Virtual Files (`packages/tanstack-virtual-files`)

**How it works**
- Route structure defined explicitly in `src/routes.virtual.ts` using `rootRoute`, `route`, `index` from `@tanstack/virtual-file-routes`
- Vite plugin reads the config at build time and generates `routeTree.gen.ts`
- Route files can live in any directory layout — the config is the source of truth, not the filenames

**Constraints**
- **Vite-only** — same as file-based; no webpack support
- Two sources of truth to keep in sync: `routes.virtual.ts` (structure) and the actual route files (components). Adding a route requires updating both.
- `routes.virtual.ts` is imported by `vite.config.ts` at config evaluation time — it must be a plain module with no runtime-only imports (no React, no browser APIs)
- Still requires `vite build` before `tsc -b` for the same codegen reason as file-based
- Less community documentation than file-based; escape conventions (`inventory_`) still apply inside virtual config

---

## TanStack Router: file-based vs code-based vs virtual files

| Dimension | Code-Based | File-Based | Virtual Files |
| --------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- |
| **Bundler support** | Any (no plugin needed) | Vite only | Vite only |
| **Codegen** | None — manual tree | Auto (`routeTree.gen.ts`) | Auto (`routeTree.gen.ts`) |
| **Type-safe `navigate`/`Link`** | Yes (via `declare module`) | Yes (via generated types) | Yes (via generated types) |
| **Type-safe `useParams`** | Partial — `strict: false` loses param name safety | Full — param names checked at compile time | Full — param names checked at compile time |
| **Source of truth for structure** | `router.tsx` | Filenames and directory layout | `routes.virtual.ts` config |
| **Adding a route** | 1 file: add `createRoute` + wire `getParentRoute` + add to `.addChildren()` | 1 file: create file with correct name/path | 2 files: update `routes.virtual.ts` + create route file |
| **Route file location** | N/A — all in `router.tsx` | Must match naming convention (`route.tsx`, `$param.tsx`, `name_/`) | Free — any path, mapped explicitly in config |
| **Layout escape** | Place route as sibling in `.addChildren()` | `name_/` directory or `name_.param.tsx` filename | Place route outside the parent in `routes.virtual.ts` |
| **Cold `tsc -b`** | Works anytime | Fails until `vite build` runs first | Fails until `vite build` runs first |
| **Learning curve** | Low — plain TypeScript, no conventions | Medium — filename conventions have edge cases | Medium — two files to keep in sync |
| **Scales to large apps** | Poorly — one file grows unbounded | Well — files split naturally by feature | Well — config is explicit but separate from files |

### When to use each

**Code-based** — Best when you cannot use Vite (webpack, esbuild, Rspack), want zero build tooling overhead, or are migrating an existing app incrementally. Accept the trade-off: no codegen means no param-name type safety and a single growing router file.

**File-based** — Best for greenfield Vite projects where convention-over-configuration is acceptable. The Vite plugin handles all wiring automatically; route files split naturally as the app grows. Drawback: filename conventions (`route.tsx`, `name_/`, `$param.tsx`) have a learning curve and renaming a file silently changes its URL.

**Virtual files** — Best when you want codegen type safety but dislike the implicit filename-to-URL mapping. The `routes.virtual.ts` config makes the route tree explicit and lets route files live anywhere. Drawback: every new route requires editing two places (config + file), and community documentation is thinner than file-based.
