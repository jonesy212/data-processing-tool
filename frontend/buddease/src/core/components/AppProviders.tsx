'use client';

import { AuthProvider } from '@/core/components/Provider'; // Import useAuth
import { DatabaseProvider } from '@/core/interfaces/provider/DatabaseProvider';
import { ThemeProvider } from '@/core/platform/styles/theme-provider';
import { useAuth } from '@/core/state/context/AuthContext';
import React from 'react';

interface AppProvidersProps {
  children: React.ReactNode;
  token?: string;
  dbStatus?: any;
  onUserDeletion?: (userId: string) => void;
}

// Inner component that has access to AuthContext
const AppProvidersInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Now this works because it's inside AuthProvider
  
  return (
    <ThemeProvider userRole={user?.role || 'user'}>
      {children}
    </ThemeProvider>
  );
};

export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  token,
  dbStatus,
}) => {
  return (
    // First wrap with AuthProvider so useAuth works
    <AuthProvider token={token} dbStatus={dbStatus}>
      {/* Then use the inner component that can access auth */}
      <AppProvidersInner>
        <DatabaseProvider dbStatus={dbStatus}>
          {children}
        </DatabaseProvider>
      </AppProvidersInner>
    </AuthProvider>
  );
};