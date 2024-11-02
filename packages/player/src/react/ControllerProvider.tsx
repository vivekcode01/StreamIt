import { createContext } from "react";
import type { Controller } from "./hooks/useController";
import type { ReactNode } from "react";

export const ControllerContext = createContext(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as Controller,
);

interface ControllerProviderProps {
  children: ReactNode;
  controller: Controller;
}

export function ControllerProvider({
  children,
  controller,
}: ControllerProviderProps) {
  return (
    <ControllerContext.Provider value={controller}>
      {children}
    </ControllerContext.Provider>
  );
}
