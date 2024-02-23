import { sanitizeInput } from "@/app/components/security/SanitizationFunctions"; // Import sanitizeInput function
import React, { useState } from 'react';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<'form' | 'verification' | 'passwordReset'>('form'); // Track the current phase

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize email
    const sanitizedEmail = sanitizeInput(email);

    try {
      // Send request to backend to initiate password recovery process and trigger email notification
      // Update phase to 'verification' upon successful request
      setPhase('verification');
      console.log(`Requesting password recovery for email: ${sanitizedEmail}`);
      // Example: await sendPasswordRecoveryEmail(sanitizedEmail);
    } catch (error) {
      // Handle error if password recovery request fails
      console.error('Error initiating password recovery:', error);
      // Set phase back to 'form' to display the form again
      setPhase('form');
    }
  };

  return (
    <div>
      {phase === 'form' && (
        <form onSubmit={handleSubmit}>
          <label>
            Email:
            <input type="email" value={email} onChange={handleEmailChange} />
          </label>
          <button type="submit">Recover Password</button>
        </form>
      )}

      {phase === 'verification' && (
        <div>
          <p>An email with instructions for password recovery has been sent to {email}.</p>
          {/* Display link/button to go back to login screen */}
          <button onClick={() => setPhase('form')}>Go Back to Login</button>
        </div>
      )}

      {/* Add the password reset form component for the 'passwordReset' phase */}
      {/* Example: {phase === 'passwordReset' && <PasswordResetForm />} */}
    </div>
  );
};

export default ForgotPasswordForm;
