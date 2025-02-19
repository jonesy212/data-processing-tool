// Registration.tsx
import React from 'react';
import RegistrationPhase from './RegistrationPhase';

const Registration: React.FC = () => {
  const handleSuccess = async (userData: any) => {
    // Implement logic to handle successful registration (e.g., store user data, redirect user)
    console.log('Registration successful!', userData);
  };

  return <RegistrationPhase onSuccess={handleSuccess} />;
};

export default Registration;
