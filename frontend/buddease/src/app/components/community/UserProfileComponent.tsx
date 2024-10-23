import React, { useEffect } from 'react';
import useUserProfile from '../hooks/useUserProfile';


const UserProfileComponent: React.FC = () => {
  // Invoke the custom hook to get user profile data and functions
  const { userProfile, updateProfile, updatePersonaData, getUserProfile } = useUserProfile();

  // Use useEffect to fetch user profile data on component mount
  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  // Render user profile data and update functions
  return (
    <div>
      <h1>User Profile</h1>
      {/* Render user profile data */}
      <p>{JSON.stringify(userProfile)}</p>
      {/* Button to update user profile */}
        
      <button onClick={() => updateProfile({ name: 'New Name' })}>Update Profile</button>
      {/* Button to update persona data */}
      <button onClick={() => updatePersonaData({ persona: 'New Persona Data' })}>Update Persona Data</button>

    </div>
  );
};

export default UserProfileComponent;
