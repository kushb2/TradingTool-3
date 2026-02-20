import { useCallback, useEffect, useState } from "react";
import { deleteJson, getJson, postJson } from "../utils/api";
import type { Tag } from "../types";

interface UseStockTagsResult {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addTag: (tagName: string) => Promise<Tag>;
  removeTag: (tagId: number) => Promise<void>;
}

export function useStockTags(stockId: number | null): UseStockTagsResult {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    if (stockId === null) {
      setTags([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getJson<Tag[]>(`/api/watchlist/stocks/${stockId}/tags`);
      setTags(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch stock tags");
    } finally {
      setLoading(false);
    }
  }, [stockId]);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  const addTag = async (tagName: string): Promise<Tag> => {
    if (stockId === null) {
      throw new Error("Select a stock first");
    }

    const created = await postJson<Tag>(`/api/watchlist/stocks/${stockId}/tags`, {
      tagName,
    });

    setTags((prev) => {
      if (prev.some((item) => item.id === created.id)) {
        return prev;
      }
      return [...prev, created].sort((left, right) =>
        left.name.localeCompare(right.name),
      );
    });

    return created;
  };

  const removeTag = async (tagId: number): Promise<void> => {
    if (stockId === null) {
      throw new Error("Select a stock first");
    }

    await deleteJson(`/api/watchlist/stocks/${stockId}/tags/${tagId}`);
    setTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };

  return {
    tags,
    loading,
    error,
    refetch: fetchTags,
    addTag,
    removeTag,
  };
}
