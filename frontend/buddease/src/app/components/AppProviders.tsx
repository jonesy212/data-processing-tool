// AppProviders.tsx
// components/AppProviders.tsx
'use client';
import React from 'react';
import { AuthProvider, AuthProviderProps } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { DatabaseProvider } from './DatabaseProvider';
// Import other providers as needed

interface AppProvidersProps {
  children: React.ReactNode;
  token?: string;
  dbStatus?: any;
  onUserDeletion?: (userId: string) => void; // Add this prop
}


export const AppProviders: React.FC<AppProvidersProps> = ({ 
  children, 
  token, 
  dbStatus,
  onUserDeletion
}) => {
  return (
    <ThemeProvider>
      <DatabaseProvider dbStatus={dbStatus}>
        <AuthProvider token={token} dbStatus={dbStatus}>
          {children}
        </AuthProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
};