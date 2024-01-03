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
      loadDashboardState()

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
  condition: () => {
    const accessToken = localStorage.getItem("token");
    return !!accessToken;
  },
  asyncEffect: async () => {
    return useEffect(() => {
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
  },
});

// Job Search
const jobSearchHook = createDynamicHook({
  condition: () => true,
  asyncEffect: async () => {
    return useEffect(() => {
      console.log("useEffect triggered for JobSearch");
      return () => {
        console.log("useEffect cleanup for JobSearch");
      };
    }, []);
  },
});


// Recruiter Dashboard
const recruiterDashboardHook = createDynamicHook({
  condition: () => true,
  asyncEffect: async () => {
    return useEffect(() => {
      console.log("useEffect triggered for RecruiterDashboard");
      return () => {
        console.log("useEffect cleanup for RecruiterDashboard");
      };
    }, []);
  },
});

// Chat Dashboard
const chatDashboardHook = createDynamicHook({
  condition: () => true,
  asyncEffect: async () => {
    return useEffect(() => {
      console.log("useEffect triggered for ChatDashboard");
      return () => {
        console.log("useEffect cleanup for ChatDashboard");
      };
    }, []);
  },
});

// User Profile
const userProfileHook = createDynamicHook({
  condition: () => true,
  asyncEffect: async () =>
    useEffect(() => {
      console.log("useEffect triggered for UserProfile");
      return () => {
        console.log("useEffect cleanup for UserProfile");
      };
    }, []),
});



// Function to generate prompts based on user ideas
const generatePrompt = (userIdea: any) => {
  // Replace this logic with your actual prompt generation based on user ideas
  if (userIdea === 'web development') {
    return 'You are a professional in web development. You have the expertise and experiences to answer any questions.';
  } else {
    return null; // Handle other cases or return a default prompt
  }
};

// Hook to dynamically generate prompts based on user ideas
const useDynamicPrompt = (userIdea: any) => {
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

// Example usage:
const userIdea = 'web development'; // Replace with the actual user's idea
const generatedPrompt = useDynamicPrompt(userIdea);

if (generatedPrompt) {
  console.log(generatedPrompt);
} else {
  console.log('Prompt generation failed. Please provide a valid user idea.');
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

  subscribe: (hookName: string, callback: (message: any) => void) => { // Update the callback signature
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