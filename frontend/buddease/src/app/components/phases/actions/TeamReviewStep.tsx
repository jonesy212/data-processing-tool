// TeamMembersStep.tsx
import React, { useState } from 'react';

const TeamMembersStep: React.FC<{ onSubmit: (members: any) => void }> = ({ onSubmit }) => {
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember(e.target.value);
  };

  const handleAddMember = () => {
    if (newMember.trim() !== '') {
      setMembers([...members, newMember]);
      setNewMember('');
    }
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = [...members];
    updatedMembers.splice(index, 1);
    setMembers(updatedMembers);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(members);
  };

  return (
    <div>
      <h2>Team Members</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="newMember">Add a new member:</label>
          <input
            type="text"
            id="newMember"
            value={newMember}
            onChange={handleInputChange}
            placeholder="Enter member name"
          />
          <button type="button" onClick={handleAddMember}>Add</button>
        </div>
        <ul>
          {members.map((member, index) => (
            <li key={index}>
              {member}
              <button type="button" onClick={() => handleRemoveMember(index)}>Remove</button>
            </li>
          ))}
        </ul>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default TeamMembersStep;
