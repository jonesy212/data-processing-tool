// VerifyEmail.tsx
//users must verify their email during login or when updating their email,
import React, { useState } from 'react';

const VerifyEmail: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleVerifyEmail = () => {
    // Your logic to send a verification email and handle the verification process
    console.log(`Verification email sent to: ${email}`);
  };

  return (
    <div>
      <h2>Verify Email</h2>
      <label>
        Email:
        <input type="email" value={email} onChange={handleEmailChange} />
      </label>
      <button onClick={handleVerifyEmail}>Send Verification Email</button>
    </div>
  );
};

export default VerifyEmail;
