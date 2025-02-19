// browserConfig.ts
import { BrowserBehaviorConfig } from "../components/state/BrowserBehaviorManager";
import { detectBrowserSpecific } from '@/app/components/state/detectBrowserSpecific'

// Use the utility function
const browserConfig: BrowserBehaviorConfig = {
    isAutoDismiss: true,
    isClosable: true,
    useSimulatedDataSource: false,
    browserSpecific: detectBrowserSpecific(),
  };

  const createBrowserBehaviorConfig = (): BrowserBehaviorConfig => {
    return {
      isAutoDismiss: true, // Example dynamic value
      isClosable: true, // Example dynamic value
      useSimulatedDataSource: false, // Example dynamic value
      browserSpecific: {
        isMobile: /Mobi|Android/i.test(navigator.userAgent), // Detect mobile environment
        browserType: navigator.userAgent.includes('Chrome')
          ? 'Chrome'
          : navigator.userAgent.includes('Firefox')
          ? 'Firefox'
          : 'Other',
      },
    };
  };
  

  export { browserConfig }
  // Example usage
  const currentBrowserConfig: BrowserBehaviorConfig = createBrowserBehaviorConfig();
  console.log(currentBrowserConfig);
  