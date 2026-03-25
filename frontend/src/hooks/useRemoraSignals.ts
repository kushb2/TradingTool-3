import { useEffect, useState } from "react";
import type { RemoraSignal } from "../types";

export function useRemoraSignals(type?: "ACCUMULATION" | "DISTRIBUTION") {
  const [signals, setSignals] = useState<RemoraSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(`${import.meta.env.VITE_API_URL || ""}/api/watchlist/remora`, window.location.href);
    if (type) url.searchParams.set("type", type);

    setLoading(true);
    fetch(url.toString())
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch Remora signals: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setSignals(data);
        setError(null);
      })
      .catch((err) => setError(err.message || "Failed to load Remora signals"))
      .finally(() => setLoading(false));
  }, [type]);

  return { signals, loading, error };
}
