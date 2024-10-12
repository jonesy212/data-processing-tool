import { endpoints } from "@/app/api/ApiEndpoints";
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";



export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  // Add more properties as needed
}
export interface CryptoStore {
  cryptos: Record<string, Crypto>;
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
    notify(
      "updateCryptSuccess",
      "Crypto updated successfully",
      NOTIFICATION_MESSAGES.Crypto.UPDATE_CRYPTO_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    ); // Notify success
  };

  const deleteCrypto = (id: string) => {
    setCryptos((prevCryptos) => {
      const updatedCryptos = { ...prevCryptos };
      delete updatedCryptos[id];
      return updatedCryptos;
    });
    notify(
      "CryptoDeleteSuccessfully",
      "Crypto deleted successfully",
      NOTIFICATION_MESSAGES.Crypto.DELETE_CRYPTO_FAILURE,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    ); // Notify success
  };

  const handleError = (error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    setError(`Error ${action}: ${error.message || "Unknown error"}`);
    notify(
      `Error ${action}`,
      "Failed to perform action",
      "error", // Changed null to "error" to fix the error
      new Date(),
      NotificationTypeEnum.OperationError
    );
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
