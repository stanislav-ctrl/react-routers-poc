type NavbarProps = {
  currentPath: string;
  onNavigate: (path: string) => void;
  routerLabel: string;
};

const links = [
  { label: "Home", path: "/" },
  { label: "Inventory", path: "/inventory" },
  { label: "Findings", path: "/findings" },
];

export function Navbar({ currentPath, onNavigate, routerLabel }: NavbarProps) {
  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex gap-6 items-center">
      <span className="font-bold text-lg mr-2">Router POC</span>
      <span className="text-xs bg-blue-600 px-2 py-0.5 rounded text-blue-100 mr-4">
        {routerLabel}
      </span>
      {links.map((link) => {
        const isActive =
          link.path === "/"
            ? currentPath === "/"
            : currentPath.startsWith(link.path);
        return (
          <button
            key={link.path}
            onClick={() => onNavigate(link.path)}
            className={`text-sm transition-colors hover:text-blue-300 ${isActive ? "text-blue-400 font-semibold" : "text-gray-300"}`}
          >
            {link.label}
          </button>
        );
      })}
    </nav>
  );
}
