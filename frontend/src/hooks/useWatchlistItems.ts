import { useCallback, useEffect, useState } from "react";
import { deleteJson, getJson, postJson } from "../utils/api";
import type { WatchlistStock } from "../types";

interface UseWatchlistItemsResult {
  items: WatchlistStock[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addStockToWatchlist: (stockId: number) => Promise<WatchlistStock>;
  removeStockFromWatchlist: (stockId: number) => Promise<void>;
}

export function useWatchlistItems(
  watchlistId: number | null,
): UseWatchlistItemsResult {
  const [items, setItems] = useState<WatchlistStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (watchlistId === null) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getJson<WatchlistStock[]>(
        `/api/watchlist/lists/${watchlistId}/items`,
      );
      setItems(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to fetch watchlist stocks",
      );
    } finally {
      setLoading(false);
    }
  }, [watchlistId]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const addStockToWatchlist = async (stockId: number): Promise<WatchlistStock> => {
    if (watchlistId === null) {
      throw new Error("Select a watchlist first");
    }

    const created = await postJson<WatchlistStock>("/api/watchlist/items", {
      watchlistId,
      stockId,
    });

    setItems((prev) => {
      if (prev.some((item) => item.stockId === created.stockId)) {
        return prev;
      }
      return [created, ...prev];
    });

    return created;
  };

  const removeStockFromWatchlist = async (stockId: number): Promise<void> => {
    if (watchlistId === null) {
      throw new Error("Select a watchlist first");
    }

    await deleteJson(`/api/watchlist/items/${watchlistId}/${stockId}`);
    setItems((prev) => prev.filter((item) => item.stockId !== stockId));
  };

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    addStockToWatchlist,
    removeStockFromWatchlist,
  };
}
