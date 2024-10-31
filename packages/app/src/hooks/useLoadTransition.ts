import { useTransition, useEffect } from "react";
import NProgress from "nprogress";

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
