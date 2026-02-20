import { useCallback, useEffect, useState } from "react";
import { getJson, patchJson, postJson } from "../utils/api";
import type { Stock } from "../types";

export interface CreateStockInput {
  symbol: string;
  instrumentToken: number;
  companyName: string;
  exchange: string;
  description?: string;
  priority?: number;
}

export interface UpdateStockInput {
  companyName?: string;
  exchange?: string;
  description?: string;
  priority?: number;
}

interface UseStocksResult {
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createStock: (payload: CreateStockInput) => Promise<Stock>;
  updateStock: (stockId: number, payload: UpdateStockInput) => Promise<Stock>;
}

export function useStocks(): UseStocksResult {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getJson<Stock[]>("/api/watchlist/stocks?limit=1000");
      setStocks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch stocks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const createStock = async (payload: CreateStockInput): Promise<Stock> => {
    const created = await postJson<Stock>("/api/watchlist/stocks", payload);
    setStocks((prev) => [created, ...prev]);
    return created;
  };

  const updateStock = async (
    stockId: number,
    payload: UpdateStockInput,
  ): Promise<Stock> => {
    const updated = await patchJson<Stock>(
      `/api/watchlist/stocks/${stockId}`,
      payload,
    );

    setStocks((prev) =>
      prev.map((stock) => (stock.id === stockId ? updated : stock)),
    );

    return updated;
  };

  return {
    stocks,
    loading,
    error,
    refetch: fetchAll,
    createStock,
    updateStock,
  };
}
