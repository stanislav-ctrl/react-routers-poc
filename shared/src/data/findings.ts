export type Finding = {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  affectedItems: string[];
};

export const THREATS: Finding[] = [
  {
    id: "t1",
    title: "SQL Injection in Auth Service",
    severity: "critical",
    description: "Unsanitized input in login endpoint allows SQL injection",
    affectedItems: ["9"],
  },
  {
    id: "t2",
    title: "Outdated TLS on Web Server",
    severity: "high",
    description: "Web Server A is using TLS 1.1 which is deprecated",
    affectedItems: ["1"],
  },
  {
    id: "t3",
    title: "Exposed Debug Endpoint",
    severity: "medium",
    description: "API Gateway exposes /debug endpoint without auth",
    affectedItems: ["6"],
  },
  {
    id: "t4",
    title: "Weak Redis Password",
    severity: "high",
    description: "Cache C uses a weak default password",
    affectedItems: ["3"],
  },
  {
    id: "t5",
    title: "Missing Rate Limiting",
    severity: "medium",
    description: "Load balancer has no rate limiting configured",
    affectedItems: ["4"],
  },
];

export const RISKS: Finding[] = [
  {
    id: "r1",
    title: "Single Point of Failure: Database",
    severity: "critical",
    description: "Database B has no read replica, causing availability risk",
    affectedItems: ["2"],
  },
  {
    id: "r2",
    title: "No Backup Policy",
    severity: "high",
    description: "Storage H has no automated backup schedule",
    affectedItems: ["8"],
  },
  {
    id: "r3",
    title: "Worker Downtime",
    severity: "medium",
    description: "Worker E is inactive and job queue may overflow",
    affectedItems: ["5"],
  },
  {
    id: "r4",
    title: "Monitoring Gaps",
    severity: "low",
    description: "Queue J is not monitored by Prometheus",
    affectedItems: ["10"],
  },
  {
    id: "r5",
    title: "Auth Service Capacity",
    severity: "high",
    description: "Auth Service I is at 90% CPU under peak load",
    affectedItems: ["9"],
  },
];
