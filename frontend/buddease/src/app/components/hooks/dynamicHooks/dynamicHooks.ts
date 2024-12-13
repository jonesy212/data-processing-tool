// DynamicHooks.tsx
import { ModifiedDate } from '@/app/components/documents/DocType';
import { BaseData } from '@/app/components/models/data/Data';
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { performLogin } from "@/app/pages/forms/utils/CommonLoginLogic";
import { useEffect, useState } from "react";
import { loadDashboardState } from "../../dashboards/LoadDashboard";
import { generatePrompt } from "../../prompts/promptGenerator";
import useAqua from "../../web3/aquaIntegration/hooks/useAqua";
import useFluence from "../../web3/fluenceProtocoIntegration/src/fluence/useFuence";
import Web3Provider from '../../web3/Web3Provider';
import { myPhaseHook } from "../phaseHooks/EnhancePhase";
import useAsyncHookLinker, { LibraryAsyncHook } from "../useAsyncHookLinker";
import createDynamicHook from "./dynamicHookGenerator";

interface AsyncHook {
  condition: (idleTimeoutDuration: number) => Promise<boolean>;
  asyncEffect: ({
    idleTimeoutId,
    startIdleTimeout,
  }: {
    idleTimeoutId: any;
    startIdleTimeout: any;
  }) => Promise<() => void>;
  toggleActivation?: (active: boolean) => void;
}

const adaptAsyncHook = (asyncHook: AsyncHook): LibraryAsyncHook => ({
  enable: () => {}, // Placeholder function
  disable: () => {}, // Placeholder function
  condition: asyncHook.condition,
  asyncEffect: asyncHook.asyncEffect,
  idleTimeoutId: null,
  startIdleTimeout: function (
    timeoutDuration: number,
    onTimeout: () => void
  ): void {
    const timeoutId = setTimeout(() => {
      onTimeout();
    });
  },
});

const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

export const handleLogin = (username: string, password: string) => {
  performLogin(
    username,
    password,
    () => {
      console.log("Login successful!");
      loadDashboardState();
    },
    (error) => {
      console.error("Login failed:", error);
    }
  );
};

const createPlaceholderHook = () => ({
  resetIdleTimeout: async () => {},
  idleTimeoutId: null,
  startIdleTimeout: () => {},
  isActive: true,
});

const createUseEffectHook = (effectLogic: () => void) => {
  useEffect(() => {
    effectLogic();
  }, []);
};

const createCleanupPromiseHook = (cleanupLogic: () => void) => {
  let cleanupPromise: Promise<void> | null = null;
  useEffect(() => {
    cleanupPromise = new Promise<void>((resolve) => {
      const cleanupFunction = () => {
        cleanupLogic();
        resolve();
      };
      return cleanupFunction;
    });
  }, []);
  return () => cleanupPromise || Promise.resolve();
};

const authenticationHook = createDynamicHook({
  condition: async () => !!localStorage.getItem("token"),
  asyncEffect: async ({
    idleTimeoutId,
    startIdleTimeout,
  }: {
    idleTimeoutId: any;
    startIdleTimeout: any;
  }): Promise<() => void> => {
    try {
      await performLogin(
        username,
        password,
        () => {
          console.log("Login successful!");
          loadDashboardState();
        },
        (error) => {
          console.error("Login failed:", error);
        }
      );
    } catch (error) {
      console.error("Login failed:", error);
    }
    return () => {};
  },
  ...createPlaceholderHook(),
});

const jobSearchHook = createDynamicHook({
  condition: async () => true,
  asyncEffect: async () => {
    const effectLogic = () => console.log("useEffect triggered for JobSearch");
    createUseEffectHook(effectLogic);
    return effectLogic;
  },
  ...createPlaceholderHook(),
});

const recruiterDashboardHook = createDynamicHook({
  condition: async () => true,
  asyncEffect: async () => {
    const effectLogic = () =>
      console.log("useEffect triggered for RecruiterDashboard");
    createUseEffectHook(effectLogic);
    return effectLogic;
  },
  ...createPlaceholderHook(),
});

const chatDashboardHook = createDynamicHook({
  condition: async () => true,
  asyncEffect: async () => {
    const effectLogic = () =>
      console.log("useEffect triggered for ChatDashboard");
    createUseEffectHook(effectLogic);
    return effectLogic;
  },
  ...createPlaceholderHook(),
});

// Ensure useDynamicPrompt is utilized
const userProfileHook = createDynamicHook({
  condition: async () => true,
  asyncEffect: async () =>
    createCleanupPromiseHook(() =>
      console.log("useEffect cleanup for UserProfile")
    ),
  ...createPlaceholderHook(),
});

const useDynamicHookByName = (hookName: string) => {
  const hook = dynamicHooks[hookName]?.hook;
  return hook || null;
};

export const useDynamicPrompt = (userIdea: any) => {
  const [prompt, setPrompt] = useState<string | null>(null);
  useEffect(() => {
    const generatedPrompt = generatePrompt(userIdea);
    if (typeof generatedPrompt === "string") {
      setPrompt(generatedPrompt);
    } else {
      setPrompt(null);
    }
  }, [userIdea]);
  return prompt;
};

const fluenceHook = useFluence;
const aquaHook = useAqua;

const dynamicHooks: Record<string, { hook: AsyncHook }> = {
  authentication: { hook: authenticationHook as unknown as AsyncHook },

  jobSearch: { hook: jobSearchHook as unknown as AsyncHook },
  recruiterDashboard: { hook: recruiterDashboardHook as unknown as AsyncHook },
  chatDashboard: { hook: chatDashboardHook as unknown as AsyncHook },
  userProfile: { hook: userProfileHook as unknown as AsyncHook },
  fluence: { hook: fluenceHook as unknown as AsyncHook },
  aqua: { hook: aquaHook as unknown as AsyncHook },
  phase: { hook: myPhaseHook as unknown as AsyncHook },
};

// Define a caching mechanism, for example, using local storage
const cacheKey = "hookNamesCache";

// Function to retrieve hook names from cache
const getHookNamesFromCache = (): string[] | null => {
  const cachedHookNames = localStorage.getItem(cacheKey);
  return cachedHookNames ? JSON.parse(cachedHookNames) : null;
};

// Function to store hook names in cache
const storeHookNamesInCache = (hookNames: string[]): void => {
  localStorage.setItem(cacheKey, JSON.stringify(hookNames));
};

// Get hook names from cache or dynamically determine them if not found
const hookNames = getHookNamesFromCache() || Object.keys(dynamicHooks);

// Store hook names in cache for future use
storeHookNamesInCache(hookNames);

// Assuming you're using a specific hook somewhere in your code, for example:
const specificHook = jobSearchHook;

// Find the corresponding hook name dynamically
const foundHookName = Object.keys(dynamicHooks).find(
  (name) =>
    dynamicHooks[name as keyof typeof dynamicHooks].hook ===
    (specificHook as unknown as AsyncHook)
);

const hookName = foundHookName || "authentication"; // Default to 'authentication' if no matching hook name is found
const dynamicHookAdapter = adaptAsyncHook(useDynamicHookByName(hookName));

useAsyncHookLinker({
  hooks: [
    {
      enable: dynamicHookAdapter.enable,
      disable: dynamicHookAdapter.disable,
      condition: dynamicHookAdapter.condition,
      asyncEffect: async ({
        idleTimeoutId,
        startIdleTimeout,
      }: {
        idleTimeoutId: any;
        startIdleTimeout: any;
      }): Promise<() => void> => {
        await dynamicHookAdapter.asyncEffect!({
          idleTimeoutId: "idleTimeoutId",
          startIdleTimeout: "startIdleTimeout",
        });
        return () => {
          // Perform any cleanup or additional actions if needed
          console.log("Async effect completed");
        };
      },
      idleTimeoutId: null,
      startIdleTimeout: function (
        timeoutDuration: number,
        onTimeout: () => void
      ): void {
        const timeoutId = setTimeout(() => {
          onTimeout();
        });
      },
    },
  ],
});



const subscriptionServiceInstance = {
  subscriptions: new Map<string, { callback: (message: any) => void; usage: string }>(),
   // Add generic types <T, K> to the subscribers method
   subscribers<T extends  BaseData<any>,  K extends T = T,  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(name: string, id: string): SubscriberCollection<T, K> {
    // Return an empty array or , K extends the subscribers as a placeholder
    return [];
  },   
  subscribe:
    (hookName: string, callback: (message: any) => void, usage: string) => {
    const dynamicHook = dynamicHooks[hookName as keyof typeof dynamicHooks];
    if (dynamicHook) {
      if (
  
        dynamicHook.hook &&
        typeof dynamicHook.hook.asyncEffect === "function"
      ) {
        // Use hookName here as needed
        const dynamicHookAdapter = adaptAsyncHook(
          dynamicHooks[hookName as keyof typeof dynamicHooks].hook
        );
        useAsyncHookLinker({
          hooks: [
            {
              enable: dynamicHookAdapter.enable,
              disable: dynamicHookAdapter.disable,
              condition: dynamicHookAdapter.condition,
              asyncEffect: async ({
                idleTimeoutId,
                startIdleTimeout,
              }: {
                idleTimeoutId: any;
                startIdleTimeout: any;
              }): Promise<() => void> => {
                await dynamicHookAdapter.asyncEffect!({
                  idleTimeoutId: "",
                  startIdleTimeout: "",
                });
                return () => void {};
              },
              idleTimeoutId: null,
              startIdleTimeout: function (
                timeoutDuration: number,
                onTimeout: () => void
              ): void {
                const timeoutId = setTimeout(() => {
                  onTimeout();
                });
              },
            },
          ],
        });
      }
      // Return a default Subscription object if needed
      return {
        unsubscribe: () => {}, // Placeholder function
        portfolioUpdates: () => {}, // Placeholder function
        tradeExecutions: () => {}, // Placeholder function
        marketUpdates: () => {}, // Placeholder function
        communityEngagement: () => { }, // Placeholder function
        triggerIncentives: () => { }, // Placeholder function
        determineCategory: () => { }, // Placeholder function
        portfolioUpdatesLastUpdated: {} as ModifiedDate, // Placeholder function
      };
    }
    subscriptionServiceInstance.subscriptions.set(hookName, { callback, usage });
  },

  unsubscribe: (hookName: string, subscriptionUsage: string, callback: (data: any) => void) => {
    if (subscriptionServiceInstance.subscriptions.has(hookName)) {
      subscriptionServiceInstance.subscriptions.delete(hookName);
    }
  },

  unsubscribeAll: () => {
    subscriptionServiceInstance.subscriptions.clear();
  },

  connectWeb3Provider: (web3Provider: Web3Provider) => {
    web3Provider.connectWeb3Provider();
  },
};


// Update the `subscription` retrieval to ensure correct property access
const subscription = subscriptionServiceInstance.subscriptions.get('snapshot') ?? {
  callback: () => {},
  usage: '',
};


export { subscriptionServiceInstance };
export default dynamicHooks;
