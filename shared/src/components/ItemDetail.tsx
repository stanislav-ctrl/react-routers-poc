import type { InventoryItem } from "../data/inventory";

type ItemDetailProps = {
  item: InventoryItem;
  onBack: () => void;
};

const statusColors: Record<InventoryItem["status"], string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  warning: "bg-yellow-100 text-yellow-800",
};

export function ItemDetail({ item, onBack }: ItemDetailProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={onBack}
        className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
      >
        ← Back to Inventory
      </button>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[item.status]}`}
          >
            {item.status}
          </span>
        </div>
        <p className="text-gray-600">{item.description}</p>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">ID: {item.id}</p>
        </div>
      </div>
    </div>
  );
}
