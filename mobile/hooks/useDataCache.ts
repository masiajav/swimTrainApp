import { useState, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchRef = useRef<Promise<T> | null>(null);

  const fetchData = async () => {
    // Check cache first
    const cached = cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setData(cached.data);
      setLoading(false);
      return cached.data;
    }

    // Prevent duplicate fetches
    if (fetchRef.current) {
      return fetchRef.current;
    }

    setLoading(true);
    setError(null);

    try {
      fetchRef.current = fetcher();
      const result = await fetchRef.current;
      
      // Cache the result
      cache.set(key, {
        data: result,
        timestamp: now
      });
      
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
      fetchRef.current = null;
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const invalidateCache = () => {
    cache.delete(key);
  };

  const refetch = () => {
    invalidateCache();
    return fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch,
    invalidateCache
  };
}

export function clearAllCache() {
  cache.clear();
}
