import { enhancedPhaseHook } from "../hooks/phaseHooks/EnhancePhase";
import { PhaseHookConfig } from "../hooks/phaseHooks/PhaseHooks";
import { CustomPhaseHooks, Phase } from "./Phase";
import { IdeaLifecyclePhase } from "./PhaseManager";

interface PhaseOptions extends Phase {
  name: string;
  startDate: Date;
  endDate: Date;
  subPhases: string[];
}

// Define a function to generate a phase object
const generatePhase = (name: string, subPhases: string[]): PhaseOptions => {
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



// Common Functions
const generateGenericPhase = (name: string, subPhases: string[]): PhaseOptions => {
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


const lifecyclePhases: PhaseOptions[] = [
  generatePhase("Idea Lifecycle", ["Idea", "Team Building", "Ideation"]),
  // Add more phases as needed using the generatePhase function
  generateGenericPhase("UI Design", ["Wireframing", "Visual Design", "Prototyping", "User Testing"]),
];

const ideaLifecyclePhases: PhaseOptions[] = [
  { 
    name: "Idea Lifecycle",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: ["Idea", "Team Building", "Ideation"],
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
    }
   },
];


// Define Unique Phases
const appPlanningLifecyclePhases: PhaseOptions[] = [
  generateGenericPhase("App Planning", ["Idea Validation", "Feature Planning", "Timeline Setup"]),
  generateGenericPhase("Development", ["Coding", "Testing", "Debugging", "Deployment"]),
  generateGenericPhase("UX/UI Design", ["User Research", "Wireframing", "Prototyping", "Testing"]),
  generateGenericPhase("Post-Launch Activities", ["Data Analysis", "Refactoring/Rebranding", "Collaboration Settings"]),
  generateGenericPhase("User Experience", ["User Testing", "Feedback Incorporation", "UI Refinement"]),
  generateGenericPhase("Maintenance", ["Bug Fixing", "Feature Enhancement", "Performance Optimization"]),
  generateGenericPhase("End of Life", ["Deprecation", "Sunsetting", "Archival"]),
];

const genericLifecyclePhases: PhaseOptions[] = [
  ...appPlanningLifecyclePhases,
  generateGenericPhase("Maintenance", ["Bug Fixing", "Feature Enhancement", "Performance Optimization"]),
  generateGenericPhase("End of Life", ["Deprecation", "Sunsetting", "Archival"]),
];

const projectLifecycleManagementPhases: PhaseOptions[] = [
  generateGenericPhase("Team Formation", ["Recruitment", "Roles Assignment", "Onboarding"]),
  generateGenericPhase("Brainstorming", ["Idea Generation", "Concept Evaluation", "Feature Prioritization"]),
  generateGenericPhase("Prototyping", ["Mockups", "Interactive Prototypes", "User Feedback"]),
  generateGenericPhase("Development Sprint", ["Sprint Planning", "Coding", "Code Review", "Testing", "Demo"]),
  generateGenericPhase("Launch Preparation", ["Marketing Strategy", "User Training", "Pre-launch Testing"]),
  generateGenericPhase("User Feedback and Iteration", ["Feedback Collection", "Feature Enhancement", "Usability Testing"]),
  generateGenericPhase("Performance Analysis", ["Usage Metrics", "Performance Metrics", "User Satisfaction"]),
  generateGenericPhase("Continuous Improvement", ["Feedback Incorporation", "Feature Optimization", "Process Refinement"]),
  generateGenericPhase("Project Review and Documentation", ["Lessons Learned", "Documentation", "Report Generation"]),
];

// Final Array of All Phases
const allLifecyclePhases = [
  ...ideaLifecyclePhases,
  ...appPlanningLifecyclePhases,
  ...genericLifecyclePhases,
  ...projectLifecycleManagementPhases,
];


export {
  allLifecyclePhases,
  appPlanningLifecyclePhases,
  genericLifecyclePhases,
  ideaLifecyclePhases,
  projectLifecycleManagementPhases
};
// Rest of the code remains unchanged
