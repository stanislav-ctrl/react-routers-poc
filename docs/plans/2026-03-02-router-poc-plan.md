# Router POC Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a pnpm monorepo POC with four apps (React Router v6, TanStack Router file-based / code-based / virtual-files) that all implement the same three pages (Home, Inventory with flyout, Findings with tabs).

**Architecture:** `shared/` package provides mock data, TanStack Query API helpers, and router-agnostic UI components. Each `packages/<app>/` is a Vite+React+TS+Tailwind v4 app that differs only in its routing layer. Ports 3001–3004.

**Tech Stack:** pnpm workspaces, Vite 6, React 18, TypeScript 5, Tailwind CSS v4 (`@tailwindcss/vite`), TanStack Query v5, React Router DOM v6, TanStack Router v1 (`@tanstack/react-router`, `@tanstack/router-plugin`, `@tanstack/virtual-file-routes`), `concurrently`

---

## Route Tree (identical in all 4 apps)

```
/                          → Home page
/inventory                 → InventoryLayout (shows list, Outlet empty)
/inventory/:id             → InventoryLayout (list + FlyoutDrawer in Outlet)
/inventory/:id/detail      → ItemDetailPage (inside RootLayout, outside InventoryLayout)
/findings                  → FindingsLayout (redirect to /findings/threats)
/findings/threats          → ThreatsPage
/findings/risks            → RisksPage
```

---

### Task 1: Monorepo Scaffold

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.npmrc`

**Step 1: Initialize git**
```bash
cd /Users/stanislavtudan/Work/projects/router-poc
git init
```

**Step 2: Create `.npmrc`**
```
shamefully-hoist=false
strict-peer-dependencies=false
```

**Step 3: Create `pnpm-workspace.yaml`**
```yaml
packages:
  - 'packages/*'
  - 'shared'
```

**Step 4: Create root `package.json`**
```json
{
  "name": "router-poc",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "concurrently -n rr,ts-file,ts-code,ts-virt -c cyan,green,yellow,magenta \"pnpm --filter react-router dev\" \"pnpm --filter tanstack-file-based dev\" \"pnpm --filter tanstack-code-based dev\" \"pnpm --filter tanstack-virtual-files dev\"",
    "build": "pnpm -r build"
  },
  "devDependencies": {
    "concurrently": "^9.0.0",
    "typescript": "^5.6.0"
  }
}
```

**Step 5: Create `tsconfig.base.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Step 6: Create `.gitignore`**
```
node_modules
dist
.turbo
*.local
routeTree.gen.ts
```

**Step 7: Install root devDependencies**
```bash
pnpm install
```
Expected: `pnpm-lock.yaml` created, `node_modules/.pnpm` at root.

**Step 8: Commit**
```bash
git add .
git commit -m "chore: init monorepo with pnpm workspaces"
```

---

### Task 2: Shared Package — Data & API

**Files:**
- Create: `shared/package.json`
- Create: `shared/tsconfig.json`
- Create: `shared/src/data/inventory.ts`
- Create: `shared/src/data/findings.ts`
- Create: `shared/src/api.ts`
- Create: `shared/src/index.ts`

**Step 1: Create `shared/package.json`**
```json
{
  "name": "@router-poc/shared",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "peerDependencies": {
    "react": "^18",
    "react-dom": "^18"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.56.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.6.0"
  }
}
```

**Step 2: Create `shared/tsconfig.json`**
```json
{
  "extends": "../tsconfig.base.json",
  "include": ["src"]
}
```

**Step 3: Create `shared/src/data/inventory.ts`**
```ts
export type InventoryItem = {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'warning'
  tags: string[]
}

export const INVENTORY_ITEMS: InventoryItem[] = [
  { id: '1', name: 'Web Server A', description: 'Primary web server handling HTTP traffic', status: 'active', tags: ['web', 'production'] },
  { id: '2', name: 'Database B', description: 'PostgreSQL instance for user data', status: 'active', tags: ['db', 'production'] },
  { id: '3', name: 'Cache C', description: 'Redis cache layer', status: 'warning', tags: ['cache', 'production'] },
  { id: '4', name: 'Load Balancer D', description: 'Nginx load balancer', status: 'active', tags: ['infra', 'production'] },
  { id: '5', name: 'Worker E', description: 'Background job processor', status: 'inactive', tags: ['worker', 'staging'] },
  { id: '6', name: 'API Gateway F', description: 'Kong API gateway', status: 'active', tags: ['api', 'production'] },
  { id: '7', name: 'Monitoring G', description: 'Prometheus + Grafana stack', status: 'active', tags: ['monitoring'] },
  { id: '8', name: 'Storage H', description: 'S3-compatible object storage', status: 'active', tags: ['storage', 'production'] },
  { id: '9', name: 'Auth Service I', description: 'OAuth2/OIDC identity provider', status: 'warning', tags: ['auth', 'production'] },
  { id: '10', name: 'Queue J', description: 'RabbitMQ message queue', status: 'active', tags: ['queue', 'production'] },
]
```

**Step 4: Create `shared/src/data/findings.ts`**
```ts
export type Finding = {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  affectedItems: string[]
}

export const THREATS: Finding[] = [
  { id: 't1', title: 'SQL Injection in Auth Service', severity: 'critical', description: 'Unsanitized input in login endpoint allows SQL injection', affectedItems: ['9'] },
  { id: 't2', title: 'Outdated TLS on Web Server', severity: 'high', description: 'Web Server A is using TLS 1.1 which is deprecated', affectedItems: ['1'] },
  { id: 't3', title: 'Exposed Debug Endpoint', severity: 'medium', description: 'API Gateway exposes /debug endpoint without auth', affectedItems: ['6'] },
  { id: 't4', title: 'Weak Redis Password', severity: 'high', description: 'Cache C uses a weak default password', affectedItems: ['3'] },
  { id: 't5', title: 'Missing Rate Limiting', severity: 'medium', description: 'Load balancer has no rate limiting configured', affectedItems: ['4'] },
]

export const RISKS: Finding[] = [
  { id: 'r1', title: 'Single Point of Failure: Database', severity: 'critical', description: 'Database B has no read replica, causing availability risk', affectedItems: ['2'] },
  { id: 'r2', title: 'No Backup Policy', severity: 'high', description: 'Storage H has no automated backup schedule', affectedItems: ['8'] },
  { id: 'r3', title: 'Worker Downtime', severity: 'medium', description: 'Worker E is inactive and job queue may overflow', affectedItems: ['5'] },
  { id: 'r4', title: 'Monitoring Gaps', severity: 'low', description: 'Queue J is not monitored by Prometheus', affectedItems: ['10'] },
  { id: 'r5', title: 'Auth Service Capacity', severity: 'high', description: 'Auth Service I is at 90% CPU under peak load', affectedItems: ['9'] },
]
```

**Step 5: Create `shared/src/api.ts`**
```ts
import { INVENTORY_ITEMS, type InventoryItem } from './data/inventory'
import { THREATS, RISKS, type Finding } from './data/findings'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const fetchInventory = async (): Promise<InventoryItem[]> => {
  await delay(300)
  return INVENTORY_ITEMS
}

export const fetchItem = async (id: string): Promise<InventoryItem> => {
  await delay(200)
  const item = INVENTORY_ITEMS.find((i) => i.id === id)
  if (!item) throw new Error(`Item ${id} not found`)
  return item
}

export const fetchFindings = async (type: 'threats' | 'risks'): Promise<Finding[]> => {
  await delay(300)
  return type === 'threats' ? THREATS : RISKS
}
```

**Step 6: Create `shared/src/index.ts`**
```ts
export * from './data/inventory'
export * from './data/findings'
export * from './api'
export * from './components'
```

**Step 7: Install shared deps**
```bash
pnpm install
```

**Step 8: Commit**
```bash
git add shared/
git commit -m "feat(shared): add mock data and API helpers"
```

---

### Task 3: Shared UI Components

**Design principle:** All components are router-agnostic. Navigation is handled via callbacks (`onNavigate`, `onItemClick`, `onClose`, etc.).

**Files:**
- Create: `shared/src/components/Navbar.tsx`
- Create: `shared/src/components/InventoryList.tsx`
- Create: `shared/src/components/FlyoutDrawer.tsx`
- Create: `shared/src/components/ItemDetail.tsx`
- Create: `shared/src/components/FindingsTabs.tsx`
- Create: `shared/src/components/FindingsList.tsx`
- Create: `shared/src/components/HomePage.tsx`
- Create: `shared/src/components/index.ts`

**Step 1: Create `shared/src/components/Navbar.tsx`**
```tsx
type NavbarProps = {
  currentPath: string
  onNavigate: (path: string) => void
  routerLabel: string
}

const links = [
  { label: 'Home', path: '/' },
  { label: 'Inventory', path: '/inventory' },
  { label: 'Findings', path: '/findings' },
]

export function Navbar({ currentPath, onNavigate, routerLabel }: NavbarProps) {
  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex gap-6 items-center">
      <span className="font-bold text-lg mr-2">Router POC</span>
      <span className="text-xs bg-blue-600 px-2 py-0.5 rounded text-blue-100 mr-4">{routerLabel}</span>
      {links.map((link) => {
        const isActive =
          link.path === '/'
            ? currentPath === '/'
            : currentPath.startsWith(link.path)
        return (
          <button
            key={link.path}
            onClick={() => onNavigate(link.path)}
            className={`text-sm transition-colors hover:text-blue-300 ${isActive ? 'text-blue-400 font-semibold' : 'text-gray-300'}`}
          >
            {link.label}
          </button>
        )
      })}
    </nav>
  )
}
```

**Step 2: Create `shared/src/components/InventoryList.tsx`**
```tsx
import type { InventoryItem } from '../data/inventory'

type InventoryListProps = {
  items: InventoryItem[]
  activeId?: string
  onItemClick: (id: string) => void
}

const statusColors: Record<InventoryItem['status'], string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  warning: 'bg-yellow-100 text-yellow-800',
}

export function InventoryList({ items, activeId, onItemClick }: InventoryListProps) {
  return (
    <ul className="divide-y divide-gray-200 bg-white">
      {items.map((item) => (
        <li
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className={`px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between ${
            activeId === item.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
          }`}
        >
          <div>
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500 truncate max-w-xs">{item.description}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[item.status]}`}>
            {item.status}
          </span>
        </li>
      ))}
    </ul>
  )
}
```

**Step 3: Create `shared/src/components/FlyoutDrawer.tsx`**
```tsx
import { useEffect } from 'react'
import type { InventoryItem } from '../data/inventory'

type FlyoutDrawerProps = {
  item: InventoryItem
  onClose: () => void
  onViewDetail: (id: string) => void
}

export function FlyoutDrawer({ item, onClose, onViewDetail }: FlyoutDrawerProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-10" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-20 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Item Preview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xl font-bold text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-600">{item.description}</p>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">{tag}</span>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => onViewDetail(item.id)}
            className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Full Page →
          </button>
        </div>
      </div>
    </>
  )
}
```

**Step 4: Create `shared/src/components/ItemDetail.tsx`**
```tsx
import type { InventoryItem } from '../data/inventory'

type ItemDetailProps = {
  item: InventoryItem
  onBack: () => void
}

const statusColors: Record<InventoryItem['status'], string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  warning: 'bg-yellow-100 text-yellow-800',
}

export function ItemDetail({ item, onBack }: ItemDetailProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
        ← Back to Inventory
      </button>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[item.status]}`}>{item.status}</span>
        </div>
        <p className="text-gray-600">{item.description}</p>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded">{tag}</span>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">ID: {item.id}</p>
        </div>
      </div>
    </div>
  )
}
```

**Step 5: Create `shared/src/components/FindingsList.tsx`**
```tsx
import type { Finding } from '../data/findings'

const severityColors: Record<Finding['severity'], string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-700',
}

export function FindingsList({ items }: { items: Finding[] }) {
  return (
    <ul className="space-y-3">
      {items.map((f) => (
        <li key={f.id} className="bg-white rounded-lg shadow p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">{f.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColors[f.severity]}`}>{f.severity}</span>
          </div>
          <p className="text-sm text-gray-600">{f.description}</p>
        </li>
      ))}
    </ul>
  )
}
```

**Step 6: Create `shared/src/components/FindingsTabs.tsx`**
```tsx
import type { ReactNode } from 'react'

type FindingsTabsProps = {
  activeTab: 'threats' | 'risks'
  onTabChange: (tab: 'threats' | 'risks') => void
  children: ReactNode
}

export function FindingsTabs({ activeTab, onTabChange, children }: FindingsTabsProps) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Findings</h1>
      <div className="flex border-b border-gray-200 mb-6">
        {(['threats', 'risks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {children}
    </div>
  )
}
```

**Step 7: Create `shared/src/components/HomePage.tsx`**
```tsx
type HomePageProps = {
  routerName: string
  onNavigate: (path: string) => void
}

export function HomePage({ routerName, onNavigate }: HomePageProps) {
  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Router POC</h1>
      <p className="text-gray-500 mb-1">Currently using</p>
      <p className="text-xl font-semibold text-blue-600 mb-8">{routerName}</p>
      <div className="grid grid-cols-2 gap-4 text-left">
        <button
          onClick={() => onNavigate('/inventory')}
          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 transition-colors"
        >
          <p className="text-lg font-semibold text-gray-900">Inventory</p>
          <p className="text-sm text-gray-500 mt-1">List → flyout drawer → detail page</p>
        </button>
        <button
          onClick={() => onNavigate('/findings')}
          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 transition-colors"
        >
          <p className="text-lg font-semibold text-gray-900">Findings</p>
          <p className="text-sm text-gray-500 mt-1">Threats and risks with tab routing</p>
        </button>
      </div>
    </div>
  )
}
```

**Step 8: Create `shared/src/components/index.ts`**
```ts
export { Navbar } from './Navbar'
export { InventoryList } from './InventoryList'
export { FlyoutDrawer } from './FlyoutDrawer'
export { ItemDetail } from './ItemDetail'
export { FindingsTabs } from './FindingsTabs'
export { FindingsList } from './FindingsList'
export { HomePage } from './HomePage'
```

**Step 9: Commit**
```bash
git add shared/
git commit -m "feat(shared): add router-agnostic UI components"
```

---

### Task 4: React Router App — Scaffold

**Port: 3001**

**Files:**
- Create: `packages/react-router/package.json`
- Create: `packages/react-router/tsconfig.json`
- Create: `packages/react-router/vite.config.ts`
- Create: `packages/react-router/index.html`
- Create: `packages/react-router/src/index.css`
- Create: `packages/react-router/src/main.tsx`

**Step 1: Create `packages/react-router/package.json`**
```json
{
  "name": "react-router",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3001",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@router-poc/shared": "workspace:*",
    "@tanstack/react-query": "^5.56.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0"
  }
}
```

**Step 2: Create `packages/react-router/tsconfig.json`**
```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

**Step 3: Create `packages/react-router/vite.config.ts`**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@router-poc/shared'],
  },
})
```

**Step 4: Create `packages/react-router/index.html`**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Router POC — :3001</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Create `packages/react-router/src/index.css`**
```css
@import "tailwindcss";
```

**Step 6: Create `packages/react-router/src/main.tsx`**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

**Step 7: Install**
```bash
pnpm install
```

---

### Task 5: React Router App — Routes

**Files:**
- Create: `packages/react-router/src/router.tsx`
- Create: `packages/react-router/src/routes/RootLayout.tsx`
- Create: `packages/react-router/src/routes/HomeRoute.tsx`
- Create: `packages/react-router/src/routes/inventory/InventoryLayout.tsx`
- Create: `packages/react-router/src/routes/inventory/ItemDetailPage.tsx`
- Create: `packages/react-router/src/routes/findings/FindingsLayout.tsx`
- Create: `packages/react-router/src/routes/findings/ThreatsPage.tsx`
- Create: `packages/react-router/src/routes/findings/RisksPage.tsx`

**Step 1: Create `packages/react-router/src/router.tsx`**

This is the core routing file. React Router v6 uses `createBrowserRouter` with a route object tree.
Key: `ItemDetailPage` is a sibling of `InventoryLayout` (both inside `RootLayout`) so the detail page renders WITHOUT the inventory list.

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from './routes/RootLayout'
import { HomeRoute } from './routes/HomeRoute'
import { InventoryLayout } from './routes/inventory/InventoryLayout'
import { ItemDetailPage } from './routes/inventory/ItemDetailPage'
import { FindingsLayout } from './routes/findings/FindingsLayout'
import { ThreatsPage } from './routes/findings/ThreatsPage'
import { RisksPage } from './routes/findings/RisksPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomeRoute /> },
      {
        path: '/inventory',
        element: <InventoryLayout />,
        children: [
          // FlyoutRoute is rendered inside InventoryLayout's <Outlet />
          // The flyout uses fixed positioning so it overlays the list visually
          { path: ':id', element: null }, // Flyout is rendered BY InventoryLayout itself
        ],
      },
      // Detail page is OUTSIDE InventoryLayout — no list shown
      { path: '/inventory/:id/detail', element: <ItemDetailPage /> },
      {
        path: '/findings',
        element: <FindingsLayout />,
        children: [
          { index: true, element: <Navigate to="threats" replace /> },
          { path: 'threats', element: <ThreatsPage /> },
          { path: 'risks', element: <RisksPage /> },
        ],
      },
    ],
  },
])
```

> **Note on flyout pattern:** `InventoryLayout` reads `useParams()` to detect if `:id` is present and renders the `FlyoutDrawer` directly (not via `<Outlet />`). This keeps the flyout tightly coupled to the list. The `<Outlet />` is only used for potential child content.

**Step 2: Create `packages/react-router/src/routes/RootLayout.tsx`**
```tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '@router-poc/shared'

export function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}
        routerLabel="React Router v6"
      />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
```

**Step 3: Create `packages/react-router/src/routes/HomeRoute.tsx`**
```tsx
import { useNavigate } from 'react-router-dom'
import { HomePage } from '@router-poc/shared'

export function HomeRoute() {
  const navigate = useNavigate()
  return <HomePage routerName="React Router v6" onNavigate={(path) => navigate(path)} />
}
```

**Step 4: Create `packages/react-router/src/routes/inventory/InventoryLayout.tsx`**

This component always renders the inventory list. When the URL is `/inventory/:id`, `useParams()` returns `{ id }` and the `FlyoutDrawer` is shown.

```tsx
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchInventory, fetchItem, InventoryList, FlyoutDrawer } from '@router-poc/shared'

export function InventoryLayout() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: items = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
  })

  const { data: selectedItem } = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id!),
    enabled: !!id,
  })

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Inventory</h1>
      <InventoryList
        items={items}
        activeId={id}
        onItemClick={(itemId) => navigate(`/inventory/${itemId}`)}
      />
      {id && selectedItem && (
        <FlyoutDrawer
          item={selectedItem}
          onClose={() => navigate('/inventory')}
          onViewDetail={(itemId) => navigate(`/inventory/${itemId}/detail`)}
        />
      )}
    </div>
  )
}
```

**Step 5: Create `packages/react-router/src/routes/inventory/ItemDetailPage.tsx`**
```tsx
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchItem, ItemDetail } from '@router-poc/shared'

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id!),
    enabled: !!id,
  })

  if (isLoading) return <div className="p-6 text-gray-500">Loading...</div>
  if (!item) return <div className="p-6 text-red-500">Item not found</div>

  return <ItemDetail item={item} onBack={() => navigate('/inventory')} />
}
```

**Step 6: Create `packages/react-router/src/routes/findings/FindingsLayout.tsx`**
```tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FindingsTabs } from '@router-poc/shared'

export function FindingsLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = location.pathname.endsWith('risks') ? 'risks' : 'threats'

  return (
    <FindingsTabs
      activeTab={activeTab}
      onTabChange={(tab) => navigate(`/findings/${tab}`)}
    >
      <Outlet />
    </FindingsTabs>
  )
}
```

**Step 7: Create `packages/react-router/src/routes/findings/ThreatsPage.tsx`**
```tsx
import { useQuery } from '@tanstack/react-query'
import { fetchFindings, FindingsList } from '@router-poc/shared'

export function ThreatsPage() {
  const { data: items = [] } = useQuery({
    queryKey: ['findings', 'threats'],
    queryFn: () => fetchFindings('threats'),
  })
  return <FindingsList items={items} />
}
```

**Step 8: Create `packages/react-router/src/routes/findings/RisksPage.tsx`**
```tsx
import { useQuery } from '@tanstack/react-query'
import { fetchFindings, FindingsList } from '@router-poc/shared'

export function RisksPage() {
  const { data: items = [] } = useQuery({
    queryKey: ['findings', 'risks'],
    queryFn: () => fetchFindings('risks'),
  })
  return <FindingsList items={items} />
}
```

**Step 9: Start and verify**
```bash
pnpm --filter react-router dev
```
Expected: app running on http://localhost:3001. Visit all routes manually:
- `/` → homepage with two cards
- `/inventory` → list of 10 items
- `/inventory/1` → list + flyout drawer
- `/inventory/1/detail` → full detail page (no list)
- `/findings` → redirects to `/findings/threats`
- `/findings/risks` → risks tab active

**Step 10: Commit**
```bash
git add packages/react-router/
git commit -m "feat(react-router): implement all routes with React Router v6"
```

---

### Task 6: TanStack Code-Based App — Scaffold

**Port: 3003** (code-based is simpler to do next — no Vite plugin needed)

**Files:**
- Create: `packages/tanstack-code-based/package.json`
- Create: `packages/tanstack-code-based/tsconfig.json`
- Create: `packages/tanstack-code-based/vite.config.ts`
- Create: `packages/tanstack-code-based/index.html`
- Create: `packages/tanstack-code-based/src/index.css`
- Create: `packages/tanstack-code-based/src/main.tsx`

**Step 1: Create `packages/tanstack-code-based/package.json`**
```json
{
  "name": "tanstack-code-based",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3003",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@router-poc/shared": "workspace:*",
    "@tanstack/react-query": "^5.56.0",
    "@tanstack/react-router": "^1.58.0",
    "@tanstack/router-devtools": "^1.58.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0"
  }
}
```

**Step 2: Create `packages/tanstack-code-based/tsconfig.json`**
```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

**Step 3: Create `packages/tanstack-code-based/vite.config.ts`**

No router plugin needed for code-based routing.
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@router-poc/shared'],
  },
})
```

**Step 4: Create `packages/tanstack-code-based/index.html`**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TanStack Router — Code-Based POC — :3003</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Create `packages/tanstack-code-based/src/index.css`**
```css
@import "tailwindcss";
```

**Step 6: Create `packages/tanstack-code-based/src/main.tsx`**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

**Step 7: Install**
```bash
pnpm install
```

---

### Task 7: TanStack Code-Based App — Routes

**Files:**
- Create: `packages/tanstack-code-based/src/router.tsx`
- Create: `packages/tanstack-code-based/src/routes/RootLayout.tsx`
- Create: `packages/tanstack-code-based/src/routes/HomeRoute.tsx`
- Create: `packages/tanstack-code-based/src/routes/inventory/InventoryLayout.tsx`
- Create: `packages/tanstack-code-based/src/routes/inventory/ItemDetailPage.tsx`
- Create: `packages/tanstack-code-based/src/routes/findings/FindingsLayout.tsx`
- Create: `packages/tanstack-code-based/src/routes/findings/ThreatsPage.tsx`
- Create: `packages/tanstack-code-based/src/routes/findings/RisksPage.tsx`

**Step 1: Create `packages/tanstack-code-based/src/router.tsx`**

TanStack Router code-based routing: each route is created with `createRoute()`, assembled into a tree with `.addChildren()`, then passed to `createRouter()`.

Key difference from React Router: params are typed via generics on `createRoute`, and `Route.useParams()` gives type-safe access.

```tsx
import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { RootLayout } from './routes/RootLayout'
import { HomeRoute } from './routes/HomeRoute'
import { InventoryLayout } from './routes/inventory/InventoryLayout'
import { ItemDetailPage } from './routes/inventory/ItemDetailPage'
import { FindingsLayout } from './routes/findings/FindingsLayout'
import { ThreatsPage } from './routes/findings/ThreatsPage'
import { RisksPage } from './routes/findings/RisksPage'

const rootRoute = createRootRoute({ component: RootLayout })

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeRoute,
})

// /inventory — layout that always shows the list
const inventoryLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory',
  component: InventoryLayout,
})

// /inventory/$id — child of inventoryLayoutRoute (flyout shown by InventoryLayout)
const inventoryIdRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: '$id',
  component: () => null,  // InventoryLayout reads its own params and renders the flyout
})

// /inventory/$id/detail — sibling of inventoryLayoutRoute, no list shown
const itemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory/$id/detail',
  component: ItemDetailPage,
})

const findingsLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/findings',
  component: FindingsLayout,
})

const findingsIndexRoute = createRoute({
  getParentRoute: () => findingsLayoutRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/findings/threats' }) },
})

const threatsRoute = createRoute({
  getParentRoute: () => findingsLayoutRoute,
  path: 'threats',
  component: ThreatsPage,
})

const risksRoute = createRoute({
  getParentRoute: () => findingsLayoutRoute,
  path: 'risks',
  component: RisksPage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  inventoryLayoutRoute.addChildren([inventoryIdRoute]),
  itemDetailRoute,
  findingsLayoutRoute.addChildren([findingsIndexRoute, threatsRoute, risksRoute]),
])

export const router = createRouter({ routeTree })

// Type registration for type-safe useNavigate, Link, etc.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

**Step 2: Create `packages/tanstack-code-based/src/routes/RootLayout.tsx`**
```tsx
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { Navbar } from '@router-poc/shared'

export function RootLayout() {
  const navigate = useNavigate()
  const { location } = useRouterState()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentPath={location.pathname}
        onNavigate={(path) => navigate({ to: path })}
        routerLabel="TanStack Router — Code-Based"
      />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
```

**Step 3: Create `packages/tanstack-code-based/src/routes/HomeRoute.tsx`**
```tsx
import { useNavigate } from '@tanstack/react-router'
import { HomePage } from '@router-poc/shared'

export function HomeRoute() {
  const navigate = useNavigate()
  return (
    <HomePage
      routerName="TanStack Router — Code-Based"
      onNavigate={(path) => navigate({ to: path })}
    />
  )
}
```

**Step 4: Create `packages/tanstack-code-based/src/routes/inventory/InventoryLayout.tsx`**

TanStack Router: use `useParams({ strict: false })` in the parent route to optionally read child route params.

```tsx
import { Outlet, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchInventory, fetchItem, InventoryList, FlyoutDrawer } from '@router-poc/shared'

export function InventoryLayout() {
  const navigate = useNavigate()
  // strict: false — this route doesn't define $id, but the child route does
  const { id } = useParams({ strict: false }) as { id?: string }

  const { data: items = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
  })

  const { data: selectedItem } = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id!),
    enabled: !!id,
  })

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Inventory</h1>
      <InventoryList
        items={items}
        activeId={id}
        onItemClick={(itemId) => navigate({ to: '/inventory/$id', params: { id: itemId } })}
      />
      {id && selectedItem && (
        <FlyoutDrawer
          item={selectedItem}
          onClose={() => navigate({ to: '/inventory' })}
          onViewDetail={(itemId) => navigate({ to: '/inventory/$id/detail', params: { id: itemId } })}
        />
      )}
      <Outlet />
    </div>
  )
}
```

**Step 5: Create `packages/tanstack-code-based/src/routes/inventory/ItemDetailPage.tsx`**
```tsx
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchItem, ItemDetail } from '@router-poc/shared'

export function ItemDetailPage() {
  const { id } = useParams({ from: '/inventory/$id/detail' })
  const navigate = useNavigate()

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItem(id),
  })

  if (isLoading) return <div className="p-6 text-gray-500">Loading...</div>
  if (!item) return <div className="p-6 text-red-500">Item not found</div>

  return <ItemDetail item={item} onBack={() => navigate({ to: '/inventory' })} />
}
```

**Step 6: Create `packages/tanstack-code-based/src/routes/findings/FindingsLayout.tsx`**
```tsx
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { FindingsTabs } from '@router-poc/shared'

export function FindingsLayout() {
  const navigate = useNavigate()
  const { location } = useRouterState()
  const activeTab = location.pathname.endsWith('risks') ? 'risks' : 'threats'

  return (
    <FindingsTabs
      activeTab={activeTab}
      onTabChange={(tab) => navigate({ to: `/findings/${tab}` })}
    >
      <Outlet />
    </FindingsTabs>
  )
}
```

**Step 7: Create ThreatsPage and RisksPage**

`packages/tanstack-code-based/src/routes/findings/ThreatsPage.tsx`:
```tsx
import { useQuery } from '@tanstack/react-query'
import { fetchFindings, FindingsList } from '@router-poc/shared'

export function ThreatsPage() {
  const { data: items = [] } = useQuery({ queryKey: ['findings', 'threats'], queryFn: () => fetchFindings('threats') })
  return <FindingsList items={items} />
}
```

`packages/tanstack-code-based/src/routes/findings/RisksPage.tsx`:
```tsx
import { useQuery } from '@tanstack/react-query'
import { fetchFindings, FindingsList } from '@router-poc/shared'

export function RisksPage() {
  const { data: items = [] } = useQuery({ queryKey: ['findings', 'risks'], queryFn: () => fetchFindings('risks') })
  return <FindingsList items={items} />
}
```

**Step 8: Start and verify**
```bash
pnpm --filter tanstack-code-based dev
```
Expected: app on http://localhost:3003, same behavior as react-router app.

**Step 9: Commit**
```bash
git add packages/tanstack-code-based/
git commit -m "feat(tanstack-code-based): implement all routes with TanStack Router code-based approach"
```

---

### Task 8: TanStack File-Based App — Scaffold

**Port: 3002**

Key difference: the `@tanstack/router-plugin/vite` Vite plugin watches `src/routes/` and **auto-generates** `src/routeTree.gen.ts`. You never edit `routeTree.gen.ts` manually.

**Files:**
- Create: `packages/tanstack-file-based/package.json`
- Create: `packages/tanstack-file-based/tsconfig.json`
- Create: `packages/tanstack-file-based/vite.config.ts`
- Create: `packages/tanstack-file-based/index.html`
- Create: `packages/tanstack-file-based/src/index.css`
- Create: `packages/tanstack-file-based/src/main.tsx`

**Step 1: Create `packages/tanstack-file-based/package.json`**
```json
{
  "name": "tanstack-file-based",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3002",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@router-poc/shared": "workspace:*",
    "@tanstack/react-query": "^5.56.0",
    "@tanstack/react-router": "^1.58.0",
    "@tanstack/router-devtools": "^1.58.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@tanstack/router-plugin": "^1.58.0",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0"
  }
}
```

**Step 2: Create `packages/tanstack-file-based/vite.config.ts`**

The `TanStackRouterVite` plugin must be listed BEFORE `react()` so it generates the route tree before React processes the files.

```ts
import { defineConfig } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes', generatedRouteTree: './src/routeTree.gen.ts' }),
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['@router-poc/shared'],
  },
})
```

**Step 3: Create `packages/tanstack-file-based/tsconfig.json`**
```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

**Step 4: Create `packages/tanstack-file-based/index.html`**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TanStack Router — File-Based POC — :3002</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Create `packages/tanstack-file-based/src/index.css`**
```css
@import "tailwindcss";
```

**Step 6: Create `packages/tanstack-file-based/src/main.tsx`**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import './index.css'

const queryClient = new QueryClient()
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

**Step 7: Install**
```bash
pnpm install
```

---

### Task 9: TanStack File-Based App — Route Files

File naming conventions for TanStack Router flat-file routing:
- `__root.tsx` → root layout
- `index.tsx` → `/`
- `inventory.tsx` → layout component for all `/inventory*` routes
- `inventory.index.tsx` → `/inventory` (rendered inside inventory layout)
- `inventory.$id.tsx` → `/inventory/$id` (rendered inside inventory layout — shows flyout)
- `inventory_.$id.detail.tsx` → `/inventory/$id/detail` (the `_` suffix escapes the inventory layout — no list shown)
- `findings.tsx` → layout for `/findings*`
- `findings.index.tsx` → `/findings` index (redirects to threats)
- `findings.threats.tsx` → `/findings/threats`
- `findings.risks.tsx` → `/findings/risks`

**Files:**
- Create: `packages/tanstack-file-based/src/routes/__root.tsx`
- Create: `packages/tanstack-file-based/src/routes/index.tsx`
- Create: `packages/tanstack-file-based/src/routes/inventory.tsx`
- Create: `packages/tanstack-file-based/src/routes/inventory.index.tsx`
- Create: `packages/tanstack-file-based/src/routes/inventory.$id.tsx`
- Create: `packages/tanstack-file-based/src/routes/inventory_.$id.detail.tsx`
- Create: `packages/tanstack-file-based/src/routes/findings.tsx`
- Create: `packages/tanstack-file-based/src/routes/findings.index.tsx`
- Create: `packages/tanstack-file-based/src/routes/findings.threats.tsx`
- Create: `packages/tanstack-file-based/src/routes/findings.risks.tsx`

**Step 1: Create `__root.tsx`**
```tsx
import { createRootRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { Navbar } from '@router-poc/shared'

export const Route = createRootRoute({
  component: function RootLayout() {
    const navigate = useNavigate()
    const { location } = useRouterState()
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar
          currentPath={location.pathname}
          onNavigate={(path) => navigate({ to: path })}
          routerLabel="TanStack Router — File-Based"
        />
        <main><Outlet /></main>
      </div>
    )
  },
})
```

**Step 2: Create `index.tsx`**
```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { HomePage } from '@router-poc/shared'

export const Route = createFileRoute('/')({
  component: function HomeRoute() {
    const navigate = useNavigate()
    return <HomePage routerName="TanStack Router — File-Based" onNavigate={(path) => navigate({ to: path })} />
  },
})
```

**Step 3: Create `inventory.tsx` (inventory layout)**
```tsx
import { createFileRoute, Outlet, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchInventory, fetchItem, InventoryList, FlyoutDrawer } from '@router-poc/shared'

export const Route = createFileRoute('/inventory')({
  component: function InventoryLayout() {
    const navigate = useNavigate()
    const { id } = useParams({ strict: false }) as { id?: string }

    const { data: items = [] } = useQuery({ queryKey: ['inventory'], queryFn: fetchInventory })
    const { data: selectedItem } = useQuery({
      queryKey: ['item', id],
      queryFn: () => fetchItem(id!),
      enabled: !!id,
    })

    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Inventory</h1>
        <InventoryList
          items={items}
          activeId={id}
          onItemClick={(itemId) => navigate({ to: '/inventory/$id', params: { id: itemId } })}
        />
        {id && selectedItem && (
          <FlyoutDrawer
            item={selectedItem}
            onClose={() => navigate({ to: '/inventory' })}
            onViewDetail={(itemId) => navigate({ to: '/inventory/$id/detail', params: { id: itemId } })}
          />
        )}
        <Outlet />
      </div>
    )
  },
})
```

**Step 4: Create `inventory.index.tsx`**
```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/inventory/')({
  component: () => null,
})
```

**Step 5: Create `inventory.$id.tsx`**
```tsx
import { createFileRoute } from '@tanstack/react-router'

// The flyout is rendered by the parent InventoryLayout via useParams({ strict: false })
// This route file just registers /inventory/$id so the plugin generates the correct route tree
export const Route = createFileRoute('/inventory/$id')({
  component: () => null,
})
```

**Step 6: Create `inventory_.$id.detail.tsx`**

The `_` after `inventory` escapes the `inventory.tsx` layout. This route renders inside `__root.tsx` but NOT inside `inventory.tsx`.

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchItem, ItemDetail } from '@router-poc/shared'

export const Route = createFileRoute('/inventory_/$id/detail')({
  component: function ItemDetailPage() {
    const { id } = Route.useParams()
    const navigate = useNavigate()

    const { data: item, isLoading } = useQuery({
      queryKey: ['item', id],
      queryFn: () => fetchItem(id),
    })

    if (isLoading) return <div className="p-6 text-gray-500">Loading...</div>
    if (!item) return <div className="p-6 text-red-500">Item not found</div>

    return <ItemDetail item={item} onBack={() => navigate({ to: '/inventory' })} />
  },
})
```

**Step 7: Create `findings.tsx` (findings layout)**
```tsx
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { FindingsTabs } from '@router-poc/shared'

export const Route = createFileRoute('/findings')({
  component: function FindingsLayout() {
    const navigate = useNavigate()
    const { location } = useRouterState()
    const activeTab = location.pathname.endsWith('risks') ? 'risks' : 'threats'

    return (
      <FindingsTabs activeTab={activeTab} onTabChange={(tab) => navigate({ to: `/findings/${tab}` })}>
        <Outlet />
      </FindingsTabs>
    )
  },
})
```

**Step 8: Create `findings.index.tsx`**
```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/findings/')({
  beforeLoad: () => { throw redirect({ to: '/findings/threats' }) },
})
```

**Step 9: Create `findings.threats.tsx` and `findings.risks.tsx`**

`findings.threats.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchFindings, FindingsList } from '@router-poc/shared'

export const Route = createFileRoute('/findings/threats')({
  component: function ThreatsPage() {
    const { data: items = [] } = useQuery({ queryKey: ['findings', 'threats'], queryFn: () => fetchFindings('threats') })
    return <FindingsList items={items} />
  },
})
```

`findings.risks.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchFindings, FindingsList } from '@router-poc/shared'

export const Route = createFileRoute('/findings/risks')({
  component: function RisksPage() {
    const { data: items = [] } = useQuery({ queryKey: ['findings', 'risks'], queryFn: () => fetchFindings('risks') })
    return <FindingsList items={items} />
  },
})
```

**Step 10: Start and verify**
```bash
pnpm --filter tanstack-file-based dev
```
Expected: app on http://localhost:3002. The plugin auto-generates `src/routeTree.gen.ts` — you should see it appear. Verify all routes work.

**Step 11: Commit**
```bash
git add packages/tanstack-file-based/
git commit -m "feat(tanstack-file-based): implement all routes with TanStack Router file-based approach"
```

---

### Task 10: TanStack Virtual-Files App — Scaffold

**Port: 3004**

Virtual file routes: you define a route tree configuration object (instead of relying on directory structure). The Vite plugin reads this config and generates the route tree. The actual route component files can be in any directory structure you choose.

**Files:**
- Create: `packages/tanstack-virtual-files/package.json`
- Create: `packages/tanstack-virtual-files/tsconfig.json`
- Create: `packages/tanstack-virtual-files/vite.config.ts`
- Create: `packages/tanstack-virtual-files/index.html`
- Create: `packages/tanstack-virtual-files/src/index.css`
- Create: `packages/tanstack-virtual-files/src/main.tsx`
- Create: `packages/tanstack-virtual-files/src/routes.virtual.ts`

**Step 1: Create `packages/tanstack-virtual-files/package.json`**
```json
{
  "name": "tanstack-virtual-files",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3004",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@router-poc/shared": "workspace:*",
    "@tanstack/react-query": "^5.56.0",
    "@tanstack/react-router": "^1.58.0",
    "@tanstack/router-devtools": "^1.58.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@tanstack/router-plugin": "^1.58.0",
    "@tanstack/virtual-file-routes": "^1.58.0",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0"
  }
}
```

**Step 2: Create `packages/tanstack-virtual-files/src/routes.virtual.ts`**

This is the key file for the virtual-files approach. Instead of directory conventions, you explicitly declare what path maps to what file.

```ts
import {
  rootRoute,
  route,
  index,
} from '@tanstack/virtual-file-routes'

export const virtualRouteConfig = rootRoute('__root.tsx', [
  index('index.tsx'),

  // /inventory layout — shows the list
  route('/inventory', 'inventory/layout.tsx', [
    index('inventory/list.tsx'),
    // /inventory/$id — child of layout (flyout shown by layout via params)
    route('$id', 'inventory/flyout.tsx'),
  ]),

  // /inventory/$id/detail — OUTSIDE the inventory layout (declared at root level)
  route('/inventory/$id/detail', 'inventory/detail.tsx'),

  // /findings layout — shows tabs
  route('/findings', 'findings/layout.tsx', [
    index('findings/redirect.tsx'),
    route('threats', 'findings/threats.tsx'),
    route('risks', 'findings/risks.tsx'),
  ]),
])
```

**Step 3: Create `packages/tanstack-virtual-files/vite.config.ts`**
```ts
import { defineConfig } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { virtualRouteConfig } from './src/routes.virtual'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      virtualRouteConfig,
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['@router-poc/shared'],
  },
})
```

**Step 4: Create `packages/tanstack-virtual-files/tsconfig.json`**
```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

**Step 5: Create `packages/tanstack-virtual-files/index.html`**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TanStack Router — Virtual Files POC — :3004</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 6: Create `packages/tanstack-virtual-files/src/index.css`**
```css
@import "tailwindcss";
```

**Step 7: Create `packages/tanstack-virtual-files/src/main.tsx`**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import './index.css'

const queryClient = new QueryClient()
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

**Step 8: Install**
```bash
pnpm install
```

---

### Task 11: TanStack Virtual-Files App — Route Files

Route files referenced in `routes.virtual.ts`. They live in `src/routes/` but use a flat directory structure of your choosing (not tied to naming conventions).

**Files:**
- Create: `packages/tanstack-virtual-files/src/routes/__root.tsx`
- Create: `packages/tanstack-virtual-files/src/routes/index.tsx`
- Create: `packages/tanstack-virtual-files/src/routes/inventory/layout.tsx`
- Create: `packages/tanstack-virtual-files/src/routes/inventory/list.tsx`
- Create: `packages/tanstack-virtual-files/src/routes/inventory/flyout.tsx`
- Create: `packages/tanstack-virtual-files/src/routes/inventory/detail.tsx`
- Create: `packages/tanstack-virtual-files/src/routes/findings/layout.tsx`
- Create: `packages/tanstack-virtual-files/src/routes/findings/redirect.tsx`
- Create: `packages/tanstack-virtual-files/src/routes/findings/threats.tsx`
- Create: `packages/tanstack-virtual-files/src/routes/findings/risks.tsx`

**Step 1: Create `routes/__root.tsx`**
```tsx
import { createRootRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { Navbar } from '@router-poc/shared'

export const Route = createRootRoute({
  component: function RootLayout() {
    const navigate = useNavigate()
    const { location } = useRouterState()
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar
          currentPath={location.pathname}
          onNavigate={(path) => navigate({ to: path })}
          routerLabel="TanStack Router — Virtual Files"
        />
        <main><Outlet /></main>
      </div>
    )
  },
})
```

**Step 2: Create `routes/index.tsx`**
```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { HomePage } from '@router-poc/shared'

export const Route = createFileRoute('/')({
  component: function HomeRoute() {
    const navigate = useNavigate()
    return <HomePage routerName="TanStack Router — Virtual Files" onNavigate={(path) => navigate({ to: path })} />
  },
})
```

**Step 3: Create `routes/inventory/layout.tsx`**
```tsx
import { createFileRoute, Outlet, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchInventory, fetchItem, InventoryList, FlyoutDrawer } from '@router-poc/shared'

export const Route = createFileRoute('/inventory')({
  component: function InventoryLayout() {
    const navigate = useNavigate()
    const { id } = useParams({ strict: false }) as { id?: string }

    const { data: items = [] } = useQuery({ queryKey: ['inventory'], queryFn: fetchInventory })
    const { data: selectedItem } = useQuery({
      queryKey: ['item', id],
      queryFn: () => fetchItem(id!),
      enabled: !!id,
    })

    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Inventory</h1>
        <InventoryList
          items={items}
          activeId={id}
          onItemClick={(itemId) => navigate({ to: '/inventory/$id', params: { id: itemId } })}
        />
        {id && selectedItem && (
          <FlyoutDrawer
            item={selectedItem}
            onClose={() => navigate({ to: '/inventory' })}
            onViewDetail={(itemId) => navigate({ to: '/inventory/$id/detail', params: { id: itemId } })}
          />
        )}
        <Outlet />
      </div>
    )
  },
})
```

**Step 4: Create `routes/inventory/list.tsx`** (index route — renders nothing extra)
```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/inventory/')({
  component: () => null,
})
```

**Step 5: Create `routes/inventory/flyout.tsx`** (registers $id route; layout handles rendering)
```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/inventory/$id')({
  component: () => null,
})
```

**Step 6: Create `routes/inventory/detail.tsx`**
```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchItem, ItemDetail } from '@router-poc/shared'

export const Route = createFileRoute('/inventory/$id/detail')({
  component: function ItemDetailPage() {
    const { id } = Route.useParams()
    const navigate = useNavigate()

    const { data: item, isLoading } = useQuery({
      queryKey: ['item', id],
      queryFn: () => fetchItem(id),
    })

    if (isLoading) return <div className="p-6 text-gray-500">Loading...</div>
    if (!item) return <div className="p-6 text-red-500">Item not found</div>

    return <ItemDetail item={item} onBack={() => navigate({ to: '/inventory' })} />
  },
})
```

**Step 7: Create `routes/findings/layout.tsx`**
```tsx
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { FindingsTabs } from '@router-poc/shared'

export const Route = createFileRoute('/findings')({
  component: function FindingsLayout() {
    const navigate = useNavigate()
    const { location } = useRouterState()
    const activeTab = location.pathname.endsWith('risks') ? 'risks' : 'threats'

    return (
      <FindingsTabs activeTab={activeTab} onTabChange={(tab) => navigate({ to: `/findings/${tab}` })}>
        <Outlet />
      </FindingsTabs>
    )
  },
})
```

**Step 8: Create `routes/findings/redirect.tsx`**
```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/findings/')({
  beforeLoad: () => { throw redirect({ to: '/findings/threats' }) },
})
```

**Step 9: Create `routes/findings/threats.tsx` and `routes/findings/risks.tsx`**

`findings/threats.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchFindings, FindingsList } from '@router-poc/shared'

export const Route = createFileRoute('/findings/threats')({
  component: function ThreatsPage() {
    const { data: items = [] } = useQuery({ queryKey: ['findings', 'threats'], queryFn: () => fetchFindings('threats') })
    return <FindingsList items={items} />
  },
})
```

`findings/risks.tsx`:
```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchFindings, FindingsList } from '@router-poc/shared'

export const Route = createFileRoute('/findings/risks')({
  component: function RisksPage() {
    const { data: items = [] } = useQuery({ queryKey: ['findings', 'risks'], queryFn: () => fetchFindings('risks') })
    return <FindingsList items={items} />
  },
})
```

**Step 10: Start and verify**
```bash
pnpm --filter tanstack-virtual-files dev
```
Expected: app on http://localhost:3004. Plugin generates `routeTree.gen.ts` based on `routes.virtual.ts` config. All routes work.

**Step 11: Commit**
```bash
git add packages/tanstack-virtual-files/
git commit -m "feat(tanstack-virtual-files): implement all routes with TanStack Router virtual file approach"
```

---

### Task 12: Final — Root Dev Script & README

**Step 1: Verify all apps start concurrently**
```bash
pnpm dev
```
Expected: 4 apps start on ports 3001–3004 with colored labels in the terminal. All compile without errors.

**Step 2: Verify cross-app behavior parity**

For each app (3001, 3002, 3003, 3004):
- [ ] `/` → homepage shows router name + two cards
- [ ] Clicking "Inventory" → navigates to `/inventory`, shows list of 10 items
- [ ] Clicking any item → navigates to `/inventory/:id`, flyout drawer slides in from right
- [ ] Press Escape → drawer closes, back to `/inventory`
- [ ] Click "View Full Page →" in drawer → navigates to `/inventory/:id/detail`, no list shown
- [ ] "← Back to Inventory" → back to list
- [ ] Clicking "Findings" in nav → redirects to `/findings/threats`, threats tab active
- [ ] Clicking "Risks" tab → `/findings/risks`, risks list shown
- [ ] Direct URL to `/findings` → redirects to `/findings/threats`
- [ ] Navbar highlights correct active section

**Step 3: Create a minimal README.md**
```md
# Router POC

Comparing React Router v6 and TanStack Router (3 approaches) with identical pages.

| App | Router | Port | URL |
|-----|--------|------|-----|
| react-router | React Router v6 | 3001 | http://localhost:3001 |
| tanstack-file-based | TanStack Router — File-Based | 3002 | http://localhost:3002 |
| tanstack-code-based | TanStack Router — Code-Based | 3003 | http://localhost:3003 |
| tanstack-virtual-files | TanStack Router — Virtual Files | 3004 | http://localhost:3004 |

## Start all apps

\```bash
pnpm install
pnpm dev
\```

## Pages

- **/** — Home
- **/inventory** — List; click item to open flyout drawer
- **/inventory/:id** — List + flyout
- **/inventory/:id/detail** — Full detail page
- **/findings/threats** — Findings: Threats tab
- **/findings/risks** — Findings: Risks tab
```

**Step 4: Final commit**
```bash
git add README.md
git commit -m "docs: add README with app overview"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Monorepo scaffold (pnpm-workspace.yaml, root package.json, tsconfig.base.json) |
| 2 | Shared package: mock data + API helpers (TanStack Query functions) |
| 3 | Shared UI components (Navbar, InventoryList, FlyoutDrawer, ItemDetail, FindingsTabs, FindingsList, HomePage) |
| 4 | React Router app scaffold (Vite + React + Tailwind, no router plugin) |
| 5 | React Router routes (createBrowserRouter, route files) |
| 6 | TanStack code-based app scaffold (no Vite plugin) |
| 7 | TanStack code-based routes (createRootRoute, createRoute, addChildren) |
| 8 | TanStack file-based app scaffold (with @tanstack/router-plugin/vite) |
| 9 | TanStack file-based route files (flat naming conventions) |
| 10 | TanStack virtual-files app scaffold (virtualRouteConfig + Vite plugin) |
| 11 | TanStack virtual-files route files (custom directory structure) |
| 12 | Final verification + README |
