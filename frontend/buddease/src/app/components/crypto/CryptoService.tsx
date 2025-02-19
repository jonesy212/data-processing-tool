import { endpoints } from "@/app/api/ApiEndpoints";
import { rootStores } from "@/app/components/state/stores/RootStores"; // Import rootStores
import { action, observable, runInAction } from "mobx";
import { CryptoActions } from "../actions/CryptoActions";

const API_BASE_URL = endpoints.crypto.settings;

class CryptoService {
  @observable private static instance: CryptoService;
  @observable private currentCryptoData: any;

  constructor() {
    this.currentCryptoData = getDefaultCryptoData();
  }

  @action
  public static getInstance(): CryptoService {
    if (!this.instance) {
      this.instance = new CryptoService();
    }
    return this.instance;
  }

  @action
  public async fetchCryptoDataFromServer(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}`);
      const cryptoData = await response.json();

      // Apply crypto data asynchronously
      this.applyCryptoData(cryptoData);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    }
  }

  @action
  public applyCryptoData(cryptoData: any): void {
    runInAction(() => {
      // Update crypto data
      this.currentCryptoData = cryptoData;

      // Trigger events or callbacks for crypto data changes
      this.triggerCryptoChangeEvent(cryptoData);

      // Dispatch crypto change action using rootStores
      rootStores.dispatch(CryptoActions.cryptoChangeAction(cryptoData)); // Use rootStores instead of store
    });
  }

  @action
  public getCurrentCryptoData(): any {
    return this.currentCryptoData;
  }

  private triggerCryptoChangeEvent(cryptoData: any): void {
    // Dispatch MobX action to notify other parts of the application about the crypto data change
    rootStores.dispatch(CryptoActions.cryptoChangeAction(cryptoData)); // Use rootStores instead of store
  }

  // Additional Actions

  @action
  public updateCryptoData(newCryptoData: any): void {
    // Update the cryptocurrency data with new information
    this.currentCryptoData = newCryptoData;
  }

  @action
  public addNewCrypto(cryptoInfo: any): void {
    // Add a new cryptocurrency to the list of tracked cryptocurrencies
    runInAction(() => {
      // Implement logic to add the new cryptocurrency
      // For example:
      this.currentCryptoData.push(cryptoInfo);
    });
  }

  @action
  public removeCrypto(cryptoId: string): void {
    // Remove a cryptocurrency from the list of tracked cryptocurrencies
    runInAction(() => {
      // Implement logic to remove the cryptocurrency with the specified ID
      // For example:
      this.currentCryptoData = this.currentCryptoData.filter(
        (crypto: any) => crypto.id !== cryptoId
      );
    });
  }

  @action
  public async fetchHistoricalData(cryptoId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/historical-data/${cryptoId}`
      );
      const historicalData = await response.json();
      this.updateCryptoData({ ...this.currentCryptoData, historicalData });
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  }

  @action
  public async fetchNews(cryptoId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/news/${cryptoId}`);
      const news = await response.json();
      this.updateCryptoData({ ...this.currentCryptoData, news });
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }

  @action
  public async fetchPricePrediction(cryptoId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/price-prediction/${cryptoId}`
      );
      const pricePrediction = await response.json();
      this.updateCryptoData({ ...this.currentCryptoData, pricePrediction });
    } catch (error) {
      console.error("Error fetching price prediction:", error);
    }
  }
}

function getDefaultCryptoData(): any {
  // Example: Retrieve default crypto data from a predefined set
  const defaultCryptoData = {
    name: "Bitcoin",
    symbol: "BTC",
    price: 50000.0,
    volume: 1000000,
    marketCap: 900000000000,
    // Add more properties as needed
  };

  // Alternatively, you can retrieve default crypto data from stored preferences
  // Example:
  // const storedPreferences = localStorage.getItem('crypto_preferences');
  // const defaultCryptoData = storedPreferences ? JSON.parse(storedPreferences) : {};

  return defaultCryptoData;
}

const cryptoService = new CryptoService(); // Create an instance of CryptoService

export { CryptoService, cryptoService }; // Export the instance and the class
