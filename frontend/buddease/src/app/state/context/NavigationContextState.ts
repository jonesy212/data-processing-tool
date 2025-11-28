// NavigationContextState.ts

import { NavigationView } from "./NavigationContext"; // assuming NavigationView is defined
import { NavState, NavEvent } from "./NavigationContext"; // state machine types


/**
 * The state part of navigation context
 */
export interface NavigationContextState {
  currentPath: string;
  currentView?: NavigationView;
  machineState: NavState;

  // Step/phase-specific navigation
  currentStepId?: string;
  steps?: Step[];

  // Stacks for custom history management
  backStack: Array<{ path: string; view?: NavigationView }>;
  forwardStack: Array<{ path: string; view?: NavigationView }>;
}

/**
 * The methods/actions part of navigation context
 */
export interface NavigationContextMethods {
  // URL/path navigation
  navigateTo: (path: string, view?: NavigationView, replace?: boolean) => void;
  replace: (path: string, view?: NavigationView) => void;
  goBack: () => void;
  goForward: () => void;
  resetHistory: (startPath?: string, startView?: NavigationView) => void;
  pushToBackStack: (entry: { path: string; view?: NavigationView }) => void;
  clearForwardStack: () => void;

  // Step/phase-specific navigation
  goToStep: (stepId: string) => void;
  autoNavigate: (condition?: () => boolean) => void;
  autoNavigateForPhase: (phaseId: string) => void;
  autoNavigateForStep: (stepIndex: number, steps: Step[]) => void;
  autoNavigateForRole: (role: string) => void;

  // State-machine integration
  getState: () => string;
  sendEvent: (event: NavEvent) => void;
}




/**
 * The full context value type combining state + methods
 */
export interface NavigationContextValue extends NavigationContextState, NavigationContextMethods {}
