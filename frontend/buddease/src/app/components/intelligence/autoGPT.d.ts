// src/ts/autoGPT.d.ts

declare module 'AutoGPT' {
    // Custom types related to AutoGPT
  
    // Example 1: AutoGPT Prompt Configuration
    interface AutoGPTPromptConfig {
      prompt: string;
      maxTokens?: number;
      temperature?: number;
    }
  
    // Example 2: AutoGPT Response
    interface AutoGPTResponse {
      generatedText: string;
      confidence: number;
    }
  
    // Example 3: AutoGPT Service Interface
    interface AutoGPTService {
      generatePrompt(promptConfig: AutoGPTPromptConfig): Promise<AutoGPTResponse>;
    }
  
    // Example 4: AutoGPT Store
    interface AutoGPTStore {
      autoGPTResponse: AutoGPTResponse | null;
      generatePrompt: (config: AutoGPTPromptConfig) => Promise<void>;
    }
  
    // Example 5: AutoGPT Actions
    interface AutoGPTActions {
      fetchAutoGPTResponse: (config: AutoGPTPromptConfig) => Promise<void>;
    }
  
    // Example 6: AutoGPT Reducer
    interface AutoGPTReducer {
      autoGPTResponse: AutoGPTResponse | null;
    }
  
    // Example 7: Fluent Interface
    interface FluentInterface {
      chainableMethod(): FluentInterface;
      anotherMethod(): FluentInterface;
      getResult(): any;
    }
  
    // Example 8: Aqua Interface
    interface AquaInterface {
      aquaMethod(): void;
    }
  
    // Example 9: Aqua Store
    interface AquaStore {
      aquaData: any;
    }
  
    // Example 10: Aqua Actions
    interface AquaActions {
      fetchAquaData: () => Promise<void>;
    }
  
    // Extend the existing declarations or add new ones as needed
  
    // ...
  
    // Export the main module content
    export {
        AquaActions, AquaInterface,
        AquaStore, AutoGPTActions, AutoGPTPromptConfig, AutoGPTReducer, AutoGPTResponse,
        AutoGPTService,
        AutoGPTStore, FluentInterface
    };
  }
  