import type { ReactNode } from "react";

type FindingsTabsProps = {
  activeTab: "threats" | "risks";
  onTabChange: (tab: "threats" | "risks") => void;
  children: ReactNode;
};

export function FindingsTabs({
  activeTab,
  onTabChange,
  children,
}: FindingsTabsProps) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Findings</h1>
      <div className="flex border-b border-gray-200 mb-6">
        {(["threats", "risks"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
