import { createContext, useContext, useRef } from "react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

type AutoRefetchData = {
  active: boolean;
  countdown: number | null;
  toggle(): void;
  bindRefetch: (refetch: () => void) => void;
};

const AutoRefetchContext = createContext<AutoRefetchData>(
  {} as AutoRefetchData,
);

type AutoRefetchProviderProps = {
  children: ReactNode;
};

const COUNTDOWN_MAX = 5;

export function AutoRefetchProvider({ children }: AutoRefetchProviderProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const refetchListenersRef = useRef<Set<() => void>>();

  if (!refetchListenersRef.current) {
    refetchListenersRef.current = new Set();
  }

  const toggle = () => {
    setCountdown((value) => (value !== null ? null : COUNTDOWN_MAX));
  };

  const active = countdown !== null;
  useEffect(() => {
    if (!active) {
      return;
    }

    const update = (value: number | null) => {
      if (value === null) {
        return null;
      }
      if (value === 0) {
        value = COUNTDOWN_MAX;
      } else {
        value -= 1;
      }

      if (value === 0) {
        refetchListenersRef.current?.forEach((listener) => {
          listener();
        });
      }
      return value;
    };

    const intervalId = window.setInterval(() => {
      setCountdown(update);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [active]);

  const bindRefetch = (refetch: () => void) => {
    const listenersSet = refetchListenersRef.current;
    listenersSet?.add(refetch);
    return () => {
      listenersSet?.delete(refetch);
    };
  };

  return (
    <AutoRefetchContext.Provider
      value={{
        active,
        countdown,
        toggle,
        bindRefetch,
      }}
    >
      {children}
    </AutoRefetchContext.Provider>
  );
}

export function useAutoRefetch(refetch?: () => void) {
  const context = useContext(AutoRefetchContext);

  useEffect(() => {
    if (!refetch) {
      return;
    }
    return context.bindRefetch(refetch);
  }, [refetch]);

  return context;
}
