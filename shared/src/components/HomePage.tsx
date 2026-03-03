type HomePageProps = {
  routerName: string;
  onNavigate: (path: string) => void;
};

export function HomePage({ routerName, onNavigate }: HomePageProps) {
  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Router POC</h1>
      <p className="text-gray-500 mb-1">Currently using</p>
      <p className="text-xl font-semibold text-blue-600 mb-8">{routerName}</p>
      <div className="grid grid-cols-2 gap-4 text-left">
        <button
          onClick={() => onNavigate("/inventory")}
          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 transition-colors"
        >
          <p className="text-lg font-semibold text-gray-900">Inventory</p>
          <p className="text-sm text-gray-500 mt-1">
            List → flyout drawer → detail page
          </p>
        </button>
        <button
          onClick={() => onNavigate("/findings")}
          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 transition-colors"
        >
          <p className="text-lg font-semibold text-gray-900">Findings</p>
          <p className="text-sm text-gray-500 mt-1">
            Threats and risks with tab routing
          </p>
        </button>
      </div>
    </div>
  );
}
