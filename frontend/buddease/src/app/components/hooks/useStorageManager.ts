// useStorageManager.ts
// useStorageManager.ts
import { useState, useCallback } from "react";
import { BaseData } from "../models/data/Data";



const useStorageManager = (key: string) => {
  const [storedValue, setStoredValue] = useState<BaseData | undefined>(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : undefined;
  });

  const getItem = useCallback((): BaseData | undefined => {
    return storedValue;
  }, [storedValue]);

  const setItem = useCallback((item: BaseData): void => {
    setStoredValue(item);
    window.localStorage.setItem(key, JSON.stringify(item));
  }, [key]);

  const removeItem = useCallback((): void => {
    setStoredValue(undefined);
    window.localStorage.removeItem(key);
  }, [key]);

  const getAllKeys = useCallback((): string[] => {
    return Object.keys(window.localStorage);
  }, []);

  return { getItem, setItem, removeItem, getAllKeys };
};

export default useStorageManager;
