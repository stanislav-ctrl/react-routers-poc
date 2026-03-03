import type { Finding } from "../data/findings";

const severityColors: Record<Finding["severity"], string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-700",
};

export function FindingsList({ items }: { items: Finding[] }) {
  return (
    <ul className="space-y-3">
      {items.map((f) => (
        <li key={f.id} className="bg-white rounded-lg shadow p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">{f.title}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColors[f.severity]}`}
            >
              {f.severity}
            </span>
          </div>
          <p className="text-sm text-gray-600">{f.description}</p>
        </li>
      ))}
    </ul>
  );
}
