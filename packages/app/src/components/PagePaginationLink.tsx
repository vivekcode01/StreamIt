import { cn } from "@/lib/utils";
import { TransitionNavLink } from "./TransitionNavLink";
import type { ReactNode } from "react";

type PagePaginationLinkProps = {
  to: string;
  children: ReactNode;
  isActive: boolean;
};

export function PagePaginationLink({
  to,
  children,
  isActive,
}: PagePaginationLinkProps) {
  return (
    <TransitionNavLink
      to={to}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10",
        isActive && "border border-input bg-background",
      )}
    >
      {children}
    </TransitionNavLink>
  );
}
