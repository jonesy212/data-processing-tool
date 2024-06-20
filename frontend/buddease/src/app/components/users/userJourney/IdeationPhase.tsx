import React, { useEffect } from "react";
import { StepProps } from "../../phases/steps/steps";

interface IdeaStepProps extends StepProps {
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onTransition: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const useIdeationPhase = ({ onSubmit, onTransition }: IdeaStepProps) => {
  useEffect(() => {
    // Add logic for the Idea phase
    console.log('Idea Phase Hook triggered');
    // Perform actions specific to the Idea phase

    return () => {
      // Cleanup logic for the Idea phase
      console.log('Cleanup for Idea Phase Hook');
    };
  }, []);

  // Example usage of onTransition
  const handleTransition = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Transition to the next phase");
    onTransition(event); // Call the provided onTransition method with event argument
  };

  return (
    <div>
      {/* Content specific to the Idea phase */}
      <button onClick={onSubmit}>Submit</button>
      <button onClick={handleTransition}>Next</button>
    </div>
  );
};

const useIdeaCreationPhase = ({ onSubmit, onTransition }: IdeaStepProps) => {
  useEffect(() => {
    // Add logic for the Idea Creation phase
    console.log('Idea Creation Phase Hook triggered');
    // Perform actions specific to the Idea Creation phase

    return () => {
      // Cleanup logic for the Idea Creation phase
      console.log('Cleanup for Idea Creation Phase Hook');
    };
  }, []);

  // Example usage of onTransition
  const handleTransition = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Transition to the next phase");
    onTransition(event); // Call the provided onTransition method to transition to the next step
  };

  return (
    <div>
      {/* Content specific to the Idea Creation phase */}
      <button onClick={onSubmit}>Submit</button>
      <button onClick={handleTransition}>Next</button>
    </div>
  );
};




const IdeationPhase = ({
  phaseName,
  onTransition,
  onSubmit
}: {
  phaseName: string;
    onTransition: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;

}) => {
  // Use the corresponding phase hook based on the phaseName
  switch (phaseName) {
    case "Idea":
      return useIdeationPhase({
        onSubmit: () => {},
        onTransition,
        title: "",
        content:{
          type: undefined,
          props: undefined,
          key: null
        },
      });
    case "IdeaCreation":
      return useIdeaCreationPhase({
        onSubmit: () => {},
        onTransition,
        title: "",
        content:{
          type: undefined,
          props: undefined,
          key: null
        },
      });
    case "ConceptDevelopment":
      return useIdeationPhase({
        onSubmit: () => {},
        onTransition,
        title: "",
        content:{
          type: undefined,
          props: undefined,
          key: null
        },
      });
    case "FurtherConceptDetails":
      // You can add another hook if needed
      break;
    // Add more cases for other phases as needed
    default:
      break;
  }

  return (
    <div>
      <h3>{phaseName} Phase</h3>
      {/* Render content specific to the Idea phase */}
      {phaseName === "Idea" && (
        <div>
          {/* Add components or content specific to the Idea phase */}
          <p>Content for the Idea phase</p>
        </div>
      )}
      {/* Render content specific to the Idea Creation phase */}
      {phaseName === "IdeaCreation" && (
        <div>
          {/* Add components or content specific to the Idea Creation phase */}
          <p>Content for the Idea Creation phase</p>
        </div>
      )}
      {/* Render content specific to the Ideation phase */}
      {phaseName === "ConceptDevelopment" && (
        <div>
          {/* Add components or content specific to the Concept Development sub-phase */}
          <p>Content for the Concept Development sub-phase</p>
        </div>
      )}
      {phaseName === "FurtherConceptDetails" && (
        <div>
          {/* Add components or content specific to the Further Concept Details sub-phase */}
          <p>Content for the Further Concept Details sub-phase</p>
        </div>
      )}
      {/* Add more conditional rendering for other sub-phases as needed */}
    </div>
  );
};
  
  export default IdeationPhase;
  export { useIdeaCreationPhase, useIdeationPhase };
  
  
  
  
  
  
  
  









