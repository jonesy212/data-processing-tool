// useServerFileSystem.ts
import { useAuthToken } from '@/app/hooks/useAuthToken';
import { ServerFileSystem } from '@/app/server/serverFileSystem';

export const useServerFileSystem = () => {
  const authToken = useAuthToken();
  
  const fileSystem = new ServerFileSystem();
  
  // Override getAuthToken for client-side usage
  const clientFileSystem = {
    ...fileSystem,
    getAuthToken: () => authToken || ''
  };
  
  return clientFileSystem;
};