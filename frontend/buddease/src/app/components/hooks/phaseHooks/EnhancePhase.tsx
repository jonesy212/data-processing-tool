import { useState } from "react";
import { ProjectPhaseTypeEnum } from "../../models/data/StatusType";
import useIdleTimeout from "../idleTimeoutHooks";
import usePhaseHooks, { PhaseHookConfig, createPhaseHook, idleTimeoutDuration } from "./PhaseHooks";

const enhancePhaseHook = (phaseHook: PhaseHookConfig) => {
  const [currentPhase, setCurrentPhase] = useState<PhaseHookConfig | null>(
    null
  );

  const canTransitionTo = async (nextPhase: PhaseHookConfig) => {
    if (!currentPhase) {
      return false; // Return false if currentPhase is not defined
    }
  
    const isCurrentPhaseAllowed = await currentPhase.condition(idleTimeoutDuration);
    const isNextPhaseAllowed = await nextPhase.condition(idleTimeoutDuration);
  
    const isNotAllowedSpecialTransition =
      currentPhase.name === "special" && nextPhase.name === "customspecial";
  
    return isCurrentPhaseAllowed && isNextPhaseAllowed && !isNotAllowedSpecialTransition;
  };
  

  const myPhaseHook = createPhaseHook(
    60000, // Provide a value for idleTimeoutDuration
    {
      condition: async () => true,
      asyncEffect: async () => {
        console.log("useEffect triggered");
        return () => {
          console.log("Cleanup");
        };
      },
      name: "",
      duration: "0",
      isActive: false,
      initialStartIdleTimeout: () => {},
      resetIdleTimeout: async () => {},
      idleTimeoutId: null,
      clearIdleTimeout: () => {},
      onPhaseStart: () => {},
      onPhaseEnd: () => {},
      startIdleTimeout: () => {},
      cleanup: undefined,
      startAnimation: () => {},
      stopAnimation: () => {},
      animateIn: () => {},
      toggleActivation: () => { },
      phaseType: ProjectPhaseTypeEnum.CreatePhase,
      customProp1: "value1",
      customProp2: 0,
    }
  );

  const handleTransitionTo = async (nextPhase: PhaseHookConfig) => {
    if (await canTransitionTo(nextPhase)) {
      const cleanup = await phaseHook.asyncEffect({
        idleTimeoutId: myPhaseHook.idleTimeoutId,
        startIdleTimeout: myPhaseHook.startIdleTimeout!,
      });
      if (typeof cleanup === "function") {
        cleanup();
      }

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

const myPhaseHook = createPhaseHook(
  idleTimeoutDuration,
  {
  condition: async () => true,
  asyncEffect: async () => {
    console.log("useEffect triggered");
    return () => {
      console.log("Cleanup");
    };
  },
  name: "",
  duration: "0",
  isActive: false,
  initialStartIdleTimeout: () => {},
  resetIdleTimeout: async () => {},
  idleTimeoutId: null,
  clearIdleTimeout: () => {},
  onPhaseStart: () => {},
  onPhaseEnd: () => {},
  startIdleTimeout: () => {},
  cleanup: undefined,
  startAnimation: () => {},
  stopAnimation: () => {},
  animateIn: () => {},
    toggleActivation: () => { },
    phaseType: ProjectPhaseTypeEnum.CreatePhase,
    customProp1: "value1",
    customProp2: 0,
});


// Ensure myPhaseHook is used somewhere to avoid the warning
console.log(myPhaseHook); // This line will prevent the warning

const enhancedPhaseHook = enhancePhaseHook({
  condition: async () => true,
  asyncEffect: async () => {
    console.log("Async effect");
    return () => {};
  },
  name: "",
  duration: "0",
  phaseType: ProjectPhaseTypeEnum.CreatePhase,
  customProp1: "value1",
  customProp2: 0,
  startIdleTimeout: useIdleTimeout({}).startIdleTimeout,
  
});

const nextPhaseConfig = {
  condition: () => true,
  asyncEffect: async () => {},
  name: "",
};

enhancedPhaseHook.handleTransitionTo({
  ...nextPhaseConfig,
  asyncEffect: async () => {
    return new Promise<() => void>((resolve) => {
      resolve(() => { });
    });
  },
  duration: "0",
  condition: async () => true,
  name: "Enhance",
  phaseType: ProjectPhaseTypeEnum.CreatePhase,
  customProp1: "value1",
  customProp2: 0,
  startIdleTimeout: function (timeoutDuration: number, onTimeout: () => void | undefined): void | undefined {
    throw new Error("Function not implemented.");
  }
});

const canTransitionTo = async (nextPhaseConfig: PhaseHookConfig) => {
  const isTransitionAllowed = await enhancedPhaseHook.canTransitionTo(
    nextPhaseConfig
  );

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

  nextPhaseConfig
    .asyncEffect({
      idleTimeoutId: enhancedPhaseHook.idleTimeoutId || null,
      startIdleTimeout: enhancedPhaseHook.startIdleTimeout || (() => {}),
    })
    .then((cleanup) => {
      if (typeof cleanup === "function") {
        cleanup();
      }Sna
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
  setPreviousPhase
};

