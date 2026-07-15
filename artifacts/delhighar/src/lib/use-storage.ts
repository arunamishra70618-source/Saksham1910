import { useState, useCallback, useEffect } from "react";

const RECENT_KEY = "pg_recent_views";
const FILTERS_KEY = "pg_last_filters";
const MAX_RECENT = 6;

export interface RecentListing {
  id: string;
  name: string;
  area: string;
  rent: number;
  viewedAt: number;
}

export interface SavedFilters {
  type?: string;
  gender?: string;
  verifiedOnly?: boolean;
  search?: string;
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function useRecentViews() {
  const [recents, setRecents] = useState<RecentListing[]>(() =>
    safeGet<RecentListing[]>(RECENT_KEY, [])
  );

  const addRecent = useCallback((listing: Omit<RecentListing, "viewedAt">) => {
    setRecents((prev) => {
      const filtered = prev.filter((r) => r.id !== listing.id);
      const updated = [{ ...listing, viewedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      safeSet(RECENT_KEY, updated);
      return updated;
    });
  }, []);

  const clearRecents = useCallback(() => {
    localStorage.removeItem(RECENT_KEY);
    setRecents([]);
  }, []);

  return { recents, addRecent, clearRecents };
}

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilters>(() =>
    safeGet<SavedFilters>(FILTERS_KEY, {})
  );

  const saveFilters = useCallback((filters: SavedFilters) => {
    safeSet(FILTERS_KEY, filters);
    setSavedFilters(filters);
  }, []);

  return { savedFilters, saveFilters };
}
