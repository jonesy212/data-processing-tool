import { useState } from 'react';

const useTwoFactorAuthentication = () => {
  const [isTwoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const enableTwoFactor = () => {
    // Your logic to enable two-factor authentication
    setTwoFactorEnabled(true);
  };

  const disableTwoFactor = () => {
    // Your logic to disable two-factor authentication
    setTwoFactorEnabled(false);
  };

  return {
    isTwoFactorEnabled,
    enableTwoFactor,
    disableTwoFactor,
  };
};

export default useTwoFactorAuthentication;
