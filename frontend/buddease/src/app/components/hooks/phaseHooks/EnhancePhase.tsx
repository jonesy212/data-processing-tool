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
});

const enhancedPhaseHook = enhancePhaseHook({
  condition: () => true,
  asyncEffect: async () => {
    console.log("Async effect");
    return () => {};
  },
  name: "",
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

  handleTransitionTo: (nextPhaseConfig: PhaseHookConfig) => {
    enhancedPhaseHook.handleTransitionTo(nextPhaseConfig);
    PhaseManager.currentPhase = nextPhaseConfig;
  },
};
function setCurrentPhase(nextPhaseConfig: PhaseHookConfig) {
  PhaseManager.currentPhase = nextPhaseConfig;
}

export default enhancePhaseHook
export { canTransitionTo, enhancedPhaseHook, handleTransitionTo };

