export type InventoryItem = {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "warning";
  tags: string[];
};

export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "1",
    name: "Web Server A",
    description: "Primary web server handling HTTP traffic",
    status: "active",
    tags: ["web", "production"],
  },
  {
    id: "2",
    name: "Database B",
    description: "PostgreSQL instance for user data",
    status: "active",
    tags: ["db", "production"],
  },
  {
    id: "3",
    name: "Cache C",
    description: "Redis cache layer",
    status: "warning",
    tags: ["cache", "production"],
  },
  {
    id: "4",
    name: "Load Balancer D",
    description: "Nginx load balancer",
    status: "active",
    tags: ["infra", "production"],
  },
  {
    id: "5",
    name: "Worker E",
    description: "Background job processor",
    status: "inactive",
    tags: ["worker", "staging"],
  },
  {
    id: "6",
    name: "API Gateway F",
    description: "Kong API gateway",
    status: "active",
    tags: ["api", "production"],
  },
  {
    id: "7",
    name: "Monitoring G",
    description: "Prometheus + Grafana stack",
    status: "active",
    tags: ["monitoring"],
  },
  {
    id: "8",
    name: "Storage H",
    description: "S3-compatible object storage",
    status: "active",
    tags: ["storage", "production"],
  },
  {
    id: "9",
    name: "Auth Service I",
    description: "OAuth2/OIDC identity provider",
    status: "warning",
    tags: ["auth", "production"],
  },
  {
    id: "10",
    name: "Queue J",
    description: "RabbitMQ message queue",
    status: "active",
    tags: ["queue", "production"],
  },
];
