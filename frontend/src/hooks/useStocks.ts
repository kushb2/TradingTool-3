import { useCallback, useEffect, useMemo, useState } from "react";
import { getJson, patchJson, postJson, deleteJson } from "../utils/api";
import type { Stock, StockTag } from "../types";

export interface CreateStockInput {
  symbol: string;
  instrument_token: number;
  company_name: string;
  exchange: string;
  notes?: string;
  priority?: number;
  tags?: StockTag[];
}

export interface UpdateStockInput {
  notes?: string;
  priority?: number;
  tags?: StockTag[];
}

interface UseStocksResult {
  stocks: Stock[];
  allTags: StockTag[];           // unique tags derived from all stocks — for dropdown
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filterByTag: (tagName: string | null) => Stock[];
  createStock: (payload: CreateStockInput) => Promise<Stock>;
  updateStock: (stockId: number, payload: UpdateStockInput) => Promise<Stock>;
  deleteStock: (stockId: number) => Promise<void>;
}

// Module-level cache: shared across all component instances
let cachedStocks: Stock[] | null = null;
let fetchPromise: Promise<Stock[]> | null = null;
let stocksChangeListeners: ((stocks: Stock[]) => void)[] = [];

function notifyStocksChange(stocks: Stock[]) {
  cachedStocks = stocks;
  stocksChangeListeners.forEach((listener) => listener(stocks));
}

export function useStocks(): UseStocksResult {
  const [stocks, setStocks] = useState<Stock[]>(cachedStocks ?? []);
  const [loading, setLoading] = useState(cachedStocks === null);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    // If already cached, use it
    if (cachedStocks !== null) {
      setStocks(cachedStocks);
      setLoading(false);
      return;
    }

    // If a fetch is already in progress, wait for it
    if (fetchPromise !== null) {
      try {
        const data = await fetchPromise;
        setStocks(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stocks");
        setLoading(false);
      }
      return;
    }

    // Start a new fetch
    setLoading(true);
    setError(null);
    fetchPromise = getJson<Stock[]>("/api/stocks");
    try {
      const data = await fetchPromise;
      notifyStocksChange(data);
      setStocks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch stocks");
    } finally {
      setLoading(false);
      fetchPromise = null;
    }
  }, []);

  useEffect(() => {
    // Register listener for cache updates from other components
    stocksChangeListeners.push(setStocks);

    // Initial fetch if not cached
    if (cachedStocks === null && fetchPromise === null) {
      void fetchAll();
    } else if (cachedStocks !== null) {
      setStocks(cachedStocks);
      setLoading(false);
    }

    return () => {
      // Cleanup listener
      stocksChangeListeners = stocksChangeListeners.filter((listener) => listener !== setStocks);
    };
  }, [fetchAll]);

  // Derive unique tags from the loaded stocks — no extra API call needed
  const allTags = useMemo<StockTag[]>(() => {
    const seen = new Map<string, string>(); // name → color
    for (const stock of stocks) {
      for (const tag of stock.tags) {
        if (!seen.has(tag.name)) {
          seen.set(tag.name, tag.color);
        }
      }
    }
    return Array.from(seen.entries())
      .map(([name, color]) => ({ name, color }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [stocks]);

  const filterByTag = useCallback(
    (tagName: string | null): Stock[] => {
      if (!tagName) return stocks;
      return stocks.filter((s) => s.tags.some((t) => t.name === tagName));
    },
    [stocks],
  );

  const createStock = async (payload: CreateStockInput): Promise<Stock> => {
    const created = await postJson<Stock>("/api/stocks", {
      symbol: payload.symbol,
      instrument_token: payload.instrument_token,
      company_name: payload.company_name,
      exchange: payload.exchange,
      notes: payload.notes ?? null,
      priority: payload.priority ?? null,
      tags: payload.tags ?? [],
    });
    const updated = [created, ...(stocks ?? [])];
    notifyStocksChange(updated);
    setStocks(updated);
    return created;
  };

  const updateStock = async (
    stockId: number,
    payload: UpdateStockInput,
  ): Promise<Stock> => {
    const updated = await patchJson<Stock>(`/api/stocks/${stockId}`, payload);
    const newStocks = (stocks ?? []).map((s) => (s.id === stockId ? updated : s));
    notifyStocksChange(newStocks);
    setStocks(newStocks);
    return updated;
  };

  const deleteStock = async (stockId: number): Promise<void> => {
    await deleteJson(`/api/stocks/${stockId}`);
    const newStocks = (stocks ?? []).filter((s) => s.id !== stockId);
    notifyStocksChange(newStocks);
    setStocks(newStocks);
  };

  return {
    stocks,
    allTags,
    loading,
    error,
    refetch: fetchAll,
    filterByTag,
    createStock,
    updateStock,
    deleteStock,
  };
}
