// AuthorizationStore.ts
import { makeAutoObservable } from 'mobx';

interface AuthorizationState {
  isAuthenticated: boolean;
  accessToken: string | null;
}

export class AuthorizationStore {
  isAuthenticated: boolean = false;
  accessToken: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  loginSuccess(accessToken: string) {
    this.isAuthenticated = true;
    this.accessToken = accessToken;
  }

  logout() {
    this.isAuthenticated = false;
    this.accessToken = null;
  }

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }
}

export const useAuthorizationStore = () => new AuthorizationStore();
export type { AuthorizationState };
