import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useTransition } from "react";
import NProgress from "nprogress";
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
  const [isPending, startTransiton] = useTransition();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isPending) {
      NProgress.start();
      return () => {
        NProgress.done();
      };
    }
  }, [isPending]);

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

        startTransiton(() => {
          navigate(to);
        });
      }}
    >
      {children}
    </NavLink>
  );
}
