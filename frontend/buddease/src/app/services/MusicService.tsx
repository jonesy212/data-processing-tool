import { action, observable } from 'mobx';

class MusicService {
  @observable subscribers: Record<string, ((data: any) => void)[]> = {};

  @action
  subscribe = (eventName: string, callback: (data: any) => void, middleware?: () => void) => {
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }

    // Check if middleware function is provided
    if (middleware) {
      // Execute middleware function before adding the callback
      middleware();
    }

    this.subscribers[eventName].push(callback);
  }

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

  // Additional methods for music-related functionality can be added here
}

export const musicService = new MusicService();
