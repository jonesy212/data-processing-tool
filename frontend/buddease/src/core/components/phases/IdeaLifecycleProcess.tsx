// IdeaLifecycleProcess.tsx
import { useState } from "react";

import * as IdeaLifecycleAPI from "@/core/api/IdeaLifecycleAPI";
import axiosInstance from '@/core/api/csrfToken';


import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { IdeaLifecyclePhase } from "@/core/models/phases/PhaseManager";
import IdeaValidation from "@/core/users/userJourney/IdeaValidation";
import ProofOfConcept from "@/core/users/userJourney/ProofOfConcept";

const IdeaLifecycleProcess: React.FC = () => {
  const { notify } = useNotification();
  const [currentPhase, setCurrentPhase] = useState<IdeaLifecyclePhase>(
    IdeaLifecyclePhase.CONCEPT_DEVELOPMENT
  );

  const [ideaData, setIdeaData] = useState<any>({
    // Initialize with default values or empty objects as needed
  });

  // Mapping of phase components to their respective phases
  const phaseComponents: Record<IdeaLifecyclePhase, React.ComponentType<any>> = {
    [IdeaLifecyclePhase.CONCEPT_DEVELOPMENT]: IdeaConceptDevelopment,
    [IdeaLifecyclePhase.IDEA_VALIDATION]: IdeaValidation,
    [IdeaLifecyclePhase.PROOF_OF_CONCEPT]: ProofOfConcept,
    // Add more phases as needed
  };

  // Function to handle submission of each phase
  const handlePhaseSubmit = (data: any, nextPhase: IdeaLifecyclePhase) => {
    setIdeaData({ ...ideaData, ...data });
    setCurrentPhase(nextPhase);
  };

  const handleConceptDevelopmentSubmit = (conceptData: any) => {
    setIdeaData({ ...ideaData, conceptData });
    setCurrentPhase(IdeaLifecyclePhase.IDEA_VALIDATION);
  };

  const handleIdeaValidationSubmit = (validationData: any) => {
    setIdeaData({ ...ideaData, validationData });
    setCurrentPhase(IdeaLifecyclePhase.PROOF_OF_CONCEPT);
  };

  const handleProofOfConceptSubmit = async () => {
    try {
      const response = await axiosInstance.post(
        "/api/idea-lifecycle-process",
        ideaData
      );
      console.log("Server response:", response.data);
      
      notify({
        id: `ideaCreationSuccess_${ideaData._id || Date.now()}`,
        message: "Idea has been successfully created",
        data: {
          entityId: ideaData._id || 'unknown',
          entityType: 'idea',
          extra: { 
            ideaData,
            response: response.data
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    } catch (error: any) {
      console.error("Error creating idea:", error);
      
      notify({
        id: `ideaCreationFailure_${ideaData._id || Date.now()}`,
        message: "Error creating idea",
        data: {
          originalError: error.message || 'Unknown error',
          entityId: ideaData._id || 'unknown',
          entityType: 'idea',
          extra: { 
            ideaData,
            error 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    }
  };

  const handleConfirmation = async (ideaData: any) => {
    try {
      // Example: Send confirmation request to the server using Axios
      const response = await IdeaLifecycleAPI.confirmIdeaCreation(ideaData);

      // Handle the server response if needed
      console.log("Server response:", response);

      // Notify user of successful idea confirmation
      notify({
        id: `ideaConfirmationSuccess_${ideaData._id || Date.now()}`,
        message: "Your idea has been successfully confirmed",
        data: {
          entityId: ideaData._id || 'unknown',
          entityType: 'idea',
          extra: { 
            ideaData,
            response 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });

      // Perform additional actions as needed, such as updating the UI or navigating to a different page
    } catch (error: any) {
      // Handle any network or unexpected errors
      console.error("Error confirming idea creation:", error);
      
      notify({
        id: `ideaConfirmationFailure_${ideaData._id || Date.now()}`,
        message: "There was an error confirming your idea, please try again",
        data: {
          originalError: error.message || 'Unknown error',
          entityId: ideaData._id || 'unknown',
          entityType: 'idea',
          extra: { 
            ideaData,
            error 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    }
  };

  const PhaseComponent = phaseComponents[currentPhase];

  return (
    <div>
      <PhaseComponent
        onSubmit={(data: any) => handlePhaseSubmit(data, currentPhase)}
        ideaData={ideaData}
        onConfirm={() => handleConfirmation(ideaData)}
      />

      {currentPhase === IdeaLifecyclePhase.CONCEPT_DEVELOPMENT && (
        <IdeaConceptDevelopment onSubmit={handleConceptDevelopmentSubmit} />
      )}
      {currentPhase === IdeaLifecyclePhase.IDEA_VALIDATION && (
        <IdeaValidation onSubmit={handleIdeaValidationSubmit} />
      )}
      {currentPhase === IdeaLifecyclePhase.PROOF_OF_CONCEPT && (
        <ProofOfConcept
          onSubmit={handleProofOfConceptSubmit}
          ideaData={ideaData}
          onConfirm={() => handleConfirmation(ideaData)}
        />
      )}
      {/* Add more phase conditions and components as needed */}
    </div>
  );
};

export default IdeaLifecycleProcess;