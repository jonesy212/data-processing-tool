// StorageManager.tsx
import { useLocalStorage } from "@/app/components/hooks/useLocalStorage";
import { BaseData } from "@/app/components/models/data/Data";
import { forwardRef, useImperativeHandle } from "react";


interface StorageManagerProps {
  key: string;
}

const StorageManager = forwardRef((props: StorageManagerProps, ref) => {
  const [storedValue, setStoredValue] = useLocalStorage<BaseData | undefined>(
    props.key,
    undefined
  );

  useImperativeHandle(ref, () => ({
    getItem: (): Promise<BaseData | undefined> => {
      return new Promise((resolve) => {
        resolve(storedValue);
      });
    },
    setItem: async (item: BaseData): Promise<void> => {
      setStoredValue(item);
    },
    removeItem: async (): Promise<void> => {
      setStoredValue(undefined);
    },
    getAllKeys: async (): Promise<string[]> => {
      return Object.keys(window.localStorage);
    },
  }));

  return null; // or some JSX if needed
});

export default StorageManager;
