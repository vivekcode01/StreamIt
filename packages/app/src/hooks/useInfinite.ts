import { useRef, useState } from "react";

interface Result<T> {
  cursor?: string;
  items: T[];
}

export function useInfinite<T>(
  initialResult: Result<T>,
  onLoadMore: (cursor: string) => Promise<Result<T>>,
) {
  const ref = useRef<Result<T>>();
  const [cursor, setCursor] = useState<string | undefined>();
  const [items, setItems] = useState<T[]>([]);

  if (ref.current !== initialResult) {
    setCursor(initialResult.cursor);
    setItems(initialResult.items);
    ref.current = initialResult;
  }

  const loadMore = async () => {
    if (!cursor) {
      return;
    }
    const { cursor: nextCursor, items } = await onLoadMore(cursor);
    setCursor(nextCursor);
    setItems((old) => [...old, ...items]);
  };

  return {
    hasMore: !!cursor,
    items,
    loadMore,
  };
}
