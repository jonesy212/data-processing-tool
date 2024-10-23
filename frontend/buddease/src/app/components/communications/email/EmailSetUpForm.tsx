// EmailSetupForm.tsx
import React, { useState } from 'react';


interface EmailSetupFormProps {
  handleRegisterEmail: () => void; // Define prop for handleRegisterEmail function
}
const EmailSetupForm: React.FC<EmailSetupFormProps> = ({handleRegisterEmail}) => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
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
