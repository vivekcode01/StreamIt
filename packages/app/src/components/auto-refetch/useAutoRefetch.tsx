import { useEffect, useState } from "react";

export type AutoRefetch = {
  active: boolean;
  toggle(): void;
  countdown: number;
  add(listener: Listener): () => void;
};

type Listener = () => void;

const COUNTDOWN_INTERVAL = 5;

export function useAutoRefetch(): AutoRefetch {
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_INTERVAL);
  const [listeners] = useState(() => new Set<Listener>());

  const toggle = () => {
    setActive((value) => !value);
  };

  const add = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

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

  return {
    active,
    toggle,
    countdown,
    add,
  };
}

export function useAutoRefetchBind(
  autoRefetch: AutoRefetch | undefined,
  listener: Listener,
) {
  useEffect(() => {
    return autoRefetch?.add(listener);
  }, []);
}
