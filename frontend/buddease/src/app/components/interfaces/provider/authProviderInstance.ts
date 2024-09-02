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
    const authToken = await store.login(username, password); // Implement this in your store
    if (authToken) {
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

  check: async (
    success: boolean
  ): Promise<CheckResponse> => {
    const store = useAuthStore();
    const isAuthenticated = store.isAuthenticated;
    if (isAuthenticated) {
      return { success: true };
    } else {
      throw new Error('Not authenticated');
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
    const store = useAuthStore();
    const user = store.getAccessToken.getUser(); // Implement this in your store
    return user;
  },
};

export {authProvider}