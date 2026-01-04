AuthenticationProvider.ts
interface AuthenticationProvider {
    name: string;
    type: string;
    connected: boolean;
    // Add other properties as needed
  }
  

  export type { AuthenticationProvider }