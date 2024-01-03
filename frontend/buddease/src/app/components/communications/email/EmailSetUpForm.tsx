// EmailSetupForm.tsx
import React, { useState } from 'react';

const EmailSetupForm: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleRegisterEmail = () => {
    // Your logic to register the email goes here
    console.log(`Email registered: ${email}`);
  };

  return (
    <div>
      <h2>Email Setup</h2>
      <label>
        Email:
        <input type="email" value={email} onChange={handleEmailChange} />
      </label>
      <button onClick={handleRegisterEmail}>Register Email</button>
    </div>
  )
}

export default EmailSetupForm;
