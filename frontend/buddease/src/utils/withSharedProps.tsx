// withSharedProps.tsx

import { useStepContext } from "@/core/state/context/StepContext";
import React from "react";


export const withSharedProps = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const { sharedProps, setSharedProps, moveToNextStep, moveToPreviousStep, currentStep } = useStepContext();

    return (
      <WrappedComponent
        {...props}
        sharedProps={sharedProps}
        setSharedProps={setSharedProps}
        moveToNextStep={moveToNextStep}
        moveToPreviousStep={moveToPreviousStep}
        currentStep={currentStep}
      />
    );
  };
};
