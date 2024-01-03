import React from 'react';

export interface PromptOption {
  value: string;
  label: string;
}

export interface Prompt {
  id: string;
  text: string;
  type: 'text' | 'multipleChoice';
  options?: PromptOption[];
}

export interface PromptPageProps {
  title: string;
  description: string;
  prompts: Prompt[];
}

const PromptPage: React.FC<PromptPageProps> = ({ title, description, prompts }) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add your form submission logic here
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <form onSubmit={handleSubmit}>
        {/* Map through prompts and render input fields */}
        {prompts.map((prompt) => (
          <div key={prompt.id}>
            <label>
              {prompt.text}
              {prompt.type === 'text' ? (
                <textarea name={prompt.id} required />
              ) : prompt.type === 'multipleChoice' ? (
                <select name={prompt.id} required>
                  {prompt.options?.map((option) => (
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

export default {PromptPage};
