NavigationContext.ts
import { Step } from '@/core/hooks/useStepNavigation';
import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * NavigationView - extend with your app's views
 */
export type NavigationView =
  | "dashboard"
  | "projectManagement"
  | "socialMedia"
  | "project-explorer"
  | "communication"
  | "ideation"
  | "creation"
  | "launch"
  | "analysis"
  | "docs"
  | string;

// Define the context type
interface NavigationContextState {
  currentPath: string;
  currentView: NavigationView | undefined;
  machineState: NavState;
  backStack: Array<{ path: string; view?: NavigationView }>;
  forwardStack: Array<{ path: string; view?: NavigationView }>;
  currentStepId: string | undefined;
  steps: Step[];
  
  navigateTo: (path: string, view?: NavigationView, replace?: boolean) => void;
  replace: (path: string, view?: NavigationView) => void;
  goBack: () => void;
  goForward: () => void;
  resetHistory: (startPath?: string, startView?: NavigationView) => void;
  pushToBackStack: (entry: { path: string; view?: NavigationView }) => void;
  clearForwardStack: () => void;
  
  goToStep: (stepId: string) => void;
  autoNavigate: (condition?: () => boolean) => void;
  autoNavigateForPhase: (phaseId: string) => void;
  autoNavigateForStep: (stepIndex: number, stepList: Step[]) => void;
  autoNavigateForRole: (role: string) => void;
  
  getState: () => NavState;
  sendEvent: (event: NavEvent) => void;
}

// Alias for consistency (you had both NavigationContextState and NavigationContextValue)
type NavigationContextValue = NavigationContextState;

const NavigationContext = createContext<NavigationContextState | undefined>(undefined);

export const useNavigation = (): NavigationContextState => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
};

/**
 * Simple state machine for navigation modes
 */
type NavState = "idle" | "navigating" | "guided" | "voice";
type NavEvent =
  | { type: "NAV_START" }
  | { type: "NAV_END" }
  | { type: "ENTER_GUIDED" }
  | { type: "EXIT_GUIDED" }
  | { type: "ENTER_VOICE" }
  | { type: "EXIT_VOICE" };

function navStateMachine(state: NavState, event: NavEvent): NavState {
  switch (state) {
    case "idle":
      if (event.type === "NAV_START") return "navigating";
      if (event.type === "ENTER_GUIDED") return "guided";
      if (event.type === "ENTER_VOICE") return "voice";
      return "idle";
    case "navigating":
      if (event.type === "NAV_END") return "idle";
      if (event.type === "ENTER_GUIDED") return "guided";
      if (event.type === "ENTER_VOICE") return "voice";
      return "navigating";
    case "guided":
      if (event.type === "EXIT_GUIDED") return "idle";
      if (event.type === "NAV_START") return "navigating";
      return "guided";
    case "voice":
      if (event.type === "EXIT_VOICE") return "idle";
      if (event.type === "NAV_START") return "navigating";
      return "voice";
    default:
      return "idle";
  }
}

interface NavigationProviderProps {
  children: React.ReactNode;
  initialPath?: string;
  initialView?: NavigationView;
  initialSteps?: Step[];
}

/**
 * Provider that tracks custom back/forward stacks while delegating actual URL changes to react-router
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  initialPath = "/",
  initialView = "dashboard",
  initialSteps = [],
}) => {
  const routerNavigate = useNavigate();

  // --- State ---
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [currentView, setCurrentView] = useState<NavigationView | undefined>(initialView);
  const [currentStepId, setCurrentStepId] = useState<string | undefined>(
    initialSteps[0]?.id
  );
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [machineState, setMachineState] = useState<NavState>("idle");

  // --- Refs for stacks ---
  const backStack = useRef<Array<{ path: string; view?: NavigationView }>>([]);
  const forwardStack = useRef<Array<{ path: string; view?: NavigationView }>>([]);

  // --- State-machine ---
  const sendEvent = (event: NavEvent) => {
    setMachineState((prev) => navStateMachine(prev, event));
  };

  // --- Stack helpers ---
  const pushToBackStack = (entry: { path: string; view?: NavigationView }) => {
    backStack.current.push(entry);
  };
  const clearForwardStack = () => {
    forwardStack.current = [];
  };

  // --- Core navigation ---
  const navigateTo = (path: string, view?: NavigationView, replace = false) => {
    try {
      sendEvent({ type: "NAV_START" });

      if (!replace) {
        pushToBackStack({ path: currentPath, view: currentView });
        clearForwardStack();
      }

      if (replace) {
        routerNavigate(path, { replace: true });
      } else {
        routerNavigate(path);
      }

      setCurrentPath(path);
      if (view) setCurrentView(view);

      sendEvent({ type: "NAV_END" });
    } catch (err) {
      console.error("navigateTo error:", err);
      sendEvent({ type: "NAV_END" });
    }
  };

  const replace = (path: string, view?: NavigationView) => navigateTo(path, view, true);

  const goBack = () => {
    const prev = backStack.current.pop();
    if (prev) {
      forwardStack.current.push({ path: currentPath, view: currentView });
      routerNavigate(prev.path);
      setCurrentPath(prev.path);
      setCurrentView(prev.view);
    } else window.history.back();
  };

  const goForward = () => {
    const next = forwardStack.current.pop();
    if (next) {
      pushToBackStack({ path: currentPath, view: currentView });
      routerNavigate(next.path);
      setCurrentPath(next.path);
      setCurrentView(next.view);
    } else window.history.forward();
  };

  const resetHistory = (startPath = "/", startView?: NavigationView) => {
    backStack.current = [];
    forwardStack.current = [];
    routerNavigate(startPath, { replace: true });
    setCurrentPath(startPath);
    setCurrentView(startView);
  };

  // --- Step / phase navigation ---
  const goToStep = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;
    navigateTo(step.path ?? `/step/${step.id}`, step.id);
    setCurrentStepId(step.id);
  };

  const autoNavigate = (condition?: () => boolean) => {
    if (!condition || condition()) {
      const nextStep = steps.find((s) => s.id !== currentStepId);
      if (nextStep) goToStep(nextStep.id);
    }
  };

  const autoNavigateForPhase = (phaseId: string) => {
    navigateTo(`/phases/${phaseId}`, phaseId);
  };

  const autoNavigateForStep = (stepIndex: number, stepList: Step[]) => {
    const step = stepList[stepIndex];
    if (!step) return;
    navigateTo(step.path ?? `/step/${step.id}`, step.id);
    setCurrentStepId(step.id);
  };

  const autoNavigateForRole = (role: string) => {
    const path =
      role === "admin"
        ? "/admin"
        : role === "instructor"
        ? "/instructor/dashboard"
        : "/dashboard";
    navigateTo(path);
  };

  // --- Context value ---
  const contextValue: NavigationContextState = useMemo(
    () => ({
      currentPath,
      currentView,
      machineState,
      backStack: backStack.current,
      forwardStack: forwardStack.current,
      currentStepId,
      steps,

      navigateTo,
      replace,
      goBack,
      goForward,
      resetHistory,
      pushToBackStack,
      clearForwardStack,

      goToStep,
      autoNavigate,
      autoNavigateForPhase,
      autoNavigateForStep,
      autoNavigateForRole,

      getState: () => machineState,
      sendEvent,
    }),
    [
      currentPath,
      currentView,
      machineState,
      currentStepId,
      steps,
      backStack,
      forwardStack,
    ]
  );

  return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
};

export default NavigationContext;