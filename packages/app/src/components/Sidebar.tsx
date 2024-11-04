import { Button } from "@nextui-org/react";
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
    <div>
      <div className="flex flex-col gap-2">
        {links.map((link) => {
          return (
            <Button key={link.to} as={Link} variant="flat" to={link.to}>
              {link.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
