import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useLoadTransition } from "@/hooks/useLoadTransition";

interface LoadNavLinkState {
  isPending: boolean;
  isActive: boolean;
}

interface LoadNavLinkProps {
  to: string;
  children: ReactNode;
  className?: string | ((state: LoadNavLinkState) => void);
}

export function LoadNavLink({ to, children, className }: LoadNavLinkProps) {
  const [isPending, startTransition] = useLoadTransition();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        if (typeof className === "string") {
          return className;
        }
        return className?.({ isActive, isPending }) ?? "";
      }}
      onClick={(event) => {
        event.preventDefault();

        if (location.pathname === to) {
          return;
        }

        startTransition(() => {
          navigate(to);
        });
      }}
    >
      {children}
    </NavLink>
  );
}
