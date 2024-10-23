import ApiMethod from "./ApiCodeGenerator";

interface ApiCodeOptions {
  authenticationToken?: string; // Optional authentication token
  headers?: Record<string, string>; // Additional headers
  timeout?: number; // Request timeout in milliseconds
  baseUrl: string; // Base API URL if different from default
  endpoints: {
    [key: string]: string | Function; // Ensure values can be strings or functions
  };
  methods: ApiMethod[];

  // Add more options as needed
}

export default ApiCodeOptions;