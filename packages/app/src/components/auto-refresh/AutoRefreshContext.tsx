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
  active: boolean;
  toggle(): void;
  countdown: number;
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
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_INTERVAL);
  const [listeners] = useState(() => new Set<AutoRefreshListener>());

  const toggle = useCallback(() => {
    setActive((value) => !value);
  }, []);

  const add = useCallback(
    (listener: AutoRefreshListener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    [listeners],
  );

  useEffect(() => {
    if (!active) {
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
  }, [active, countdown]);

  const value = useMemo(() => {
    return {
      toggle,
      add,
      active,
      countdown,
    };
  }, [toggle, add, active, countdown]);

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
