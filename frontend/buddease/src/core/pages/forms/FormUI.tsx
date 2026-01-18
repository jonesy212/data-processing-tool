// FormUI.tsx
import { ComponentActions } from '@/core/actions/ComponentActions';
import CreateComponentForm from "@/core/libraries/ui/components/CreateComponentForm";
import React, { useState } from "react";

interface FormUIProps {
  onSubmit: (userIdea: string) => void;
  ComponentActions: typeof ComponentActions;
}

const FormUI: React.FC<FormUIProps> = ({ onSubmit, ComponentActions }) => {
  const [userIdea, setUserIdea] = useState("");

  const handleUserIdeaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserIdea(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(userIdea);
  };

  return (
    <div>
      <label>User Idea:</label>
      <CreateComponentForm ComponentActions={ComponentActions} />
      <input
        type="text"
        value={userIdea}
        onChange={handleUserIdeaChange}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default FormUI;
