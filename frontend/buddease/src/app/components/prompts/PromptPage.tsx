// PromptPage.tsx
import React, { useState } from 'react';
import { Prompt, PromptPageProps } from './PromptComponent';
import { generatePrompt } from './promptGenerator';

const PromptPage: React.FC<PromptPageProps> =  ({ title, description }) => {
  const [generatedPrompts, setGeneratedPrompts] = useState<Prompt[]>([]);

  const handleGeneratePrompts = async () => {
    // Assuming you have a function like generatePrompt or AutoGPT to get prompts
  const generatedPrompts = generatePrompt(userIdea);

    // Process the AutoGPT output or other dynamic generation if needed

    // For demonstration purposes, use static prompts
    const staticGeneratedPrompts: Prompt[] = [
      { id: '3', text: 'What is your favorite color?', type: 'text' },
      { id: '4', text: 'Choose a pet:', type: 'multipleChoice', options: [
        { value: 'dog', label: 'Dog' },
        { value: 'cat', label: 'Cat' },
      ]},
    ];

    setGeneratedPrompts(staticGeneratedPrompts);
  }  
  ;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add your form submission logic here
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={handleGeneratePrompts}>Generate Prompts</button>
      <form onSubmit={handleSubmit}>
        {/* Map through prompts (either static or generated) and render input fields */}
        {generatedPrompts.map((prompt) => (
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

export default PromptPage;
