import { useState } from "react";
import usePhaseHooks, { PhaseHookConfig, createPhaseHook } from "./PhaseHooks";

const enhancePhaseHook = (phaseHook: PhaseHookConfig) => {
  const [currentPhase, setCurrentPhase] = useState<PhaseHookConfig | null>(
    null
  );

  const canTransitionTo = (nextPhase: PhaseHookConfig) => {
    const isAllowed =
      currentPhase &&
      currentPhase.condition() &&
      nextPhase.condition() &&
      !(currentPhase.name === "special" && nextPhase.name === "customspecial");

    return isAllowed;
  };

  const handleTransitionTo = (nextPhase: PhaseHookConfig) => {
    if (canTransitionTo(nextPhase)) {
      phaseHook.asyncEffect().then((cleanup) => {
        if (typeof cleanup === "function") {
          cleanup();
        }
      });

      setCurrentPhase(nextPhase);
    } else {
      console.warn(`Cannot transition from ${currentPhase} to ${nextPhase}`);
    }
  };

  usePhaseHooks(); // Use the usePhaseHooks here
  return {
    ...phaseHook,
    canTransitionTo,
    handleTransitionTo,
  };
};

const myPhaseHook = createPhaseHook({
  condition: () => true,
  asyncEffect: async () => {
    console.log("useEffect triggered");
    return () => {
      console.log("Cleanup");
    };
  },
  name: "",
  duration: 0,
});

// Ensure myPhaseHook is used somewhere to avoid the warning
console.log(myPhaseHook); // This line will prevent the warning

const enhancedPhaseHook = enhancePhaseHook({
  condition: () => true,
  asyncEffect: async () => {
    console.log("Async effect");
    return () => {};
  },
  name: "",
  duration: 0,
});

const nextPhaseConfig = {
  condition: () => true,
  asyncEffect: async () => {},
  name: "",
};

enhancedPhaseHook.handleTransitionTo({
  ...nextPhaseConfig,
  asyncEffect: async () => {
    return () => {};
  },
  duration: 0,
});

const canTransitionTo = async (nextPhaseConfig: PhaseHookConfig) => {
  const isTransitionAllowed =
    enhancedPhaseHook.canTransitionTo(nextPhaseConfig);

  if (isTransitionAllowed) {
    console.log("Transition is allowed. Performing additional logic...");
    return true;
  } else {
    console.warn("Transition is not allowed based on conditions.");
    return false;
  }
};

const handleTransitionTo = (nextPhaseConfig: PhaseHookConfig) => {
  console.log("Transitioning to next phase");

  nextPhaseConfig.asyncEffect().then((cleanup) => {
    if (typeof cleanup === "function") {
      cleanup();
    }
  });

  setCurrentPhase(nextPhaseConfig);
};

export const PhaseManager = {
  currentPhase: null as PhaseHookConfig | null,
  previousPhase: null as PhaseHookConfig | null,

  handleTransitionTo: (nextPhaseConfig: PhaseHookConfig) => {
    enhancedPhaseHook.handleTransitionTo(nextPhaseConfig);
    PhaseManager.currentPhase = nextPhaseConfig;
  },
  setPreviousPhase: (previousPhaseConfig: PhaseHookConfig) => {
    PhaseManager.previousPhase = previousPhaseConfig;
  },
};
function setCurrentPhase(nextPhaseConfig: PhaseHookConfig) {
  PhaseManager.currentPhase = nextPhaseConfig;
}

function setPreviousPhase(nextPhaseConfig: PhaseHookConfig) {
  PhaseManager.previousPhase = nextPhaseConfig;
}

export default enhancePhaseHook;
export {
  canTransitionTo,
  enhancedPhaseHook,
  handleTransitionTo,
  myPhaseHook,
  setCurrentPhase,
  setPreviousPhase,
};
