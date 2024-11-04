/* eslint-disable @typescript-eslint/consistent-type-assertions */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";

interface AutoRefreshContextValue {
  countdown: number | null;
  add(listener: () => void): () => void;
}

export const AutoRefreshContext = createContext<AutoRefreshContextValue>(
  {} as AutoRefreshContextValue,
);

interface AutoRefreshProviderProps {
  children: ReactNode;
}

const COUNTDOWN_INTERVAL = 5;

export function AutoRefreshProvider({ children }: AutoRefreshProviderProps) {
  const { userSettings } = useUserSettings();
  const [countdown, setCountdown] = useState(
    userSettings.autoRefresh ? COUNTDOWN_INTERVAL : null,
  );
  const [listeners] = useState(() => new Set<() => void>());

  const add = useCallback(
    (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    [listeners],
  );

  useEffect(() => {
    if (countdown === null) {
      return;
    }

    const timerId = window.setTimeout(() => {
      if (!countdown) {
        setCountdown(COUNTDOWN_INTERVAL);

        listeners.forEach((listener) => {
          listener();
        });
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => {
      clearTimeout(timerId);
    };
  }, [countdown]);

  const value = useMemo(() => {
    return {
      add,
      countdown,
    };
  }, [add, countdown]);

  return (
    <AutoRefreshContext.Provider value={value}>
      {children}
    </AutoRefreshContext.Provider>
  );
}
