type BrowserBehaviorConfig = {
    isAutoDismiss: boolean;      // Determines if the UI auto-dismisses notifications or popups
    isClosable: boolean;         // Determines if the user can manually close the UI element
    useSimulatedDataSource: boolean; // Enables the use of a simulated data source for testing
    browserSpecific: {
      isMobile: boolean;         // Indicates if the current environment is mobile
      browserType: string;       // Specifies the browser type (e.g., 'Chrome', 'Firefox')
    };
  };
  
  
  class BrowserBehaviorManager {
  private config: BrowserBehaviorConfig;

  constructor(config: BrowserBehaviorConfig) {
    this.config = config;
  }

  // Determine if auto-dismiss is allowed based on config
  public isAutoDismissEnabled(): boolean {
    return this.config.isAutoDismiss && !this.config.browserSpecific.isMobile;
  }

  // Determine if UI can be manually closed based on config
  public isClosableEnabled(): boolean {
    return this.config.isClosable || this.config.browserSpecific.browserType === 'Chrome';
  }

  // Simulated data source handling for testing environments
  public useSimulatedData(): boolean {
    return this.config.useSimulatedDataSource || this.isTestingEnvironment();
  }

  // Simulate different behavior based on browser
  public getBrowserBehaviorMessage(): string {
    const { isMobile, browserType } = this.config.browserSpecific;

    if (isMobile) {
      return `Mobile view detected. Customizing UI for ${browserType}.`;
    } else {
      return `Desktop view detected. Running on ${browserType}.`;
    }
  }

  
  /**
   * Retrieves the current browser behavior configuration.
   * @returns {BrowserBehaviorConfig} The current configuration object.
   */
  public getConfig(): BrowserBehaviorConfig {
    return this.config;
  }

  /**
   * Determines if the current environment is a mobile device.
   * @returns {boolean} True if the device is mobile, false otherwise.
   */
  public isMobile(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }

  /**
   * Public method to retrieve the browser type.
   * It internally calls the private method to detect the browser type.
   * @returns {string} The type of the browser (e.g., 'Chrome', 'Safari', 'Firefox', etc.)
   */
  public getBrowserType(): string {
    return this.detectBrowserType(); // Reuse the private method
  }

  /**
   * Private method to detect the browser type based on the user agent string.
   * @returns {string} The type of the browser.
   */
  private detectBrowserType(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edge') === -1 && userAgent.indexOf('Opera') === -1) {
      return 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      return 'Safari';
    } else if (userAgent.indexOf('Firefox') > -1) {
      return 'Firefox';
    } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
      return 'Edge';
    } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
      return 'Opera';
    } else {
      return 'Unknown'; // If the browser cannot be identified, return 'Unknown'
    }
  }
    
  // Example of checking if we are in a testing environment (you can customize this)
  private isTestingEnvironment(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  // Execute logic based on configuration
  public applyBehavior(): void {
    if (this.isAutoDismissEnabled()) {
      console.log("Auto-dismiss enabled.");
      // Add auto-dismiss logic here (e.g., setTimeout to hide a notification)
    }

    if (this.isClosableEnabled()) {
      console.log("Closable enabled.");
      // Add closable logic here (e.g., add a close button to a modal)
    }

    if (this.useSimulatedData()) {
      console.log("Using simulated data source.");
      // Fetch or simulate data for testing
    }

    console.log(this.getBrowserBehaviorMessage());
  }
}

export default BrowserBehaviorManager
export type {  BrowserBehaviorConfig }