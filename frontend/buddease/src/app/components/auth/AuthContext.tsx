// AuthContext.tsx
import React, { createContext, useContext, useReducer } from "react";
import { User } from "../users/User";

// Define the types for the context and state
interface AuthState {
  id: string;
  user: User | null;
  userRoles: string[]; // New property for user roles
  timestamp: number;
  userNFTs: string[]; // New property for user NFTs
  authToken: string | null; // Add authToken property
  isAuthenticated: boolean;
  isLoading: boolean;
  
}

interface AuthContextProps {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  resetAuthState: () => void;
  loginWithRoles: (
    user: User,
    roles: string[],
    nfts: string[],
    authToken: string
  ) => void; // Update loginWithRoles method
  isAuthenticated: boolean; // Add isAuthenticated property
  isLoading: boolean; // Add isLoading property
  token: string | null;
  user?: User | null;
}

interface AuthAction {
  type: "LOGIN" | "LOGOUT" | "LOGIN_WITH_ROLES"; // New action type
  payload?: {
    user: User;
    roles?: string[];
    nfts?: string[];
    authToken: string;
  }; // Updated payload
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const initialState: AuthState = {
  id: "0",
  isAuthenticated: false,
  user: null,
  userRoles: [],
  timestamp: 0,
  userNFTs: [],
  authToken: null,
  isLoading: false
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        id: "0",
        isAuthenticated: true,
        user: action.payload?.user || null,
      };
    case "LOGOUT":
      return initialState;
    case "LOGIN_WITH_ROLES":
      return {
        ...state,
        id: "0",
        isAuthenticated: true,
        user: action.payload?.user || null,
        userRoles: action.payload?.roles || [],
        userNFTs: action.payload?.nfts || [],
      };
    default:
      return state;
  }
};

const AuthProvider: React.FC<{ children: React.ReactNode; token: string }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  // todo update 
  const token = "your-token-value"; // Sample token
  // Function to reset the auth state
  const resetAuthState = () => {
    dispatch({ type: "LOGOUT" });
  };

  // Function to login with roles
  const loginWithRoles = (
    user: User,
    roles: string[],
    nfts: string[],
    authToken: string
  ) => {
    // Verify user's NFTs and add corresponding roles
    const verifiedRoles = roles.filter((role) => {
      // Logic to check if user has the required NFT for each role
      return nfts.includes(role);
    });

    dispatch({
      type: "LOGIN_WITH_ROLES",
      payload: { user, roles: verifiedRoles, nfts, authToken }, // Update payload with verified roles and NFTs
    });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        resetAuthState,
        loginWithRoles,
        token,
        isAuthenticated: state.isAuthenticated, // Provide value from state
        isLoading: state.isLoading, // Provide value from state
      
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const fetchDataWithToken = async () => {
  try {
    const { state } = useAuth(); // Access the AuthContext to get the authentication token
    const authToken = state.authToken; // Get the authentication token from the context
    if (!authToken) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch("/api/data", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/vnd.yourapp.v1+json", // Example API version
      },
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
};

const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, fetchDataWithToken, useAuth };
