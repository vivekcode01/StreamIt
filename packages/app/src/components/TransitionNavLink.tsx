import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useLoadTransition } from "@/hooks/useLoadTransition";

interface TransitionNavLinkState {
  isPending: boolean;
  isActive: boolean;
}

interface TransitionNavLinkProps {
  to: string;
  children: ReactNode;
  className?: string | ((state: TransitionNavLinkState) => void);
}

export function TransitionNavLink({
  to,
  children,
  className,
}: TransitionNavLinkProps) {
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
