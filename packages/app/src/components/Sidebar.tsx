import { Link } from "@tanstack/react-router";

export function Sidebar() {
  const links = [
    {
      to: "/",
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
      to: "/api",
      name: "API",
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
