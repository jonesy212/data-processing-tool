// CryptoStore.ts
import { endpoints } from '@/core/api/endpointConfigurations';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from "@/core/state/context/NotificationContext";
import { makeAutoObservable } from "mobx";
import { useState } from "react";

export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  currentPrice?: number;
  priceChange24h?: number;
  marketCap?: number;

  // Notification/alert preferences
  cryptoAlerts?: {
    enabled: boolean;
    priority?: number;
    fallbackOrder?: ('push' | 'inApp' | 'email')[];
  };
  tradeExecutions?: {
    enabled: boolean;
    priority?: number;
  };
  portfolioUpdates?: {
    enabled: boolean;
    priority?: number;
  };
}

export interface CryptoStore {
  cryptos: Record<string, Crypto>;
  isLoading: boolean;
  error: string | null;
  fetchCryptos: () => void;
  updateCrypto: (id: string, updatedCrypto: Crypto) => void;
  deleteCrypto: (id: string) => void;
  // Add more methods as needed
}

const useCryptoStore = (): CryptoStore => {
  const [cryptos, setCryptos] = useState<Record<string, Crypto>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();

  const fetchCryptos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = endpoints.crypto.list.toString();
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch cryptos");
      }
      const data = await response.json();
      setCryptos(data);
      
      // Notify success for fetch
      notify({
        id: 'fetchCryptosSuccess',
        message: NOTIFICATION_MESSAGES.Crypto.FETCH_CRYPTOS_SUCCESS,
        data: { count: Object.keys(data).length },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS
      });
    } catch (error) {
      handleError(error, "fetching cryptos");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCrypto = (id: string, updatedCrypto: Crypto) => {
    setCryptos((prevCryptos) => ({
      ...prevCryptos,
      [id]: updatedCrypto,
    }));
    
    // Notify success for update
    notify({
      id: 'updateCryptoSuccess',
      message: NOTIFICATION_MESSAGES.Crypto.UPDATE_CRYPTO_SUCCESS,
      data: {
        entityId: id,
        entityType: 'crypto',
        extra: {
          name: updatedCrypto.name
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS
    });
  };

  const deleteCrypto = (id: string) => {
    const deletedCrypto = cryptos[id];
    setCryptos((prevCryptos) => {
      const updatedCryptos = { ...prevCryptos };
      delete updatedCryptos[id];
      return updatedCryptos;
    });
    
    // Notify success for delete - FIXED: Using SUCCESS message, not FAILURE
    notify({
      id: 'deleteCryptoSuccess',
      message: NOTIFICATION_MESSAGES.Crypto.DELETE_CRYPTO_SUCCESS,
      data: {
        entityId: id,
        entityType: 'crypto',
        extra: {
          name: deletedCrypto.name
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS
    });
  };

  const handleError = (error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    const errorMessage = `Error ${action}: ${error.message || "Unknown error"}`;
    setError(errorMessage);
    
    // Notify error with object pattern
    notify({
      id: `error${action.replace(/\s+/g, '')}`,
      message: `Failed to ${action}`,
      data: { 
        originalError: error.message,
        action: action
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error'
    });
  };

  const store: CryptoStore = makeAutoObservable({
    cryptos,
    isLoading,
    error,
    fetchCryptos,
    updateCrypto,
    deleteCrypto,
  });

  return store;
};

export default useCryptoStore;