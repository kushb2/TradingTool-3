import { useCallback, useEffect, useState } from "react";
import { deleteJson, getJson, postJson } from "../utils/api";
import type { StockNote } from "../types";

export function useStockNotes(stockId: number | null) {
  const [notes, setNotes] = useState<StockNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (stockId === null) {
      setNotes([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getJson<StockNote[]>(`/api/notes/stock/${stockId}`);
      setNotes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  }, [stockId]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const addNote = async (content: string) => {
    if (stockId === null) return;
    const note = await postJson<StockNote>(`/api/notes/stock/${stockId}`, { content });
    setNotes((prev) => [...prev, note]);
  };

  const removeNote = async (noteId: number) => {
    if (stockId === null) return;
    await deleteJson(`/api/notes/stock/${stockId}/${noteId}`);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return { notes, loading, error, addNote, removeNote, refetch: fetchNotes };
}
