// _app.tsx
import { Refine } from "@refinedev/core";
import { IDataContextProvider } from "@refinedev/core/dist/interfaces";
import { BytesLike, uuidV4 } from "ethers";
import { AppProps } from "next/app";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { Navigator, Routes } from "react-router-dom";

import {
  Link,
  Route,
  Router,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { AuthProvider } from "../components/auth/AuthContext";
import BlogComponent from "../components/blogs/BlogComponent";
import ConfirmationModal from "../components/communications/ConfirmationModal";
import { Lesson } from "../components/documents/CourseBuilder";
import EditorWithPrompt from "../components/documents/EditorWithPrompt";
import Toolbar from "../components/documents/Toolbar";
import ChildComponent from "../components/hooks/ChildComponent";
import { handleLogin } from "../components/hooks/dynamicHooks/dynamicHooks";
import { ThemeConfigProvider } from "../components/hooks/userInterface/ThemeConfigContext";
import ThemeCustomization from "../components/hooks/userInterface/ThemeCustomization";
import { LogData } from "../components/models/LogData";
import ContentItem from "../components/models/data/ContentItem";
import { Data } from "../components/models/data/Data";
import OnboardingComponent from "../components/onboarding/OnboardingComponent";
import { CustomPhaseHooks, Phase } from "../components/phases/Phase";
import undoLastAction from "../components/projects/projectManagement/ProjectManager";
import { DynamicPromptProvider } from "../components/prompts/DynamicPromptContext";
import { DetailsItem } from "../components/state/stores/DetailsListStore";
import { StoreProvider } from "../components/state/stores/StoreProvider";
import { NotificationData } from "../components/support/NofiticationsSlice";
import {
  NotificationProvider,
  NotificationType,
} from "../components/support/NotificationContext";
import NotificationManager from "../components/support/NotificationManager";
import { DocumentTree } from "../components/users/User";
import { ButtonGenerator } from "../generators/GenerateButtons";
import { generateUtilityFunctions } from "../generators/GenerateUtilityFunctions";
import generateAppTree, { AppTree } from "../generators/generateAppTree";
import CollaborationDashboard from "./dashboards/CollaborationDashboard";
import TreeView from "./dashboards/TreeView";
import ChangePasswordForm from "./forms/ChangePasswordForm";
import ChartComponent from "./forms/ChartComponent";
import ForgotPasswordForm from "./forms/ForgotPasswordForm";
import LoginForm from "./forms/LoginForm";
import RegisterForm from "./forms/RegisterForm";
import Layout from "./layouts/Layouts";
import PersonaTypeEnum from "./personas/PersonaBuilder";
import SearchComponent from "./searchs/SearchComponent";

const phases: Phase[] = [
  {
    name: "Calendar Phase",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: ["Research", "Planning", "Design"],
    component: {} as (props: {}, context?: any) => React.ReactElement,
    duration: 100,
    hooks: {} as CustomPhaseHooks,
    data: {} as Data,
    lessons: {} as Lesson[],
  },
  // Add more phases
];


const contentItem: DetailsItem<Data> = {
  id: '1',
  title: 'Sample Content',
  description: 'This is a sample content item.',
  /* Add other relevant details here */
};


async function MyApp({
  Component,
  pageProps,
  router,
  brandingSettings,
}: AppProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>(phases[0]);
  const [progress, setProgress] = useState(0);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<
    "communication" | "documents" | "tasks" | "settings"
  >("communication");
  const token = "your-token-value"; // Initialize the token here or get it from wherever it's stored
  const [username, setUsername] = useState<string>("defaultUsername");
  const [password, setPassword] = useState<string>("<PASSWORD>");
  // Define the 'addNotifications' function to add new notifications
  const addNotifications = (message: string, randomBytes: BytesLike) => {
    // Generate a unique ID for the new notification
    const id = uuidV4(randomBytes);

    // Create a new notification object
    const newNotification: NotificationData = {
      message,
      id,
      date: new Date(),
      createdAt: new Date(),
      type: {} as NotificationType,
      content: "",
      completionMessageLog: {} as LogData,
      status: undefined,
      sendStatus: "Sent"
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

  const personaType = PersonaTypeEnum.ProjectManager; // For example, assuming the persona type is ProjectManager

  const appTree: AppTree | null = generateAppTree({} as DocumentTree); // Provide an empty DocumentTree or your actual data
  return (
    <Refine
      dataProvider={{
        AuthProvider: AuthProvider,
        default: {} as IDataContextProvider,
      }}
      routerProvider={{
        basename: "",
        Link: Link,
        Router: Router,
        Route: Route,
        Routes: Routes,
        useParams: useParams,
        useLocation: useLocation,
        useNavigate: useNavigate,
        useSearchParams: useSearchParams,
      }}
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
                    <Router location={location} navigator={{} as Navigator}>
                      <Routes location={location}>
                        {" "}
                        {/* Routes to render only the first matching route */}
                        <Route path="/login">
                          <LoginForm
                            onSubmit={(username: string, password: string) =>
                              handleLogin(username, password)
                            }
                            setUsername={setUsername}
                            setPassword={setPassword}
                          />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </Route>
                        <Route path="/register">
                          <RegisterForm />
                        </Route>
                        <Route path="/forgot-password">
                          <ForgotPasswordForm />
                        </Route>
                        <Route path="/reset-password">
                          <ChangePasswordForm
                            onSuccess={() => {}}
                            onChangePassword={(
                              currentPassword: string,
                              newPassword: string
                            ): Promise<void> => {
                              // Perform password change logic here
                              return new Promise<void>((resolve, reject) => {
                                currentPassword = newPassword;
                                // Simulate password change operation
                                // For example, you can make an API call to change the password
                                // Replace the setTimeout with your actual password change logic
                                setTimeout(() => {
                                  // Resolve the Promise when the password change is successful
                                  resolve();
                                }, 1000); // Simulating a delay of 1 second
                              });
                            }}
                          />
                        </Route>
                        <Route path="/app">
                          <Layout>
                            <NotificationManager
                              notifications={notifications}
                              onConfirm={handleConfirm}
                              onCancel={handleCancel}
                              notify={addNotifications}
                              setNotifications={setNotifications}
                            />
                            <StoreProvider>
                              <Component
                                {...pageProps}
                                initialState={appTree}
                                utilities={utilities}
                                hooks={hooks}
                                phases={phases}
                                currentPhase={currentPhase}
                                setCurrentPhase={setCurrentPhase}
                                progress={progress}
                                setProgress={setProgress}
                                activeDashboard={activeDashboard}
                                setActiveDashboard={setActiveDashboard}
                                addNotifications={addNotifications}
                                componentSpecificData={componentSpecificData}
                                personaType={personaType}

                              />
                            </StoreProvider>
                          </Layout>
                        </Route>
                        <Route path="/blog">
                          <BlogComponent title="" content="" />
                        </Route>
                      </Routes>
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
                          searchQuery={""}
                        />
                      )}
                      <EditorWithPrompt
                        userId="user1"
                        teamId="team1"
                        project="project1"
                      />
                      {/* ButtonGenerator component with handleButtonClick */}
                      <ButtonGenerator
                        onSubmit={handleButtonClick}
                        onReset={handleButtonClick}
                        onCancel={handleButtonClick}
                        onLogicalAnd={handleButtonClick}
                        onLogicalOr={handleButtonClick}
                        onStartPhase={handleButtonClick}
                        onEndPhase={handleButtonClick}
                        onRoutesLayout={handleButtonClick}
                        onOpenDashboard={handleButtonClick}
                      />
                    </Router>
                  </StoreProvider>
                </AuthProvider>
              </DynamicPromptProvider>
              <NotificationManager
                notifications={notifications}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                notify={addNotifications}
                setNotifications={setNotifications}
              />
              {/* Toolbar component with activeDashboard and progress props */}
              <Toolbar
                activeDashboard={activeDashboard}
                progress={{ value: progress, label: "Progress" }}
              />
              <div>
                {/* Include router and brandingSettings in JSX */}
                <Component
                  {...pageProps}
                  router={router}
                  brandingSettings={brandingSettings}
                  personaType={personaType} /* Pass personaType down to Component */

                />
                {/* You can also pass them down to child components */}
                <ChildComponent
                  router={router}
                  brandingSettings={brandingSettings}
                />
              </div>
            </NotificationProvider>
          </ThemeConfigProvider>
        )}
        <ChartComponent {...pageProps} />

        <Layout>{Component && <Component {...pageProps} />}</Layout>
      </SearchComponent>
      <ContentItem item={contentItem} />

    </Refine>
  );
}

export default MyApp;
