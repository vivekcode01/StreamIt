import { createContext } from "react";
import type { Lang, Metadata } from "../types";
import type { ReactNode } from "react";

export interface Params {
  metadata?: Metadata;
  lang?: Lang;
}

export const ParamsContext = createContext<Params>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as Params,
);

type ParamsProviderProps = {
  children: ReactNode;
} & Params;

export function ParamsProvider({
  children,
  metadata,
  lang,
}: ParamsProviderProps) {
  return (
    <ParamsContext.Provider value={{ metadata, lang }}>
      {children}
    </ParamsContext.Provider>
  );
}
