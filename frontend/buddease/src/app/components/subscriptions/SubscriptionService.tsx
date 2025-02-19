import { action, observable } from 'mobx';
import { AuthenticationProvider } from "../auth/AuthService";
import { ModifiedDate } from "../documents/DocType";
import Web3Provider from "../web3/Web3Provider";

class SubscriptionService {
  @observable subscribers: Record<string, ((data: any) => void)[]> = {};

  subscriptions: Record<string, () => void> = {};

  private authenticationProviders: AuthenticationProvider[] = [];

  // Method to add authentication providers
  public async addAuthenticationProvider(provider: AuthenticationProvider): Promise<void> {
      if (!this.authenticationProviders.includes(provider)) {
          this.authenticationProviders.push(provider);
      }
      // Optional: Save providers to persistent storage
  }

  // Method to get the list of authentication providers
  public async getAuthenticationProviders(): Promise<AuthenticationProvider[]> {
      return this.authenticationProviders;
  }

  // Optional: Remove an authentication provider
  public async removeAuthenticationProvider(provider: AuthenticationProvider): Promise<void> {
      this.authenticationProviders = this.authenticationProviders.filter(
          p => p !== provider
      );
      // Optional: Update persistent storage
  }

  @action
  subscribe = (eventName: string, callback: (data: any) => void) => {
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }

    this.subscribers[eventName].push(callback);
  };

  @action
  unsubscribe = (eventName: string, callback: (data: any) => void) => {
    const subscribers = this.subscribers[eventName];

    if (subscribers) {
      const index = subscribers.indexOf(callback);

      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    }
  };

  @action
  notify = (eventName: string, data: any) => {
    const subscribers = this.subscribers[eventName];

    if (subscribers) {
      subscribers.forEach(callback => callback(data));
    }
  }

  @action
  setSubscriptions = (subscriptions: Record<string, () => void>) => {
    this.subscriptions = subscriptions;
  };

  // Update for using ModifiedDate and web3 connection
  @observable portfolioUpdatesLastUpdated: ModifiedDate | null = null;

  @action
  connectWeb3Provider = (web3Provider: Web3Provider) => {
    web3Provider.connectWeb3Provider();
  };
}

export const subscriptionServiceInstance = new SubscriptionService();
export default SubscriptionService;


// example usage
subscriptionServiceInstance.setSubscriptions({
  snapshot: () => console.log('Snapshot callback executed'),
});

const subscription = subscriptionServiceInstance.subscriptions['snapshot'] ?? {
  callback: () => {},
  usage: '',
};


export { subscription };
