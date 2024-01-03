import React, { useState } from 'react';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
      // Add your logic to handle the forgot password submission
      
    console.log(`User requested password recovery for email: ${email}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input type="email" value={email} onChange={handleEmailChange} />
      </label>
      <button type="submit">Recover Password</button>
    </form>
  );
};

export default ForgotPasswordForm;
