import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useProgressTransition } from "@/hooks/useProgressTransition";
import type { ReactNode } from "react";

type TransitionNavLinkState = {
  isPending: boolean;
  isActive: boolean;
};

type TransitionNavLinkProps = {
  to: string;
  children: ReactNode;
  className?: string | ((state: TransitionNavLinkState) => void);
};

export function TransitionNavLink({
  to,
  children,
  className,
}: TransitionNavLinkProps) {
  const [isPending, startTransition] = useProgressTransition();
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
