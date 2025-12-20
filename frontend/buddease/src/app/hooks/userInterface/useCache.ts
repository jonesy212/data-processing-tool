// useCache.ts
'use client';

import { useState, useEffect } from 'react';
import { CacheManager } from '@/app/libraries/cache/client/CacheManager';

export const useCache = (key: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCache = async () => {
      try {
        setLoading(true);
        const cachedData = await CacheManager.read(key);
        setData(cachedData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadCache();
  }, [key]);

  const updateCache = async (newData: any, options?: any) => {
    try {
      await CacheManager.write(key, newData, options);
      setData(newData);
    } catch (err) {
      setError(err as Error);
    }
  };

  return { data, loading, error, updateCache };
};