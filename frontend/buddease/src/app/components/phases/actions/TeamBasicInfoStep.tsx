// 
import React, { useState } from 'react';

const TeamBasicInfoStep: React.FC<{ onSubmit: (basicInfo: any) => void }> = ({ onSubmit }) => {
  const [basicInfo, setBasicInfo] = useState({
    teamName: '',
    teamDescription: '',
    teamLeader: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBasicInfo({ ...basicInfo, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(basicInfo);
  };

  return (
    <div>
      <h2>Team Basic Information</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="teamName">Team Name:</label>
          <input
            type="text"
            id="teamName"
            name="teamName"
            value={basicInfo.teamName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="teamDescription">Team Description:</label>
          <textarea
            id="teamDescription"
            name="teamDescription"
            value={basicInfo.teamDescription}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="teamLeader">Team Leader:</label>
          <input
            type="text"
            id="teamLeader"
            name="teamLeader"
            value={basicInfo.teamLeader}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default TeamBasicInfoStep;
