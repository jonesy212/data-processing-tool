// ProfileSetupPhase.tsx
import React, { useState } from 'react';

interface ProfileSetupPhaseProps {
  onSubmit: (profileData: any) => void;
}

const ProfileSetupPhase: React.FC<ProfileSetupPhaseProps> = ({ onSubmit }) => {
  // You can define the state for profile setup form fields here
  const [profileData, setProfileData] = useState({
    // Define your profile setup form fields
    firstName: '',
    lastName: '',
    // Add more fields as needed
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the state when form fields change
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add any additional validation or logic here before submitting

    // Call the onSubmit callback with the profileData
    onSubmit(profileData);
  };

  return (
    <div>
      <h2>Profile Setup</h2>
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ProfileSetupPhase;
