// DynamicHooks.tsx
import { performLogin } from "@/app/pages/forms/utils/CommonLoginLogic";
import { useEffect } from "react";
import createDynamicHook from "./DynamicHookGenerator";
import useAuthentication from "./UseAuthentication";

const handleLogin = () => {
  performLogin(
    "exampleUsername",
    "examplePassword",
    () => {
      // On successful login
      console.log("Login successful!");
      // Redirect or perform other actions
      
    },
    (error) => {
      // On login error
      console.error("Login failed:", error);
      // Display error message to the user or perform other error-handling actions
    }
  );
};

const dynamicHooks = {
  authentication: {
    hook: createDynamicHook({
      condition: () => {
        /* Your condition for activation */
        const accessToken = localStorage.getItem("token");
        if (accessToken === null) {
          return false;
        }
        return !!accessToken; // Returns true if access token is not null
      },
      asyncEffect: async () => {
        return useEffect(() => {
          let isMounted = true;

          // Your effect logic here
          console.log("useEffect triggered for Authentication");

          // Check if user is already logged in
          const user = useAuthentication();

          // If user is logged in, perform login
          if (user.isLoggedIn) {
            handleLogin();
          } else {
            // Show login prompt
            console.log("User not logged in, show login prompt");
          }

          return () => {
            // Cleanup logic here
            console.log("useEffect cleanup for Authentication");

            // Ensure to cancel or abort any ongoing network requests
            // (Note: Axios automatically cancels requests when the component unmounts)

            // Set the isMounted flag to false when the component unmounts
            isMounted = false;
          };
        }, []);
      },
    }),
    jobSearch: {
      hook: createDynamicHook({
        condition: () => {
          /* Your condition for activation */
          return true;
        },
        asyncEffect: async () => {
          return useEffect(() => {
            // Your effect logic here
            console.log("useEffect triggered for JobSearch");
            return () => {
              // Your cleanup logic here
              console.log("useEffect cleanup for JobSearch");
            };
          }, []);
        },
      }),
      // Add additional properties specific to the jobSearch dynamic hook
    },
    recruiterDashboard: {
      hook: createDynamicHook({
        condition: () => {
          /* Your condition for activation */
          return true;
        },
        asyncEffect: async () => {
          return useEffect(() => {
            // Your effect logic here
            console.log("useEffect triggered for RecruiterDashboard");
            return () => {
              // Your cleanup logic here
              console.log("useEffect cleanup for RecruiterDashboard");
            };
          }, []);
        },
      }),
      // Add additional properties specific to the recruiterDashboard dynamic hook
    },
  },
  userProfile: {
    hook: createDynamicHook({
      condition: () => {
        /* Your condition for activation */
        return true;
      },
      asyncEffect: async () =>
        useEffect(() => {
          // Your effect logic here
          console.log("useEffect triggered for UserProfile");
          return () => {
            // Your cleanup logic here
            console.log("useEffect cleanup for UserProfile");
          };
        }, []),
    }),
    // Add additional properties specific to the userProfile dynamic hook
  },
};

export default dynamicHooks;
