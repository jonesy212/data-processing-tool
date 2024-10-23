// UserConsentComponent.jsx
import React, { useState } from 'react';

const UserConsentComponent = ({ onConsent }) => {
  const [consented, setConsented] = useState(false);

  const handleConsent = () => {
    setConsented(true);
    onConsent(); // Callback to parent component indicating user consent
  };

  return (
    <div>
      <p>Please read and agree to the terms before proceeding.</p>
      <label>
        <input type="checkbox" checked={consented} onChange={handleConsent} />
        I agree to the terms
      </label>
    </div>
  );
};

export default UserConsentComponent;
