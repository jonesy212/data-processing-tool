// _app.tsx
import { AppProps } from "next/app";
import { AuthProvider } from "../components/auth/AuthContext";
import OnboardingComponent from "../components/onboarding/OnboardingComponent";
import { NotificationProvider } from "../components/support/NotificationContext";

import React, { useState } from "react";
import ConfirmationModal from "../components/communications/ConfirmationModal";
import { ThemeConfigProvider } from "../components/hooks/userInterface/ThemeConfigContext";
import ThemeCustomization from "../components/hooks/userInterface/ThemeCustomization";
import { DynamicPromptProvider } from "../components/prompts/DynamicPromptContext";
import { StoreProvider } from "../components/state/stores/StoreProvider";
import { generateUtilityFunctions } from "../generators/GenerateUtilityFunctions";
import CollaborationDashboard from "./dashboards/CollaborationDashboard";
import SearchComponent from "./searchs/Search";

function MyApp({ Component, pageProps }: AppProps) {
  interface Props {
    children: (props: { hooks: any; utilities: any }) => React.ReactNode;
    componentSpecificData: any[];
  }

  // Define your phases
  interface Phase {
    name: string;
  }

  const phases: Phase[] = [
    {
      name: "Calendar Phase",
    },
    // Add more phases
  ];

  // Generate hooks dynamically based on your phases
  const hooks: { [key: string]: Function } = {};
  phases.forEach((phase: Phase) => {
    hooks[phase.name] = () => {};
  });

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const utilities = generateUtilityFunctions();

  const handleConfirm = () => {
    console.log("Confirmed");
    setConfirmationOpen(false);

    // Implement your specific confirmation actions here
    // For example, you might want to perform some action upon confirmation
    // such as advancing to the next phase, marking a task as complete, etc.

    // Example: Advance to the next project phase
    advanceToNextPhase();

    // Example: Mark a task as complete
    markTaskAsComplete();

    // Additional actions...
  };

  const handleCancel = () => {
    console.log("Cancelled");
    setConfirmationOpen(false);

    // Implement your specific cancellation actions here
    // For example, you might want to handle a rollback, undoing an action, etc.

    // Example: Rollback to the previous project phase
    rollbackToPreviousPhase();

    // Example: Undo the last action
    undoLastAction();

    // Additional actions...
  };

  const advanceToNextPhase = () => {
    console.log("Advancing to the next project phase...");
    // Replace with your actual logic to move to the next phase
  };

  const markTaskAsComplete = () => {
    console.log("Marking task as complete...");
    // Replace with your actual logic to mark a task as complete
  };

  const rollbackToPreviousPhase = () => {
    console.log("Rolling back to the previous project phase...");
    // Replace with your actual logic to rollback to the previous phase
  };

  const undoLastAction = () => {
    console.log("Undoing the last action...");
    // Replace with your actual logic to undo the last action
  };

  return (
    <SearchComponent {...pageProps}>
      {({ children, componentSpecificData }: Props) => (
        <ThemeConfigProvider>
          <ThemeCustomization />
          <CollaborationDashboard />
          <NotificationProvider>
            <DynamicPromptProvider>
              <AuthProvider>
                <StoreProvider>
                  <OnboardingComponent />
                  {/* Use componentSpecificData wherever it's needed */}
                  {componentSpecificData.map((data, index) => (
                    <div key={index}>
                      {/* Your component logic here using data */}
                    </div>
                  ))}
                  {/* Pass hooks and utilities to children */}
                  {children({ hooks, utilities })}{" "}
                  {/* Render ConfirmationModal with appropriate props */}
                  <ConfirmationModal
                    isOpen={confirmationOpen}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                  />
                </StoreProvider>
              </AuthProvider>
            </DynamicPromptProvider>
          </NotificationProvider>
        </ThemeConfigProvider>
      )}
    </SearchComponent>
  );
}

export default MyApp;
