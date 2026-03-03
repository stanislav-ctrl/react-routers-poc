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
