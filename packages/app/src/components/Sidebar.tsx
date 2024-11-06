import { Link } from "@tanstack/react-router";

export function Sidebar() {
  const links = [
    {
      to: "/assets",
      name: "Assets",
    },
    {
      to: "/jobs",
      name: "Jobs",
    },
    {
      to: "/storage",
      name: "Storage",
    },
    {
      to: "/player",
      name: "Player",
    },
    {
      to: "/api",
      name: "API",
    },
    {
      to: "/stitcher-api",
      name: "Stitcher API",
    },
  ];

  return (
    <div className="flex flex-col">
      <img src="/logo.png" className="w-8 mb-4" />
      {links.map((link) => {
        return <ActiveLink key={link.to} to={link.to} name={link.name} />;
      })}
    </div>
  );
}

function ActiveLink({ to, name }: { to: string; name: string }) {
  return (
    <Link
      className="w-full px-4 py-2 rounded-lg text-sm"
      key={to}
      to={to}
      activeProps={{ className: "bg-gray-200" }}
    >
      {name}
    </Link>
  );
}
