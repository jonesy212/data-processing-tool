BrowserCheckStore.ts
import BrowserBehaviorManager, { BrowserBehaviorConfig } from "@/core/state/BrowserBehaviorManager";
import { isBrowser } from "@/utils/isBrowser";
import { action, makeAutoObservable } from "mobx";

Define the state interface for better TypeScript support
interface BrowserCheckState {
  browserKey: string | null;
  isInitialized: boolean;
  browserFeatures: Record<string, any>;
  compatibility: {
    supported: boolean;
    warnings: string[];
    errors: string[];
    browser: string;
    mobile: boolean;
  };
  autoDismissEnabled: boolean;
  closableEnabled: boolean;
  usingSimulatedData: boolean;
  currentTheme?: any;
}

class BrowserCheckStore {
  // Simple state management like ToolbarStore
  state: BrowserCheckState = {
    browserKey: null,
    isInitialized: false,
    browserFeatures: {},
    compatibility: {
      supported: true,
      warnings: [],
      errors: [],
      browser: 'Unknown',
      mobile: false
    },
    autoDismissEnabled: false,
    closableEnabled: false,
    usingSimulatedData: false
  };

  browserBehaviorManager: BrowserBehaviorManager;

  constructor() {
    // Default browser config - similar to ToolbarStore's default state
    const defaultBrowserConfig: BrowserBehaviorConfig = {
      isAutoDismiss: true,
      isClosable: true,
      useSimulatedDataSource: process.env.NODE_ENV === 'test',
      browserSpecific: {
        isMobile: false,
        browserType: 'Unknown'
      }
    };

    this.browserBehaviorManager = new BrowserBehaviorManager(defaultBrowserConfig);
    
    makeAutoObservable(this, {
      // Define actions as observable actions - JUST LIKE TOOLBARSTORE
      init: action,
      setState: action,
      updateBrowserConfig: action,
      resetBrowserState: action,
      detectBrowserFeatures: action,
      validateBrowserCompatibility: action,
      applyBrowserBehavior: action,
      saveBrowserSnapshot: action,
    });
  }

  // ============ CORE METHODS (like ToolbarStore) ============

  /**
   * Initializes the BrowserCheckStore with the provided key.
   */
  init = (key: string) => {
    if (isBrowser()) {
      if (this.state.browserKey === null) {
        console.log(`Initializing BrowserCheckStore with key: ${key}`);
        
        this.setState({
          browserKey: key,
          isInitialized: true
        });

        // Auto-detect features on initialization
        this.detectBrowserFeatures();
        this.applyBrowserBehavior();
        
        console.log("Browser check store initialized successfully");
      } else {
        console.error(`BrowserCheckStore already initialized with key: ${this.state.browserKey}`);
      }
    } else {
      console.log("Not in a browser environment, skipping BrowserCheckStore initialization.");
    }
  }

  /**
   * Updates the state of the store - JUST LIKE TOOLBARSTORE
   */
  setState = (newState: Partial<BrowserCheckState>) => {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Updates the browser behavior configuration
   */
  updateBrowserConfig = (newConfig: Partial<BrowserBehaviorConfig>) => {
    const currentConfig = this.browserBehaviorManager.getConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    this.browserBehaviorManager = new BrowserBehaviorManager(updatedConfig);
    console.log("Browser configuration updated:", updatedConfig);
    
    // Re-apply behaviors with new config
    this.applyBrowserBehavior();
  }

  /**
   * Resets the browser state to initial values - LIKE TOOLBARSTORE's resetToolbarState
   */
  resetBrowserState = () => {
    console.log('Resetting browser state');
    this.state = {
      browserKey: null,
      isInitialized: false,
      browserFeatures: {},
      compatibility: {
        supported: true,
        warnings: [],
        errors: [],
        browser: 'Unknown',
        mobile: false
      },
      autoDismissEnabled: false,
      closableEnabled: false,
      usingSimulatedData: false
    };
  }

  /**
   * Detects and stores browser features and capabilities
   */
  detectBrowserFeatures = () => {
    if (!isBrowser()) return;

    const features = {
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      cookies: navigator.cookieEnabled,
      geolocation: 'geolocation' in navigator,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      serviceWorker: 'serviceWorker' in navigator,
      webGL: this.detectWebGL(),
      webRTC: this.detectWebRTC(),
    };

    this.setState({ browserFeatures: features });
    console.log('Browser features detected:', features);
  }

  /**
   * Validates browser compatibility with application requirements
   */
  validateBrowserCompatibility = () => {
    const browserType = this.browserBehaviorManager.getBrowserType();
    const isMobile = this.browserBehaviorManager.isMobile();
    
    const compatibility = {
      supported: true,
      warnings: [] as string[],
      errors: [] as string[],
      browser: browserType,
      mobile: isMobile
    };

    // Check for unsupported browsers
    if (browserType === 'Internet Explorer') {
      compatibility.supported = false;
      compatibility.errors.push('Internet Explorer is not supported. Please use a modern browser.');
    }

    // Check for minimum requirements
    if (!this.state.browserFeatures?.localStorage) {
      compatibility.errors.push('Local storage is required for this application.');
      compatibility.supported = false;
    }

    this.setState({ compatibility });
    return compatibility;
  }

  /**
   * Applies browser-specific behaviors and configurations
   */
  applyBrowserBehavior = () => {
    if (!isBrowser()) return;

    const behaviorMessage = this.browserBehaviorManager.getBrowserBehaviorMessage();
    console.log(behaviorMessage);

    // Apply behaviors based on configuration
    this.setState({
      autoDismissEnabled: this.browserBehaviorManager.isAutoDismissEnabled(),
      closableEnabled: this.browserBehaviorManager.isClosableEnabled(),
      usingSimulatedData: this.browserBehaviorManager.useSimulatedData()
    });

    this.browserBehaviorManager.applyBehavior();
  }

  /**
   * Saves a browser-specific snapshot (simplified version)
   */
  saveBrowserSnapshot = (data?: any) => {
    const snapshotData = {
      id: `browser-${this.state.browserKey}`,
      data: data || this.state,
      category: 'browser',
      isMobile: this.browserBehaviorManager.isMobile(),
      browserType: this.browserBehaviorManager.getBrowserType(),
      timestamp: new Date().toISOString()
    };

    console.log('Browser snapshot saved:', snapshotData);
    return snapshotData;
  }

  // ============ CONVENIENCE GETTERS ============

  get isAutoDismissEnabled(): boolean {
    return this.browserBehaviorManager.isAutoDismissEnabled();
  }

  get isClosableEnabled(): boolean {
    return this.browserBehaviorManager.isClosableEnabled();
  }

  get isUsingSimulatedData(): boolean {
    return this.browserBehaviorManager.useSimulatedData();
  }

  get browserBehaviorMessage(): string {
    return this.browserBehaviorManager.getBrowserBehaviorMessage();
  }

  // ============ PRIVATE HELPER METHODS ============

  private detectWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  }

  private detectWebRTC(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}

============ HOOK IMPLEMENTATION - EXACTLY LIKE TOOLBARSTORE ============

/**
 * Hook for using the BrowserCheckStore - EXACT PATTERN AS useToolbarStore
 */
export const useBrowserCheckStore = () => new BrowserCheckStore();

Export types
export type { BrowserBehaviorConfig, BrowserCheckState };
export default BrowserCheckStore;