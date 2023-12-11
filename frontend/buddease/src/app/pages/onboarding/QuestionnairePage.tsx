import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multipleChoice';
  options?: Option[];
}

interface QuestionnairePageProps {
  title: string;
  description: string;
  questions: Question[];
}

const QuestionnairePage: React.FC<QuestionnairePageProps> = ({ title, description, questions }) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add your form submission logic here
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <form onSubmit={handleSubmit}>
        {/* Map through questions and render input fields */}
        {questions.map((question) => (
          <div key={question.id}>
            <label>
              {question.text}
              {question.type === 'text' ? (
                <input type="text" name={question.id} required />
              ) : question.type === 'multipleChoice' ? (
                <select name={question.id} required>
                  {question.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : null}
            </label>
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default QuestionnairePage;
