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
    <div className="flex flex-col gap-2">
      {links.map((link) => {
        return (
          <Link
            key={link.to}
            to={link.to}
            activeProps={{ className: "text-primary" }}
          >
            {link.name}
          </Link>
        );
      })}
    </div>
  );
}
