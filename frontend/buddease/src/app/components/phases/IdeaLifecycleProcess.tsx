// IdeaLifecycleProcess.tsx
import { useState } from "react";

import IdeaValidation from "../users/userJourney/IdeaValidation";
import {
  NotificationTypeEnum,
  useNotification,
} from "../support/NotificationContext";
import * as IdeaLifecycleAPI from "./../../api/ApiIdeaLifecycle";
import { IdeaLifecyclePhase } from "./ideaPhase/IdeaLifecyclePhase";
import ProofOfConcept from "../users/userJourney/ProofOfConcept";
import axiosInstance from "../security/csrfToken";

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
      notify(
        "ideaCreationSuccess" + ideaData._id,
        "Idea has been successfully created",
        "success",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      console.error("Error creating idea:", error);
      notify(
        "ideaCreationFailure" + ideaData._id,
        "Error creating idea",
        "error",
        new Date(),
        NotificationTypeEnum.OperationError
      );
    }
  };

  const handleConfirmation = async (ideaData: any) => {
    try {
      // Example: Send confirmation request to the server using Axios
      const response = await IdeaLifecycleAPI.confirmIdeaCreation(ideaData);

      // Handle the server response if needed
      console.log("Server response:", response);

      // Notify user of successful idea confirmation
      notify(
        "ideaConfirmationSuccess" + ideaData._id,
        "Your idea has been successfully confirmed",
        "IdeaConfirmationSuccess",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );

      // Perform additional actions as needed, such as updating the UI or navigating to a different page
    } catch (error) {
      // Handle any network or unexpected errors
      console.error("Error confirming idea creation:", error);
      notify(
        "ideaConfirmationFailure" + ideaData._id,
        "There was an error confirming your idea, please try again",
        "IdeaConfirmationError",
        new Date(),
        NotificationTypeEnum.OperationError
      );
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
