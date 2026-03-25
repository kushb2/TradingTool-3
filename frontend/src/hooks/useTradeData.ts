import { useCallback, useEffect, useState } from "react";
import { deleteJson, getJson, postJson } from "../utils/api";
import type { CloseTradeInput, CreateTradeInput, TradeWithTargets } from "../types";

interface UseTradeDataResult {
  trades: TradeWithTargets[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTrade: (payload: CreateTradeInput) => Promise<TradeWithTargets>;
  closeTrade: (tradeId: number, payload: CloseTradeInput) => Promise<void>;
  deleteTrade: (tradeId: number) => Promise<void>;
}

const STORAGE_KEY = "trades_cache";

export function useTradeData(): UseTradeDataResult {
  const [trades, setTrades] = useState<TradeWithTargets[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        setTrades(JSON.parse(cached) as TradeWithTargets[]);
      } catch (e) {
        console.error("Failed to parse cached trades:", e);
      }
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getJson<TradeWithTargets[]>("/api/trades");
      setTrades(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch trades");
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrade = async (payload: CreateTradeInput): Promise<TradeWithTargets> => {
    const created = await postJson<TradeWithTargets>("/api/trades", payload);
    const updated = [created, ...trades];
    setTrades(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return created;
  };

  const closeTrade = async (tradeId: number, payload: CloseTradeInput): Promise<void> => {
    const updated = await postJson<TradeWithTargets>(`/api/trades/${tradeId}/close`, payload);
    const next = trades.map((t) => (t.trade.id === tradeId ? updated : t));
    setTrades(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const deleteTrade = async (tradeId: number): Promise<void> => {
    await deleteJson(`/api/trades/${tradeId}`);
    const updated = trades.filter((t) => t.trade.id !== tradeId);
    setTrades(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Fetch on mount
  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return {
    trades,
    loading,
    error,
    refetch: fetchAll,
    createTrade,
    closeTrade,
    deleteTrade,
  };
}
