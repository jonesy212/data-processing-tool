// UserJourneyPhase.tsx
import { useAuth } from "@/app/components/auth/AuthContext";
import EmailConfirmationPage from "@/app/components/communications/email/EmaiConfirmation";
import { User } from "@/app/components/todos/tasks/User";
import axios from "axios";
import React, { useState } from "react";
import OfferPage from "./OfferPage";
import UserQuestionnaire from "./UserQuestionnaire";
import WelcomePage from "./WelcomePage";
import questionnaireData from "./questionnaireData";


export enum UserJourneyPhase {
  SIGNUP,
  EMAIL_CONFIRMATION,
  WELCOME,
  QUESTIONNAIRE,
  OFFER,
}

const UserJourneyManager: React.FC = () => {
  const { state } = useAuth();
  const [currentPhase, setCurrentPhase] = useState<UserJourneyPhase>(
    UserJourneyPhase.SIGNUP
  );

  // Placeholder for user data
  interface UserData {
    datasets?: string;
    tasks?: string;
    questionnaireResponses?: any;
  }

  let userData: UserData = {
    ...(state.user as User)?.data,
    questionnaireResponses: {},
  };
    
  questionnaireData.forEach(question => {
    userData.questionnaireResponses[question.id] = "";
 });
   

  const handleQuestionnaireSubmit = async (userResponses: any) => {
    try {
      // Add logic to handle questionnaire submission

      // Example: Send responses to the server using Axios
      const response = await axios.post('/api/questionnaire-submit', {
        userResponses,
        // Include any other relevant data to send to the server
      });

      // Handle the server response if needed
      console.log('Server response:', response.data);

      // Example: Update user state locally
      // Assuming you have a state variable for user data
      userData = {
        ...userData,
        questionnaireResponses: userResponses,
        // Update other properties as needed
      };

      // Transition to the next phase (OFFER)
      setCurrentPhase(UserJourneyPhase.OFFER);
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error sending questionnaire responses:', error);
    }
  };

  return (
    <div>
      {currentPhase === UserJourneyPhase.EMAIL_CONFIRMATION && (
        <EmailConfirmationPage />
      )}
      {currentPhase === UserJourneyPhase.WELCOME && <WelcomePage />}
      {currentPhase === UserJourneyPhase.QUESTIONNAIRE && (
        <UserQuestionnaire onSubmit={handleQuestionnaireSubmit} />
      )}
      {currentPhase === UserJourneyPhase.OFFER && <OfferPage />}
      {/* Add more phases as needed */}
    </div>
  );
};

export default UserJourneyManager;
