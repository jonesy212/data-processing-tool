// TeamMembersStep.tsx
import React, { useState } from 'react';

const TeamMembersStep: React.FC<{ onSubmit: (members: any) => void }> = ({ onSubmit }) => {
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember(e.target.value);
  };

  const handleAddMember = () => {
    if (newMember.trim() !== '') {
      setMembers([...members, newMember]);
      setNewMember('');
    }
  };

  const handleRemoveMember = (memberIndex: number) => {
    const updatedMembers = members.filter((_, index) => index !== memberIndex);
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
        <ul>
          {members.map((member, index) => (
            <li key={index}>
              {member}
              <button type="button" onClick={() => handleRemoveMember(index)}>Remove</button>
            </li>
          ))}
        </ul>
        <div>
          <input
            type="text"
            value={newMember}
            onChange={handleInputChange}
            placeholder="Enter member name"
          />
          <button type="button" onClick={handleAddMember}>Add Member</button>
        </div>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default TeamMembersStep;
