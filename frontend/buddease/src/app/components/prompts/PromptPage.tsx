import DynamicTextArea from "@/app/ts/DynamicTextArea";
import React, { useState } from "react";
import { Data } from "../models/data/Data";
import RootLayout from "@/app/RootLayout";

interface PromptOption {
  value: string;
  label: string;
}

interface Prompt {
  id: string;
  text: string;
  type: "text" | "multipleChoice";
  options?: PromptOption[];
}
interface PromptPageProps extends Partial<Data> {
  id?: any;
  title: string;
  description: string;
  prompts: {
    id: string;
    text: string;
    type: "text" | "multipleChoice";
  }[];
  onGeneratePrompts?: () => void;
  userIdea?: string;
  currentPage?: {
    title: string;
    description: string;
    prompts: string[];
    number: number;
    id: any;
  };
}

const PromptPage: React.FC<PromptPageProps> = ({
  prompts,
  currentPage,
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
    console.log("Updating state with value:", value);
  };

  return (
    <RootLayout>
      <div>
        <h2>Prompts</h2>

        <p>Title: {currentPage?.title}</p>
        <p>{currentPage?.description}</p>
        {onGeneratePrompts && (
          <button onClick={onGeneratePrompts}>Generate Prompts</button>
        )}
        <form onSubmit={handleSubmit}>
          {/* Map through prompts and render input fields */}
          {generatedPrompts.map((prompt) => (
            <div key={prompt.id}>
              <label>
                {prompt.text}
                {prompt.type === "text" ? (
                  <DynamicTextArea
                    name={prompt.id}
                    required
                    value={state[prompt.id] || ""}
                    onChange={(value) =>
                      handleDynamicTextAreaChange(value, prompt.id)
                    }
                  />
                ) : prompt.type === "multipleChoice" ? (
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
    </RootLayout>
  );
};

export default PromptPage;
export type { Prompt, PromptOption, PromptPageProps };
