import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  fetchInventory,
  fetchItem,
  InventoryList,
  FlyoutDrawer,
} from "@router-poc/shared";

export function InventoryLayout() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: items = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
  });

  const { data: selectedItem } = useQuery({
    queryKey: ["item", id],
    queryFn: () => fetchItem(id!),
    enabled: !!id,
  });

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
          onClose={() => navigate("/inventory")}
          onViewDetail={(itemId) => navigate(`/inventory/${itemId}/detail`)}
        />
      )}
    </div>
  );
}
