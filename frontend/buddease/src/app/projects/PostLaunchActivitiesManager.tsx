// PostLaunchActivitiesManager.tsx
// PostLaunchActivitiesPhase.tsx
import CollaborationSettingsPhase from '@/app/components/phases/collaborationPhase/CollaborationSettingsPhase';
import React, { useState } from 'react';
import RefactoringRebrandingPhase from '@/app/projects/RefactoringRebrandingPhase';

export enum PostLaunchActivitiesPhase {
  REFACTORING_REBRANDING,
  COLLABORATION_SETTINGS,
}

const PostLaunchActivitiesManager: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<PostLaunchActivitiesPhase>(
    PostLaunchActivitiesPhase.REFACTORING_REBRANDING
  );

  const handlePhaseTransition = (nextPhase: PostLaunchActivitiesPhase) => {
    // Add logic for transitioning to the next phase
    setCurrentPhase(nextPhase);
  };

  return (
    <div>
      {currentPhase === PostLaunchActivitiesPhase.REFACTORING_REBRANDING && (
        <RefactoringRebrandingPhase />
      )}
      {currentPhase === PostLaunchActivitiesPhase.COLLABORATION_SETTINGS && (
        <CollaborationSettingsPhase />
      )}
      {/* Add more phases as needed */}
    </div>
  );
};

export default PostLaunchActivitiesManager;
[]