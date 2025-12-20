// ContentCreationPage.tsx

import AddContent from '@/app/models/content/AddContent';
import { ButtonGenerator, buttonGeneratorProps } from '@/app/generators/GenerateButtons';
import React from 'react';

interface ContentCreateionPageProps {
  onComplete: () => void;
}


// Enhanced version with content-specific lifecycle
const ContentCreationPage: React.FC<ContentCreationPageProps> = ({
  onComplete
}) => {
  // Use the hook with content creation specific lifecycle
  const { buttonProps, currentPhase, lifecycleManager } = useButtonGeneratorProps({
    phases: [
      {
        name: 'content-draft',
        subPhases: ['writing', 'editing'],
        hooks: {
          canTransitionTo: (targetPhase) => targetPhase.name === 'content-review',
          handleTransitionTo: (targetPhase) => console.log(`Moving content to ${targetPhase.name}`),
          condition: async () => false
        }
      },
      {
        name: 'content-review',
        subPhases: ['reviewing', 'approval'],
        hooks: {
          canTransitionTo: (targetPhase) => targetPhase.name === 'content-published',
          handleTransitionTo: (targetPhase) => console.log(`Content review complete`),
          condition: async () => false
        }
      },
      {
        name: 'content-published',
        subPhases: ['published'],
        hooks: {
          canTransitionTo: () => false,
          handleTransitionTo: () => console.log('Content published successfully'),
          condition: async () => false
        }
      }
    ],
    initialPhase: 'content-draft'
  });

  const handleAddContentComplete = () => {
    // Transition to review phase when content is added
    lifecycleManager.transitionTo('content-review');
    onComplete();
  }

  const contentCreationButtonProps = {
    ...buttonProps,
    onSubmit: () => {
      console.log("Submitting content for review");
      lifecycleManager.transitionTo('content-review');
    },
    label: {
      ...buttonProps.label,
      submit: "Submit for Review",
      cancel: "Save as Draft"
    }
  };

  return (
    <div>
      <h1>Content Creation Page</h1>
      <p>Current Phase: {currentPhase?.name}</p>
      <AddContent
        onComplete={handleAddContentComplete}
      />
      <ButtonGenerator {...contentCreationButtonProps} />
    </div>
  );
};