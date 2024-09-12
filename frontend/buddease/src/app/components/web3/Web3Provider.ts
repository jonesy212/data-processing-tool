class Web3Provider {
    private provider_url: string;
    private api_key: string | undefined;
    private timeout: number;
    private max_retries: number;
    private retry_delay: number;
    private with_credentials: boolean;
  
    constructor(
      provider_url: string,
      api_key: string | undefined = undefined,
      timeout: number = 10000,
      max_retries: number = 3,
      retry_delay: number = 1000,
      with_credentials: boolean = true
    ) {
      this.provider_url = provider_url;
      this.api_key = api_key;
      this.timeout = timeout;
      this.max_retries = max_retries;
      this.retry_delay = retry_delay;
      this.with_credentials = with_credentials;
    }
  
    getProviderUrl(): string {
      return this.provider_url;
    }
  
    getApiKey(): string | undefined {
      return this.api_key;
    }
  
    getTimeout(): number {
      return this.timeout;
    }
  
    getMaxRetries(): number {
      return this.max_retries;
    }
  
    getRetryDelay(): number {
      return this.retry_delay;
    }
  
    getWithCredentials(): boolean {
      return this.with_credentials;
    }
  
    // Add a method to connect to the web3 provider
    connectWeb3Provider() {
      // Implement your logic to connect to the web3 provider
      console.log("Connecting to web3 provider...");
    }
  }

  export default Web3Provider;
  
  // Example usage:
  const provider = new Web3Provider('https://example.com/web3', 'your-api-key', 5000);
  console.log(provider.getProviderUrl());
  console.log(provider.getApiKey());
  console.log(provider.getTimeout());
  console.log(provider.getMaxRetries());
  console.log(provider.getRetryDelay());
  console.log(provider.getWithCredentials());
  