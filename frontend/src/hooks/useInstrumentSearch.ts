import { useCallback, useRef, useState } from "react";
import { getJson } from "../utils/api";
import type { InstrumentSearchResult } from "../types";

export function useInstrumentSearch() {
  const [results, setResults] = useState<InstrumentSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string, exchange = "NSE") => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await getJson<InstrumentSearchResult[]>(
          `/api/instruments/search?q=${encodeURIComponent(query)}&exchange=${exchange}`,
        );
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const clearResults = useCallback(() => setResults([]), []);

  return { results, searching, search, clearResults };
}
