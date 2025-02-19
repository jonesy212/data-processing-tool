import React from 'react';
import { setCurrentPhase } from '../../hooks/phaseHooks/EnhancePhase';
import { PhaseHookConfig } from '../../hooks/phaseHooks/PhaseHooks';
import { Phase, PhaseData, PhaseMeta  } from '../../phases/Phase';

export enum IdeaCreationPhaseEnum {
  CREATE_IDEA,
  REVIEW_IDEA,
  SUGGESTIONS,
  IDEATION 
}

interface IdeaFormProps {
  onSubmit: (idea: any) => void;
  onTransition: (idea: any) => void;
  duration: number
}

type PhaseConfig = PhaseHookConfig & Phase<PhaseData, PhaseMeta>;

const handlePhaseTransition = async (nextPhase: PhaseConfig) => {
  try {
    // Check if the phase can transition to the next phase
    if (nextPhase.canTransitionTo) {
      const canTransition = nextPhase.canTransitionTo(nextPhase); // Use nextPhase parameter
      if (canTransition) {
        console.log("Transitioning to the next phase:", nextPhase);
        
        // Call the hook to handle the transition
        if (nextPhase.handleTransitionTo) {
          await nextPhase.handleTransitionTo(nextPhase);
        }
        
        // Update the current phase
        setCurrentPhase(nextPhase);
        
        // Optional: Handle additional hooks
        if (nextPhase.onPhaseEnd) {
          nextPhase.onPhaseEnd();
        }
        if (nextPhase.onPhaseStart) {
          nextPhase.onPhaseStart();
        }
        if (nextPhase.startIdleTimeout) {
          nextPhase.startIdleTimeout(3000, () => console.log('Idle timeout triggered'));
        }
      } else {
        console.error("Cannot transition to the next phase:", nextPhase);
      }
    } else {
      console.error("No transition hook available for the next phase:", nextPhase);
    }
  } catch (error) {
    console.error("Error during phase transition:", error);
  }
};

const IdeaCreationPhaseManager: React.FC<IdeaFormProps> = ({ onSubmit, onTransition }) => {
  type Duration = number; // You can define a custom type for representing durations

  // Implementation logic for Idea Creation phase
  const handleSubmit = (idea: any) => {
    onSubmit(idea);
    // Assuming `nextPhase` is defined somewhere
    const nextPhase: PhaseHookConfig = {
      name: "Review Idea",
      condition: async (idleTimeoutDuration: Duration) => true,
      duration: '10',
      canTransitionTo: (nextPhase: Phase) => true,
      handleTransitionTo: async (nextPhase: Phase) => console.log("Handling transition to:", nextPhase),
      isActive: false,
      asyncEffect: async ({ idleTimeoutId, startIdleTimeout }) => {
        return () => {
          console.log("Clean up effect");
        };
      },
      startIdleTimeout: function (timeoutDuration: number, onTimeout: () => void | undefined): void | undefined {
        throw new Error('Function not implemented.');
      }
    };
    handlePhaseTransition(nextPhase as PhaseConfig);
  };

  return (
    <div>
      <h3>Idea Creation Phase</h3>
      {/* Add components or content specific to the Idea Creation phase */}
      <p>Content for the Idea Creation phase</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const idea = {}; // Collect your form data here
          handleSubmit(idea);
        }}
      >
        {/* Add your form fields here */}
        <button type="submit">Submit Idea</button>
      </form>
    </div>
  );
};

export default IdeaCreationPhaseManager;
