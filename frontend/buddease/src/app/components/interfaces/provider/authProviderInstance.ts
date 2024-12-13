// adapted  AuthProvider component into an authProvider object:

import { AuthProvider } from "@refinedev/core";
import { useAuthStore } from "../../state/stores/AuthStore";
import { useAuthorizationStore } from "../../state/stores/AuthorizationStore";
import { CheckResponse } from "node_modules/@refinedev/core/dist/contexts/auth/types";
import { Permission, UserPermissions } from "../../users/Permission";

interface CustomAuthProvider extends AuthProvider {
  // Method to set permissions (example)
  setPermissions: (permissions: Permission[]) => void;
  userPermissions: Permission[]
}

const authProvider: CustomAuthProvider  = {
  userPermissions: [],
  
  login: async ({ username, password }) => {
    // Example login logic using your existing store
    const store = useAuthStore();
    const authToken = await store.loginSuccess(username, password); // Implement this in your store
    if (authToken !== undefined) {
      return { success: true };
    } else {
      throw new Error('Login failed');
    }
  },
  
  logout: async () => {
    const store = useAuthStore();
    store.logout();
    return { success: true };
  },

  check: async (): Promise<CheckResponse> => {
    const store = useAuthStore();
    const isAuthenticated = store.isAuthenticated;
    if (isAuthenticated) {
      return { authenticated: true };
    } else {
      return { authenticated: false, error: new Error('Not authenticated') };
    }
  },

  onError: async (error:any) => {
    // Handle errors as needed
    return Promise.reject(error);
  },

  setPermissions(permissions: Permission[]) {
    this.userPermissions = permissions;
  },

  
  getPermissions: async () => {
    const store = useAuthStore();
    const permissions = await store.getUserPermissions(); // Implement this in your store
    return permissions;
  },
  
  getIdentity: async () => {
    const store = useAuthStore(); // Get an instance of AuthStore

    // Ensure that you first get the access token
    const token = store.getAccessToken();

    if (!token) {
      // Handle the case where the token is not available
      throw new Error('Access token is not available');
    }

    // If the token is available, then get the user
    const user = store.getUser();

    if (!user) {
      // Handle the case where the user is not available
      throw new Error('User is not available');
    }

    return user;
  },
};

export {authProvider}