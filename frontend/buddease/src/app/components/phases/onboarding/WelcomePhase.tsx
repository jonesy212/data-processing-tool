// WelcomePhase.tsx
import React, { useState } from 'react';
import DynamicNamingConventions from '@/app/components/DynamicNamingConventions';

const WelcomePhase: React.FC<{ onNextPhase: () => void }> = ({ onNextPhase }) => {
  const [name, setName] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleProceed = () => {
    // Validate name if necessary
    if (name.trim() !== '') {
      // Proceed to the next phase
      onNextPhase();
    } else {
      alert('Please enter your name.');
    }
  };

  return (
    <div>
      <h2>Welcome to Our Application!</h2>
      <DynamicNamingConventions dynamicContent={true} />
      <form onSubmit={e => e.preventDefault()}>
        <label htmlFor="name">Enter Your Name:</label>
        <input type="text" id="name" value={name} onChange={handleNameChange} />
        <button type="button" onClick={handleProceed}>Proceed</button>
      </form>
    </div>
  );
};

export default WelcomePhase;
