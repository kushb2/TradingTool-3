import { useEffect, useState } from "react";
import { apiBaseUrl } from "../utils/api";

interface BackendHealth {
  isLoading: boolean;
  status: string;
  error: string;
}

export function useBackendHealth(): BackendHealth {
  const [health, setHealth] = useState<BackendHealth>({
    isLoading: true,
    status: "",
    error: "",
  });

  useEffect(() => {
    let isActive = true;

    const checkHealth = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/health`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();
        const payload = text.trim()
          ? (JSON.parse(text) as Record<string, unknown>)
          : {};
        const status =
          typeof payload.status === "string" ? payload.status : "unknown";

        if (!isActive) return;
        setHealth({ isLoading: false, status, error: "" });
      } catch (error) {
        if (!isActive) return;
        setHealth({
          isLoading: false,
          status: "",
          error: error instanceof Error ? error.message : "Request failed",
        });
      }
    };

    void checkHealth();
    return () => {
      isActive = false;
    };
  }, []);

  return health;
}