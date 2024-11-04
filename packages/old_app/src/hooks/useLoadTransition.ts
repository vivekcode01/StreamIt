import NProgress from "nprogress";
import { useEffect, useTransition } from "react";

type UseLoadTransition = ReturnType<typeof useTransition>;

export function useLoadTransition(): UseLoadTransition {
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
