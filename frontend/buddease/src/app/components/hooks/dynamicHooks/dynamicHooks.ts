// DynamicHooks.tsx
import { performLogin } from "@/app/pages/forms/utils/CommonLoginLogic";
import { useEffect, useState } from "react";
import { loadDashboardState } from "../../dashboards/LoadDashboard";
import useAqua from "../../web3/aquaIntegration/hooks/useAqua";
import useFluence from "../../web3/fluenceProtocoIntegration/src/fluence/useFuence";
import useAuthentication from "../useAuthentication";
import createDynamicHook from "./dynamicHookGenerator";

const handleLogin = () => {
  performLogin(
    "exampleUsername",
    "examplePassword",
    () => {
      // On successful login
      console.log("Login successful!");
      // Redirect or perform other actions
      loadDashboardState();
    },
    (error) => {
      // On login error
      console.error("Login failed:", error);
      // Display error message to the user or perform other error-handling actions
    }
  );
};

// Authentication
const authenticationHook = createDynamicHook({
  condition: async () => {
    const accessToken = localStorage.getItem("token");
    return !!accessToken;
  },
  asyncEffect: async (): Promise<() => void> => {
    useEffect(() => {
      console.log("useEffect triggered for Authentication");
      const user = useAuthentication();
      if (user.isLoggedIn) {
        handleLogin();
      } else {
        console.log("User not logged in, show login prompt");
      }

      return () => {
        console.log("useEffect cleanup for Authentication");
      };
    }, []);
    return async () => {};
  },
  resetIdleTimeout: () => {
    // add logic to reset idle timeout
  },
  isActive: true, // set hook to be active
});

// Job Search
const jobSearchHook = createDynamicHook({
  condition: async () => true,
  asyncEffect: async (): Promise<() => void> => {
    useEffect(() => {
      console.log("useEffect triggered for JobSearch");
      return () => {
        console.log("useEffect cleanup for JobSearch");
      };
    }, []);
    return async () => {};
  },
  resetIdleTimeout: () => {
    // add logic to reset idle timeout
  },
  isActive: true, // set hook to be active
});

// Recruiter Dashboard
const recruiterDashboardHook = createDynamicHook({
  condition: async () => true,
  asyncEffect: async (): Promise<() => void> => {
    useEffect(() => {
      console.log("useEffect triggered for RecruiterDashboard");
      return () => {
        console.log("useEffect cleanup for RecruiterDashboard");
      };
    }, []);
    // Return a cleanup function
    return async () => {};
  },
  resetIdleTimeout: () => {
    // add logic to reset idle timeout
  },
  isActive: true, // set hook to be active
});

// Chat Dashboard
const chatDashboardHook = createDynamicHook({
  condition: async () => true,
  asyncEffect: async (): Promise<() => void> => {
    useEffect(() => {
      console.log("useEffect triggered for ChatDashboard"), useFluence();
      useAqua();

      return () => {
        console.log("useEffect cleanup for ChatDashboard");
      };
    }, []);

    // Return a cleanup function
    return async () => {};
  },

  resetIdleTimeout: () => {
    // add logic to reset idle timeout
  },
  isActive: true,
});
// User Profile
const userProfileHook = createDynamicHook({
  condition: async () => true,
  asyncEffect: async (): Promise<() => void> => {
    // Create a promise that resolves when the cleanup function is called
    let cleanupPromise: Promise<void> | null = null;

    useEffect(() => {
      console.log("useEffect triggered for UserProfile");

      cleanupPromise = new Promise<void>((resolve) => {
        // Return the cleanup function
        const cleanupFunction = () => {
          console.log("useEffect cleanup for UserProfile");
          // Resolve the promise when the cleanup function is called
          resolve();
        };

        return cleanupFunction;
      });
    }, []);

    // Return a function that resolves the cleanup promise
    return () => cleanupPromise || Promise.resolve();
  },
  resetIdleTimeout: () => {
    // add logic to reset idle timeout
  },
  isActive: true, // set hook to be active
});



// Function to generate prompts based on user ideas
const generatePrompt = (userIdea: string, roles: string[]): string | null => {
  // Replace this logic with your actual prompt generation based on user ideas and roles
  if (userIdea === "web development") {
    const rolePrompt =
      roles.length > 0
        ? `You are a professional in web development with expertise in roles such as ${roles.join(
            ", "
          )}.`
        : "You are a professional in web development.";
    return `${rolePrompt} You have the skills and experiences to contribute effectively to a project, from conception to product launch. Your expertise can cover a wide range of areas, including ideation, team creation, product brainstorming, and more.`;
  } else {
    return null; // Handle other cases or return a default prompt
  }
};

// Hook to dynamically generate prompts based on user ideas
const useDynamicPrompt = (userIdea: any) => {
  const [prompt, setPrompt] = useState<string | null>(null);

  useEffect(() => {
    const generatedPrompt = generatePrompt(userIdea, []);
    if (typeof generatedPrompt === "string") {
      setPrompt(generatedPrompt);
    } else {
      setPrompt(null);
    }
  }, [userIdea]);

  return prompt;
};

// Example usage:
const userIdea = "web development"; // Replace with the actual user's idea
const generatedPrompt = useDynamicPrompt(userIdea);

if (generatedPrompt) {
  console.log(generatedPrompt);
} else {
  console.log("Prompt generation failed. Please provide a valid user idea.");
}

// Fluence
const fluenceHook = useFluence;

// Aqua
const aquaHook = useAqua;

const dynamicHooks = {
  authentication: { hook: authenticationHook },
  jobSearch: { hook: jobSearchHook },
  recruiterDashboard: { hook: recruiterDashboardHook },
  chatDashboard: { hook: chatDashboardHook },
  userProfile: { hook: userProfileHook },
  fluence: { hook: fluenceHook },
  aqua: { hook: aquaHook },
};

// Subscription service using dynamic hooks
// Subscription service using dynamic hooks
const subscriptionService = {
  subscriptions: new Map<string, (message: any) => void>(), // Modify the Map to accept a callback with a message parameter

  subscribe: (hookName: string, callback: (message: any) => void) => {
    // Update the callback signature
    const dynamicHook = dynamicHooks[hookName as keyof typeof dynamicHooks];
    if (dynamicHook) {
      dynamicHook.hook();
      subscriptionService.subscriptions.set(hookName, callback);
    } else {
      console.error(`Dynamic hook "${hookName}" not found.`);
    }
  },

  unsubscribe: (hookName: string) => {
    if (subscriptionService.subscriptions.has(hookName)) {
      subscriptionService.subscriptions.delete(hookName);
      // Additional cleanup logic if needed
    }
  },

  unsubscribeAll: () => {
    subscriptionService.subscriptions.clear();
    // Additional cleanup logic if needed
  },

  connectWeb3Provider: (web3Provider: Web3Provider) => {
    web3Provider.connectWeb3Provider();
  },
};

export { subscriptionService };
export default dynamicHooks;
