import { Phase } from "./Phase";
import { IdeaLifecyclePhase } from "./PhaseManager";

// Define an array of phases
const lifecyclePhases: Phase[] = [
  {
    name: "Idea Lifecycle",
    startDate: new Date(), // Added missing startDate property
    endDate: new Date(), // Added missing startDate property
    subPhases: ["Idea", "Team Building", "Ideation"],
    component: IdeaLifecyclePhase,
    hooks: {
      canTransitionTo: (nextPhase: string) => {
        return true;
      },
      handleTransitionTo: (nextPhase: string) => {
        console.log("Transitioning to", nextPhase);
      },
    },
  },
  {
    name: "Project Execution",
    subPhases: ["Project Planning", "Task Management", "Launch"],
    component: IdeaLifecyclePhase,
    startDate: new Date(), // Added missing startDate property
    endDate: new Date(), // Added missing startDate property
    hooks: {
      canTransitionTo: (nextPhase: string) => {
        return true;
      },
      handleTransitionTo: (nextPhase: string) => {
        console.log("Transitioning to", nextPhase);
      },
    },
  },
  {
    name: "UX/UI Design",
    subPhases: ["User Research", "Wireframing", "Prototyping", "Testing"],
    component: IdeaLifecyclePhase,
    startDate: new Date(), // Added missing startDate property
    endDate: new Date(), // Added missing startDate property
    hooks: {
      canTransitionTo: (nextPhase: string) => {
        return true;
      },
      handleTransitionTo: (nextPhase: string) => {
        console.log("Transitioning to", nextPhase);
      },
    },
  },
  {
      name: "Development",
      subPhases: ["Planning", "Coding", "Testing", "Deployment"],
      component: IdeaLifecyclePhase,
      startDate: new Date(), // Added missing startDate property
      endDate: new Date(),

    hooks: {
      canTransitionTo: (nextPhase: string) => {
        return true;
      },
      handleTransitionTo: (nextPhase: string) => {
        console.log("Transitioning to", nextPhase);
      },
    },
  },

  {
    name: "Post-Launch Activities",
    subPhases: [
      "Data Analysis",
      "Refactoring/Rebranding",
      "Collaboration Settings",
    ],
    component: IdeaLifecyclePhase,
    startDate: new Date(), // Added missing startDate property
    endDate: new Date(), // Added missing startDate property
    hooks: {
      canTransitionTo: (nextPhase: string) => {
        return true;
      },
      handleTransitionTo: (nextPhase: string) => {
        console.log("Transitioning to", nextPhase);
      },
    },
  },
];

// Define an array of phases for the development app process
export const genericLifecyclePhases: Phase[] = [
  {
    name: "App Planning",
        startDate: new Date(),
        endDate: new Date(),

    subPhases: ["Idea Validation", "Feature Planning", "Timeline Setup"],
    component: IdeaLifecyclePhase,
    hooks: {
      canTransitionTo: (nextPhase: string) => {
        return true;
      },
      handleTransitionTo: (nextPhase: string) => {
        console.log("Transitioning to", nextPhase);
      },
    },
  },
  {
    name: "Development",
      startDate: new Date(),
      endDate: new Date(),

    subPhases: ["Coding", "Testing", "Debugging", "Deployment"],
    component: IdeaLifecyclePhase,
    hooks: {
      canTransitionTo: (nextPhase: string) => {
        return true;
      },
      handleTransitionTo: (nextPhase: string) => {
        console.log("Transitioning to", nextPhase);
      },
    },
  },
  {
    name: "User Experience",
    startDate: new Date(),
    endDate: new Date(),
    subPhases: ["User Testing", "Feedback Incorporation", "UI Refinement"],
    component: IdeaLifecyclePhase,
    hooks: {
      canTransitionTo: (nextPhase: string) => {
        return true;
      },
      handleTransitionTo: (nextPhase: string) => {
        console.log("Transitioning to", nextPhase);
      },
    },
  },
  // Add more development app phases as needed
];

// Example usage:
const selectedDevelopmentPhaseName = "Development";
// const selectedPhaseName = "Development";

const developmentSubPhases = getSubPhases(
  genericLifecyclePhases,
  selectedDevelopmentPhaseName
);

if (developmentSubPhases) {
  console.log(
    `Sub-phases of ${selectedDevelopmentPhaseName}:`,
    developmentSubPhases
  );
} else {
  console.log(`Phase "${selectedDevelopmentPhaseName}" not found.`);
}

// Function to get sub-phases based on the selected phase name
function getSubPhases(
  phases: Phase[],
  selectedPhaseName: string
): string[] | undefined {
  const selectedPhase = phases.find(
    (phase) => phase.name === selectedPhaseName
  );
  return selectedPhase?.subPhases;
}

// Example usage:
const selectedPhaseName = "Project Execution";
// const selectedPhaseName = "App Planning";

const subPhases = getSubPhases(genericLifecyclePhases, selectedPhaseName);

if (subPhases) {
  console.log(`Sub-phases of ${selectedPhaseName}:`, subPhases);
} else {
  console.log(`Phase "${selectedPhaseName}" not found.`);
}
