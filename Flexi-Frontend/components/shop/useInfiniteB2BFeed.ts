import { useCallback, useEffect, useState } from "react";
import { PagedResponse } from "@/api/B2B_api";

type Fetcher<T> = (cursor?: string) => Promise<PagedResponse<T>>;

type UseInfiniteB2BFeedResult<T> = {
  data: T[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onRefresh: () => void;
  loadMore: () => void;
  reload: () => Promise<void>;
};

/**
 * Infinite scroll helper for B2B feeds using cursor-based pagination.
 */
export const useInfiniteB2BFeed = <T,>(fetcher: Fetcher<T>): UseInfiniteB2BFeedResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetcher();
      const safeItems = Array.isArray(res?.items) ? res.items : [];
      setData(safeItems);
      setNextCursor(res?.nextCursor ?? null);
      setHasMore(res?.hasMore ?? false);
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as Error).message
          : "Failed to load data";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [fetcher]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    hydrate();
  }, [hydrate]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetcher(nextCursor);
      const safeItems = Array.isArray(res?.items) ? res.items : [];
      setData((prev) => [...prev, ...safeItems]);
      setNextCursor(res?.nextCursor ?? null);
      setHasMore(res?.hasMore ?? false);
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as Error).message
          : "Failed to load data";
      setError(message);
    } finally {
      setLoadingMore(false);
    }
  }, [fetcher, hasMore, loading, loadingMore, nextCursor]);

  return {
    data,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    onRefresh,
    loadMore,
    reload: hydrate,
  };
};
