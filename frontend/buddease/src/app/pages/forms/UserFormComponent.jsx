import { useDynamicComponents } from "@/app/components/DynamicComponentsContext";
import useDynamicPromptPhaseHook from "@/app/components/hooks/phaseHooks/DynamicPromptPhaseHook";
import YourComponentUI from "@/app/components/interfaces/UserIdeaComponentUI";
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import { useEffect, useSession, useState } from "react";

const UserFormComponent = ({ onSubmit }) => {
  const [userIdea, setUserIdea] = useState("");
  const { updateDynamicConfig, setDynamicConfig } = useDynamicComponents();
  const { data: session } = useSession();
  const { notify } = useNotification();

  const handleError = (errorMessage) => {
    console.error(errorMessage); // Log the error
    notify(
      "form_error",
      "An error occurred",
      error.errorMessage,
      new Date(),
      NotificationTypeEnum.LoggingError
    ); // Notify about the error
  };

  const handleUserIdeaSubmit = async () => {
    try {
      // Fetch CSRF token from the server
      const response = await fetch("/api/csrf-token");
      const { csrfToken } = await response.json();

      // Include CSRF token in the form data
      const formData = new FormData();
      formData.append("csrfToken", csrfToken);
      formData.append("userIdea", userIdea);

      if (session) {
        // Include additional session data if needed
        formData.append("userId", session.user.id);
        formData.append("email", session.user.email);
        // Add more session data as needed
      }

      onSubmit(formData);
      useDynamicPromptPhaseHook({
        condition: () => true,
        asyncEffect: async () => {},
      });
    } catch (error) {
      handleError(error.message); // Handle and log the error
    }
  };

  useEffect(() => {
    // Example dynamic configuration
    updateDynamicConfig((prevConfig) => ({
      ...prevConfig,
      chart: {
        ...prevConfig.chart,
        title: "Updated Dynamic Chart Title",
      },
    }));

    // Example dynamic configuration using setDynamicConfig to replace the entire object
    setDynamicConfig({
      chart: {
        type: "bar",
        title: "Dynamic Chart",
        // Add other chart configuration options as needed
      },
    });
    // Log an analytics event for page view
    console.log("Logging page view for UserFormComponent");
  }, [setDynamicConfig, updateDynamicConfig, session]);

  return (
    <YourComponentUI
      userIdea={userIdea}
      setUserIdea={setUserIdea}
      handleUserIdeaSubmit={handleUserIdeaSubmit}
    />
  );
};

export default UserFormComponent;
