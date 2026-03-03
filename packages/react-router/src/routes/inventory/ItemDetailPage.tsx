import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchItem, ItemDetail } from "@router-poc/shared";

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () => fetchItem(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!item) return <div className="p-6 text-red-500">Item not found</div>;

  return <ItemDetail item={item} onBack={() => navigate("/inventory")} />;
}
