// QuestionnairePage.tsx
import baseQuestionnaireData from '@/app/components/hooks/baseQuestionnaireData';
import generateDynamicQuestions from '@/app/components/hooks/dynamicHooks/dynamicQuestionGenerator';
import { UserData } from '@/app/components/users/User';
import React from 'react';
import { Question } from './Question'; // Adjust the import path as needed

interface QuestionnairePageProps {
  title: string;
  description: string;
  questions: Question[];
  onSubmit: (userResponses: any) => void;
}

const QuestionnairePage: React.FC<QuestionnairePageProps> = ({
  title,
  description,
  questions,
  onSubmit,
}) => {
  const [userResponses, setUserResponses] = React.useState<any>({});

  const handleQuestionResponse = (questionId: string, response: any) => {
    setUserResponses({
      ...userResponses,
      [questionId]: response,
    });
  };

  const handleQuestionnaireSubmit = () => {
    // Combine base questions with dynamically generated questions
    const allQuestions = baseQuestionnaireData.questions.concat(
      generateDynamicQuestions(userResponses)
    );

    // Call the onSubmit function with all questions
    onSubmit(allQuestions);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission

    // Collect user responses and call the onSubmit function
    const userResponses: UserData = {};

    questions.forEach((question) => {
      userResponses[question.id as keyof UserData] = handleQuestionResponse(
        question.id,
        ""
      );
    });

    onSubmit(userResponses);
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <form onSubmit={handleSubmit}>
        {questions.map((question) => (
          /* Render each question based on its type */
          /* Example: You may create a separate Question component for rendering each question */
          <div key={question.id}>
            <p>{question.text}</p>
            {/* Render input fields/options based on question type */}
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default QuestionnairePage;
