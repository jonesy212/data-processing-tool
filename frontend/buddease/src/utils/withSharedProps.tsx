// withSharedProps.tsx

import React from "react";
import { useStepContext } from "./../../../app/context/StepContext";


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
