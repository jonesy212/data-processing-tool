useServerFileSystem.ts
import { useAuthToken } from '@/core/hooks/useAuthToken';
import { ServerFileSystem } from '@/core/server/serverFileSystem';

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