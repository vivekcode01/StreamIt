import { useUserSettings } from "@/hooks/useUserSettings";
import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import type { ReactNode } from "react";

type AutoRefreshListener = () => void;

type AutoRefreshContextValue = {
  countdown: number | null;
  add(listener: AutoRefreshListener): () => void;
};

const AutoRefreshContext = createContext<AutoRefreshContextValue>(
  {} as AutoRefreshContextValue,
);

type AutoRefreshProviderProps = {
  children: ReactNode;
};

const COUNTDOWN_INTERVAL = 5;

export function AutoRefreshProvider({ children }: AutoRefreshProviderProps) {
  const { userSettings } = useUserSettings();
  const [countdown, setCountdown] = useState(
    userSettings.autoRefresh ? COUNTDOWN_INTERVAL : null,
  );
  const [listeners] = useState(() => new Set<AutoRefreshListener>());

  const add = useCallback(
    (listener: AutoRefreshListener) => {
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

export function useAutoRefresh() {
  return useContext(AutoRefreshContext);
}

export function useAutoRefreshFunction(listener: AutoRefreshListener) {
  const { add } = useAutoRefresh();

  useEffect(() => {
    return add(listener);
  }, [add]);
}
