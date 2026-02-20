import { useCallback, useEffect, useState } from "react";
import { deleteJson, getJson, postJson } from "../utils/api";
import type { Tag } from "../types";

interface UseWatchlistTagsResult {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addTag: (tagName: string) => Promise<Tag>;
  removeTag: (tagId: number) => Promise<void>;
}

export function useWatchlistTags(
  watchlistId: number | null,
): UseWatchlistTagsResult {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    if (watchlistId === null) {
      setTags([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getJson<Tag[]>(`/api/watchlist/lists/${watchlistId}/tags`);
      setTags(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch watchlist tags");
    } finally {
      setLoading(false);
    }
  }, [watchlistId]);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  const addTag = async (tagName: string): Promise<Tag> => {
    if (watchlistId === null) {
      throw new Error("Select a watchlist first");
    }

    const created = await postJson<Tag>(
      `/api/watchlist/lists/${watchlistId}/tags`,
      { tagName },
    );

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
    if (watchlistId === null) {
      throw new Error("Select a watchlist first");
    }

    await deleteJson(`/api/watchlist/lists/${watchlistId}/tags/${tagId}`);
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
