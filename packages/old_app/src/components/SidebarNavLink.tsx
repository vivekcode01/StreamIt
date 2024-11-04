import type { ReactNode } from "react";
import { LoadNavLink } from "@/components/LoadNavLink";
import { cn } from "@/lib/utils";

interface SidebarNavLinkProps {
  children: ReactNode;
  to: string;
}

export function SidebarNavLink({ children, to }: SidebarNavLinkProps) {
  return (
    <LoadNavLink
      to={to}
      className={({ isActive }) => {
        return cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          isActive ? "bg-muted text-primary" : null,
        );
      }}
    >
      {children}
    </LoadNavLink>
  );
}
