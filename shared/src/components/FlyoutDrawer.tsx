import { useEffect } from "react";
import type { InventoryItem } from "../data/inventory";

type FlyoutDrawerProps = {
  item: InventoryItem;
  onClose: () => void;
  onViewDetail: (id: string) => void;
};

export function FlyoutDrawer({
  item,
  onClose,
  onViewDetail,
}: FlyoutDrawerProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-10" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-20 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Item Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xl font-bold text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-600">{item.description}</p>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded"
              >
                {tag}
              </span>
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
  );
}
