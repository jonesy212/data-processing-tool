// YourFormComponent.tsx
import useDynamicPromptPhaseHook from "@/app/components/hooks/phaseHooks/DynamicPromptPhaseHook";
import { useDynamicComponents } from "path-to/DynamicComponentsContext"; // Update with the correct import path
import { useEffect, useSession, useState } from "react";

const YourFormComponent = ({ onSubmit }) => {
  const [userIdea, setUserIdea] = useState("");
  const { setDynamicConfig } = useDynamicComponents(); // Use the context hook
  const { data: session } = useSession();

  const handleUserIdeaSubmit = async () => {
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

    onSubmit(userIdea);
    useDynamicPromptPhaseHook({
      condition: () => true,
      asyncEffect: async () => {},
    });
  };

  // Submit the form with CSRF token, userIdea, and session data
  onSubmit(formData);

  useEffect(() => {
    // Example dynamic configuration
    setDynamicConfig({
      chart: {
        type: "bar",
        title: "Dynamic Chart",
        // Add other chart configuration options as needed
      },
    });
  }, [setDynamicConfig]);

  return (
    <div>
      <label>User Idea:</label>
      <input
        type="text"
        value={userIdea}
        onChange={(e) => setUserIdea(e.target.value)}
      />
      <button onClick={handleUserIdeaSubmit}>Submit</button>
    </div>
  );
};

export default YourFormComponent;
