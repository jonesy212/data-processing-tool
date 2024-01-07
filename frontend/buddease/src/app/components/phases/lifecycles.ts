import { enhancedPhaseHook } from "../hooks/phaseHooks/EnhancePhase";
import { PhaseHookConfig } from "../hooks/phaseHooks/PhaseHooks";
import { CustomPhaseHooks, Phase } from "./Phase";
import { IdeaLifecyclePhase } from "./PhaseManager";

interface PhaseOptions {
  name: string;
  startDate: Date;
  endDate: Date;
  subPhases: string[];
}

// Define a function to generate a phase object
const generatePhase = (name: string, subPhases: string[]): Phase => {
  return {
    name,
    startDate: new Date(),
    endDate: new Date(),
    subPhases,
    component: IdeaLifecyclePhase,
    hooks: {
      canTransitionTo: (nextPhase: Phase) => {
        return !!enhancedPhaseHook.canTransitionTo(
          nextPhase as Phase & PhaseHookConfig
        );
      },
      handleTransitionTo: (nextPhase: Phase) => {
        console.log("Transitioning to", nextPhase);
        enhancedPhaseHook.handleTransitionTo(
          nextPhase as Phase & PhaseHookConfig
        );
        return true;
      },
      resetIdleTimeout: async () => {},
      isActive: false,
    } as CustomPhaseHooks,
  };
};

// Define an array of phases
const lifecyclePhases: Phase[] = [
  generatePhase("Idea Lifecycle", ["Idea", "Team Building", "Ideation"]),
  // Add more phases as needed using the generatePhase function
];

// Define an array of phases for the development app process
const generateGenericPhase = ({
  name,
  startDate,
  endDate,
  subPhases,
}: PhaseOptions): Phase => {
  return {
    name,
    startDate,
    endDate,
    subPhases,
    component: IdeaLifecyclePhase,
    hooks: {
      canTransitionTo: (nextPhase: Phase) => {
        return !!enhancedPhaseHook.canTransitionTo(
          nextPhase as Phase & PhaseHookConfig
        );
      },
      handleTransitionTo: (nextPhase: Phase) => {
        console.log("Transitioning to", nextPhase);
        enhancedPhaseHook.handleTransitionTo(
          nextPhase as Phase & PhaseHookConfig
        );
        return true;
      },
      resetIdleTimeout: async () => {},
      isActive: false,
    } as CustomPhaseHooks,
  };
};

// Define an array of phases for the development app process
export const genericLifecyclePhases: Phase[] = [
  generateGenericPhase({
    name: "App Planning",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: ["Idea Validation", "Feature Planning", "Timeline Setup"],
  }),
  generateGenericPhase({
    name: "Development",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: ["Coding", "Testing", "Debugging", "Deployment"],
  }),
  generateGenericPhase({
    name: "UX/UI Design",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: ["User Research", "Wireframing", "Prototyping", "Testing"],
  }),
  generateGenericPhase({
    name: "Post-Launch Activities",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: [
      "Data Analysis",
      "Refactoring/Rebranding",
      "Collaboration Settings",
    ],
  }),
  generateGenericPhase({
    name: "User Experience",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: ["User Testing", "Feedback Incorporation", "UI Refinement"],
  }),
  generateGenericPhase({
    name: "Maintenance",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: [
      "Bug Fixing",
      "Feature Enhancement",
      "Performance Optimization",
    ],
  }),
  generateGenericPhase({
    name: "End of Life",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: ["Deprecation", "Sunsetting", "Archival"],
  }),
];

// Rest of the code remains unchanged
