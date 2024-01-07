// YourFormComponent.tsx
import useDynamicPromptPhaseHook from '@/app/components/hooks/phaseHooks/DynamicPromptPhaseHook';
import { useState } from 'react';

const YourFormComponent = ({ onSubmit }) => {
  const [userIdea, setUserIdea] = useState('');

  const handleUserIdeaSubmit = () => {
    onSubmit(userIdea);
    useDynamicPromptPhaseHook({ condition: () => true, asyncEffect: async () => {} });
  };

  return (
    <div>
      <label>User Idea:</label>
      <input
        type="text"
        value={userIdea}
        onChange={(e) => setUserIdea(e.target.value)}
      />
      <button onClick={handleUserIdeaSubmit}>Submit</button>
    </div>
  );
};

export default YourFormComponent;
