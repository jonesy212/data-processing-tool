// ProfileSetupPhase.tsx
import PersonaTypeEnum from '@/app/pages/personas/PersonaBuilder';
import React, { useState } from 'react';
import useErrorHandling from '../../hooks/useErrorHandling';

interface ProfileSetupPhaseProps {
  onSubmit: (profileData: any, personaType: PersonaTypeEnum) => void; // Pass personaType to onSubmit callback
}

const ProfileSetupPhase: React.FC<ProfileSetupPhaseProps> = ({ onSubmit }) => {
  // You can define the state for profile setup form fields here
  const [profileData, setProfileData] = useState({
    // Define your profile setup form fields
    firstName: '',
    lastName: '',
    // Add more fields as needed
  });
  const [selectedPersona, setSelectedPersona] = useState<PersonaTypeEnum | null>(null); // State to store selected persona

  // Initialize error handling
  const { error, handleError, clearError } = useErrorHandling();


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the state when form fields change
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };


  const handlePersonaSelect = (persona: PersonaTypeEnum) => {
    setSelectedPersona(persona);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Clear any previous errors
      clearError();

      if (selectedPersona) {
        // Call onSubmit callback with profileData and selectedPersona
        onSubmit(profileData, selectedPersona);
      } else {
        // Ensure a persona is selected before submitting
        // Handle error: No persona selected
        handleError('Please select a persona before submitting.');
      }
    } catch (error) {
      // Handle any other errors that occur during submission
      handleError('Failed to submit profile setup. Please try again.');
    }
  };


  return (
    <div>
      <h2>Profile Setup</h2>
      {error && <div>Error: {error}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <input
            type="text"
            name="firstName"
            value={profileData.firstName}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Last Name:
          <input
            type="text"
            name="lastName"
            value={profileData.lastName}
            onChange={handleInputChange}
          />
        </label>
        {/* Add more form fields as needed */}
        <br />
          {/* Persona selection */}
          <div>
          <h3>Select Persona:</h3>
          <button onClick={() => handlePersonaSelect(PersonaTypeEnum.CryptoTrader)}>Crypto Trader</button>
          <button onClick={() => handlePersonaSelect(PersonaTypeEnum.StockTrader)}>Stock Trader</button>
          <button onClick={() => handlePersonaSelect(PersonaTypeEnum.ForexTrader)}>Forex Trader</button>
        </div>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ProfileSetupPhase;
