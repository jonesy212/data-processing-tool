import DynamicTextArea from '@/app/ts/DynamicTextArea';
import React, { useState } from 'react';

interface PromptOption {
  value: string;
  label: string;
}

interface Prompt {
  id: string;
  text: string;
  type: 'text' | 'multipleChoice';
  options?: PromptOption[];
}

interface PromptPageProps {
  title: string;
  description: string;
  prompts?: Prompt[]; // Optional prompts for static rendering
  onGeneratePrompts?: () => void; // Optional callback for dynamic prompts

}




const PromptPage: React.FC<PromptPageProps> = ({
  title,
  description,
  prompts,
  onGeneratePrompts,
}) => {
  const [state, setState] = useState<{ [key: string]: string }>({});
  const generatedPrompts: Prompt[] = prompts || [];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Add your form submission logic here
  };

  const handleDynamicTextAreaChange = (value: string, promptId: string) => {
    setState({
      ...state,
      [promptId]: value,
    });
    console.log('Updating state with value:', value);
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {onGeneratePrompts && <button onClick={onGeneratePrompts}>Generate Prompts</button>}
      <form onSubmit={handleSubmit}>
        {/* Map through prompts and render input fields */}
        {generatedPrompts.map((prompt) => (
          <div key={prompt.id}>
            <label>
              {prompt.text}
              {prompt.type === 'text' ? (
                <DynamicTextArea
                  name={prompt.id}
                  required
                  value={state[prompt.id] || ''}
                  onChange={(value) => handleDynamicTextAreaChange(value, prompt.id)}
                />
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
export type { Prompt, PromptOption, PromptPageProps };



