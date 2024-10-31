import { useTransition, useEffect } from "react";
import NProgress from "nprogress";

type UseTransition = ReturnType<typeof useTransition>;

export function useProgressTransition(): UseTransition {
  const [isPending, startTransiton] = useTransition();

  useEffect(() => {
    if (isPending) {
      NProgress.start();
      return () => {
        NProgress.done();
      };
    }
  }, [isPending]);

  return [isPending, startTransiton];
}
