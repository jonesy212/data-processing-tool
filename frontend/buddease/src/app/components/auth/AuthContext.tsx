// AuthContext.tsx
import React, { createContext, useContext, useReducer } from 'react';
import { User } from '../users/User';

// Define the types for the context and state
interface AuthState {
  id: string;
  isAuthenticated: boolean;
  user: User | null;
  userRoles: string[]; // New property for user roles
}

interface AuthContextProps {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  resetAuthState: () => void;
  loginWithRoles: (user: User, roles: string[]) => void; 
  token: string | null;
}

interface AuthAction {
  type: 'LOGIN' | 'LOGOUT' | 'LOGIN_WITH_ROLES'; // New action type
  payload?: { user: User; roles?: string[] }; // Updated payload
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const initialState: AuthState = {
  id: '0',
  isAuthenticated: false,
  user: null,
  userRoles: [], // Initial empty array for user roles
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, id: '0', isAuthenticated: true, user: action.payload?.user || null };
    case 'LOGOUT':
      return initialState;
    case 'LOGIN_WITH_ROLES':
      return { ...state, id: '0', isAuthenticated: true, user: action.payload?.user || null, userRoles: action.payload?.roles || [] };
    default:
      return state;
  }
};

const AuthProvider: React.FC<{ children: React.ReactNode, token: string }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const token = 'your-token-value'; // Sample token
  // Function to reset the auth state
  const resetAuthState = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Function to login with roles
  const loginWithRoles = (user: User, roles: string[]) => {
    dispatch({ type: 'LOGIN_WITH_ROLES', payload: { user, roles } });
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, resetAuthState, loginWithRoles, token }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
