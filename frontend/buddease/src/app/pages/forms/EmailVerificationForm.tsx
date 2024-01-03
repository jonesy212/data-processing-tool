// EmailVerificationForm.tsx
import React, { useState } from 'react';

const EmailVerificationForm: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Call your API endpoint to verify the email with the provided code
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verificationCode }),
      });

      if (response.ok) {
        console.log('Email verified successfully!');
        // You might want to redirect the user or perform additional actions here
      } else {
        console.error('Failed to verify email');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div>
      <h2>Email Verification</h2>
      <p>Enter the verification code sent to your email:</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="verificationCode"
          value={verificationCode}
          onChange={handleCodeChange}
          required
        />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default EmailVerificationForm;
