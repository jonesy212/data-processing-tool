import { action, observable } from 'mobx';

class SubscriptionService {
  @observable subscribers: Record<string, ((data: any) => void)[]> = {};

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
    this.subscribers = Object.entries(subscriptions).reduce<Record<string, (() => void)[]>>((acc, [key, value]) => {
      acc[key] = [value];
      return acc;
    }, {});
  };
}

export const subscriptionService = new SubscriptionService();
export default SubscriptionService;