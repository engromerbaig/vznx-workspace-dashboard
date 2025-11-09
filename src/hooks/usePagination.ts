import { useState, useMemo } from 'react';

export const usePagination = <T,>(items: T[], initialCount = 20, step = 20) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  const hasMore = visibleCount < items.length;

  const loadMore = () => {
    if (hasMore) setVisibleCount((prev) => prev + step);
  };

  const resetPagination = () => setVisibleCount(initialCount);

  return { visibleItems, hasMore, loadMore, resetPagination };
};
