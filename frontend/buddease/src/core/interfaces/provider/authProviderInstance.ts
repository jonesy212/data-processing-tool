authProviderInstance.ts
authProvidenceInstance.ts

import { AuthProvider } from "@/core/components/Provider";
import { Permission } from "@/core/permissions/Permission";
import { useAuthStore } from "@/core/state/stores/AuthStore";
import { useAuthorizationStore } from "@/core/state/stores/AuthorizationStore";

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
    const authorizationStore = useAuthorizationStore();
    
    const authToken = await store.loginSuccess(username, password);
    if (authToken !== undefined) {
      // Initialize permissions after successful login
      const userPermissions = await store.getUserPermissions();
      if (userPermissions) {
        authorizationStore.setPermissions(userPermissions);
        this.setPermissions(userPermissions);
      }
      return { success: true };
    } else {
      throw new Error('Login failed');
    }
  },
  
  logout: async () => {
    const store = useAuthStore();
    const authorizationStore = useAuthorizationStore();
    
    // Clear permissions on logout
    authorizationStore.clearPermissions();
    this.setPermissions([]);
    
    store.logout();
    return { success: true };
  },

  check: async () => {
    const store = useAuthStore();
    const authorizationStore = useAuthorizationStore();
    
    const isAuthenticated = store.isAuthenticated;
    if (isAuthenticated) {
      // Ensure permissions are loaded
      if (authorizationStore.permissions.length === 0) {
        const userPermissions = await store.getUserPermissions();
        if (userPermissions) {
          authorizationStore.setPermissions(userPermissions);
          this.setPermissions(userPermissions);
        }
      }
      return { authenticated: true };
    } else {
      return { authenticated: false, error: new Error('Not authenticated') };
    }
  },

  onError: async (error: any) => {
    const authorizationStore = useAuthorizationStore();
    
    // Handle authorization errors
    if (error.status === 403 || error.status === 401) {
      authorizationStore.clearPermissions();
      this.setPermissions([]);
    }
    
    return Promise.reject(error);
  },

  setPermissions(permissions: Permission[]) {
    this.userPermissions = permissions;
  },

  getPermissions: async () => {
    const authorizationStore = useAuthorizationStore();
    
    // Return permissions from authorization store if available
    if (authorizationStore.permissions.length > 0) {
      return authorizationStore.permissions;
    }
    
    // Fallback to auth store if authorization store is empty
    const store = useAuthStore();
    const permissions = await store.getUserPermissions();
    
    // Update authorization store with fetched permissions
    if (permissions) {
      authorizationStore.setPermissions(permissions);
    }
    
    return permissions;
  },
  
  getIdentity: async () => {
    const store = useAuthStore();
    const authorizationStore = useAuthorizationStore();

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

    // Ensure permissions are loaded for the user
    if (authorizationStore.permissions.length === 0) {
      const userPermissions = await store.getUserPermissions();
      if (userPermissions) {
        authorizationStore.setPermissions(userPermissions);
        this.setPermissions(userPermissions);
      }
    }

    return user;
  },
};

export { authProvider };
