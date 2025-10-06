// useServerFileSystem.ts
import { useAuthToken } from '@/useAuthToken';
import { ServerFileSystem } from '@/serverFileSystem';

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