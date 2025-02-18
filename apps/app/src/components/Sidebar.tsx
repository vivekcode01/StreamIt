import { Link } from "@tanstack/react-router";
import { Box, Layers, Tv, Workflow } from "lucide-react";
import type { ReactNode } from "react";

interface Group {
  title: string;
  links: {
    to: string;
    name: string;
    icon?: ReactNode;
  }[];
}

export function Sidebar() {
  const groups: Group[] = [
    {
      title: "Manage",
      links: [
        {
          to: "/assets",
          name: "Assets",
          icon: <Layers className="w-3 h-3 opacity-50" />,
        },
        {
          to: "/jobs",
          name: "Jobs",
          icon: <Workflow className="w-3 h-3 opacity-50" />,
        },
        {
          to: "/storage",
          name: "Storage",
          icon: <Box className="w-3 h-3 opacity-50" />,
        },
      ],
    },
    {
      title: "Tools",
      links: [
        {
          to: "/player",
          name: "Player",
          icon: <Tv className="w-3 h-3 opacity-50" />,
        },
      ],
    },
    {
      title: "Documentation",
      links: [
        {
          to: "/api",
          name: "API",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <img src="/logo.png" className="w-8 mb-4" />
      <ul>
        {groups.map((group) => {
          return (
            <li key={group.title}>
              <span className="text-xs font-medium opacity-75">
                {group.title}
              </span>
              <ul className="my-2">
                {group.links.map((link) => {
                  return (
                    <li key={link.to}>
                      <ActiveLink
                        key={link.to}
                        to={link.to}
                        name={link.name}
                        icon={link.icon}
                      />
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto text-[10px]">{__VERSION__}</div>
    </div>
  );
}

function ActiveLink({
  to,
  name,
  icon,
}: {
  to: string;
  name: string;
  icon?: ReactNode;
}) {
  return (
    <Link
      className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
      key={to}
      to={to}
      activeProps={{ className: "bg-default-100 shadow-small" }}
    >
      {icon}
      {name}
    </Link>
  );
}
