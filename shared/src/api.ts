import { INVENTORY_ITEMS, type InventoryItem } from "./data/inventory";
import { THREATS, RISKS, type Finding } from "./data/findings";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const fetchInventory = async (): Promise<InventoryItem[]> => {
  await delay(300);
  return INVENTORY_ITEMS;
};

export const fetchItem = async (id: string): Promise<InventoryItem> => {
  await delay(200);
  const item = INVENTORY_ITEMS.find((i) => i.id === id);
  if (!item) throw new Error(`Item ${id} not found`);
  return item;
};

export const fetchFindings = async (
  type: "threats" | "risks",
): Promise<Finding[]> => {
  await delay(300);
  return type === "threats" ? THREATS : RISKS;
};
