// _app.tsx
import { Refine } from "@refinedev/core";
import { BytesLike, uuidV4 } from "ethers";
import { AppProps } from "next/app";
import React, { Component, useState } from "react";
import { AuthProvider } from "../components/auth/AuthContext";
import ConfirmationModal from "../components/communications/ConfirmationModal";
import EditorWithPrompt from "../components/documents/EditorWithPrompt";
import Toolbar from "../components/documents/Toolbar";
import { ThemeConfigProvider } from "../components/hooks/userInterface/ThemeConfigContext";
import ThemeCustomization from "../components/hooks/userInterface/ThemeCustomization";
import { Data } from "../components/models/data/Data";
import OnboardingComponent from "../components/onboarding/OnboardingComponent";
import { CustomPhaseHooks, Phase } from "../components/phases/Phase";
import undoLastAction from "../components/projects/projectManagement/ProjectManager";
import { DynamicPromptProvider } from "../components/prompts/DynamicPromptContext";
import { StoreProvider } from "../components/state/stores/StoreProvider";
import { Notification } from "../components/support/NofiticationsSlice";
import { NotificationProvider } from "../components/support/NotificationContext";
import NotificationManager, { NotificationManagerProps } from "../components/support/NotificationManager";
import { DocumentTree } from "../components/users/User";
import { generateUtilityFunctions } from "../generators/GenerateUtilityFunctions";
import generateAppTree, { AppTree } from "../generators/generateAppTree";
import CollaborationDashboard from "./dashboards/CollaborationDashboard";
import TreeView from "./dashboards/TreeView";
import ChartComponent from "./forms/ChartComponent";
import Layout from "./layouts/Layouts";
import SearchComponent from "./searchs/SearchComponent";




const phases: Phase[] = [
  {
    name: "Calendar Phase",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: ["Research", "Planning", "Design"],
    component: {} as (props: {}, context?: any) => React.ReactElement,
    hooks: {} as CustomPhaseHooks,
    data: {} as Data
  },
  // Add more phases
];

async function MyApp({ Component, pageProps }: AppProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>(phases[0]);
  const [progress, setProgress] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<
    "communication" | "documents" | "tasks" | "settings"
  >("communication");
  const token = 'your-token-value'; // Initialize the token here or get it from wherever it's stored


  // Define the 'addNotifications' function to add new notifications
  const addNotifications = (message: string, randomBytes: BytesLike) => {
    // Generate a unique ID for the new notification
    const id = uuidV4(randomBytes);

    // Create a new notification object
    const newNotification: Notification = {
      message,
      id,
      date: new Date(),
      createdAt: new Date(),
      type: "",
      content: ""
    };

    // Update notifications state by appending the new notification
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      newNotification,
    ]);
  };

  const handleButtonClick = () => {
    // Example: Update progress when a button is clicked
    setProgress((prevProgress) => prevProgress + 10); // Increase progress by 10%
  };

  interface Props {
    children: (props: { hooks: any; utilities: any }) => React.ReactNode;
    componentSpecificData: any[];
  }

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
    undoLastAction({}, utilities);

    // Additional actions...
  };

  const getNextPhase = (currentPhase: Phase): Phase => {
    // Add your logic to determine the next phase
    const currentIndex = phases.findIndex(
      (phase) => phase.name === currentPhase.name
    );
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex];
  };

  const advanceToNextPhase = () => {
    const nextPhase = getNextPhase(currentPhase);
    setCurrentPhase(nextPhase);
    console.log(`Advancing to the next phase: ${nextPhase.name}`);
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

  const appTree: AppTree | null = generateAppTree({} as DocumentTree); // Provide an empty DocumentTree or your actual data
  return (
    <Refine
      dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
      routerProvider={routerProvider}
      resources={[
        {
          name: "posts",
          list: "/posts",
          show: "/posts/show/:id",
        },
        {
          name: "categories",
          list: "/categories",
          show: "/categories/show/:id",
        },
      ]}
    >
      <SearchComponent {...pageProps}>
        {({ children, componentSpecificData }: Props) => (
          <ThemeConfigProvider>
            <ThemeCustomization />
            <CollaborationDashboard />
            <NotificationProvider>
              <DynamicPromptProvider>
                <AuthProvider token={token}>
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
                    {/* Generate appTree and render TreeView */}
                    {appTree && (
                      <TreeView
                        data={[appTree]}
                        onClick={(node) => {
                          // Handle node click if needed
                          console.log("Node clicked:", node);
                        }}
                      />
                    )}
                    <EditorWithPrompt
                      userId="user1"
                      teamId="team1"
                      project="project1"
                    />
                  </StoreProvider>
                </AuthProvider>
              </DynamicPromptProvider>
              <NotificationManager
                {...{} as Readonly<Component<NotificationManagerProps, {}, any>>}
              />
              {/* Toolbar component with activeDashboard and progress props */}
              <Toolbar activeDashboard={activeDashboard} progress={{ value: progress, label: "Progress" }} />
            </NotificationProvider>
          </ThemeConfigProvider>
        )}
        <ChartComponent {...pageProps} />

        <Layout>{Component && <Component {...pageProps} />}</Layout>
      </SearchComponent>
    </Refine>
  );
}

export default MyApp;
