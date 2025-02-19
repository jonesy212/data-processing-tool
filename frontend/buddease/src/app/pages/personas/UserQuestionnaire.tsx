// UserQuestionnaire.tsx
import axios from 'axios';
import React from 'react';
import { Question } from '../onboarding/Question';
import QuestionnairePage from '../onboarding/QuestionnairePage';

interface UserQuestionnaireProps {
  onSubmit: (userResponses: any) => void;
  onComplete: (userResponses: any) => Promise<void>; // Change the return type to void
  onSubmitProfile: (profileData: any) => void // Add a new prop for submitting profile
  onIdeaSubmission: (ideaData: any) => void // Add a new prop for submitting ideas
}

const UserQuestionnaire: React.FC<UserQuestionnaireProps> = ({
  onSubmit,
  onComplete
}) => {
  const onboardingQuestionnaireData: {
    title: string;
    description: string;
    questions: Question[];
  } = {
    title: "User Questionnaire",
    description: "Please answer the following questions, so we can best know you and how we can assist and make your profile: ",
    questions: [
      // ... your existing questions
    ],
  };

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

      // Call the parent component's onSubmit function
      onSubmit(userResponses);

      // Call the parent component's onComplete function
      await onComplete(userResponses);
   
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('Error sending questionnaire responses:', error);
    }
  };

  return (
    <QuestionnairePage
      title={onboardingQuestionnaireData.title}
      description={onboardingQuestionnaireData.description}
      questions={onboardingQuestionnaireData.questions}
      onSubmit={handleQuestionnaireSubmit}
    />
  );
};

export default UserQuestionnaire;
