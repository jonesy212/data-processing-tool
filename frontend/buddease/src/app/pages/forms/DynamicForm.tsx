import React, { useState } from "react";

import PromptComponent from "@/app/components/prompts/PromptComponent";
import DynamicComponent from "@/app/components/styling/DynamicComponents";
import UserFormComponent from "./UserFormComponent";
import TempUserData from "../onboarding/OnboardingPhase";
import { AppDevelopmentPhase } from "@/app/components/phases/AppDevelopmentPhase";



interface DynamicFormProps {
  onSubmit: (data: any) => void;
  setCurrentSubPhase: React.Dispatch<React.SetStateAction<AppDevelopmentPhase>>;
  userData: TempUserData;
}


const DynamicForm: React.FC<DynamicFormProps> = ({ onSubmit, setCurrentSubPhase, userData }) => {
  const [error, setError] = React.useState<string | null>(null); 
  const [formState, setFormState] = useState({
    currentPage: "YourForm", // Initial page
    userIdea: "", // User input that influences dynamic content
    // Other form-related state variables
  });

  const handleUserIdeaSubmit = (userIdea: string) => {
    setFormState({
      ...formState,
      userIdea,
      currentPage: "Prompt", // Transition to the next page (e.g., prompts)
    });
  };

  const handlePromptSubmit = () => {
    try {
      // Handle prompts and transition to the next page or update form state
  
      // For demonstration purposes, let's transition to DynamicComponent
      setFormState({
        ...formState,
        currentPage: "DynamicComponent",
      });
  
      // Log success message
      console.log("Prompt submitted successfully.");
    } catch (error) {
      // Handle errors gracefully
      console.error("Error occurred while submitting prompt:", error);
  
      // Optionally, display an error message to the user or perform other error-handling actions
      setError("An error occurred while submitting the prompt. Please try again.");
    }
  };
  

  const renderCurrentPage = () => {
    switch (formState.currentPage) {
      case "YourForm":
        return <UserFormComponent onSubmit={handleUserIdeaSubmit} />;
      case "Prompt":
        return (
          <PromptComponent
            userIdea={formState.userIdea}
            onNextPage={handlePromptSubmit}
            currentPage={{
              title: "",
              description: "",
              prompts: [],
              number: []
            }}
            onPreviousPage={function (): void {
              // Handle previous page transition
              setFormState({
                ...formState,
                currentPage: "YourForm",
                userIdea: "",
                // Other form-related state variables
              });
            }}
            title={""}
            description={""}
            prompts={[]}
          />
        );
      case "DynamicComponent":
        return (
          <DynamicComponent
            dynamicContent={true}
            title={"title"}
            content={"content"}
            // Other props based on dynamic content
          />
        );
      // Add more cases for additional form pages or components
      default:
        return null;
    }
  };

  return (
    <div>
      <h1>Dynamic Form</h1>
      {renderCurrentPage()}
      {/* Other UI elements */}
    </div>
  );
};

export default DynamicForm;
