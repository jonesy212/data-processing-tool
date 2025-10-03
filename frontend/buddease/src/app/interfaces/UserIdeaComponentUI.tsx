// YourComponentUI.tsx
import React from 'react';


interface UserUserIdeaComponentUIProps {
    userIdea: string;
    setUserIdea: React.Dispatch<React.SetStateAction<string>>;
    handleUserIdeaSubmit: () => void;
}
  

const YourComponentUI: React.FC<UserUserIdeaComponentUIProps> = ({ userIdea, setUserIdea, handleUserIdeaSubmit }) => {
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

export default YourComponentUI;
