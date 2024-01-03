import axios from 'axios';
import { useState } from 'react';
import { useNotification } from './useNotification';

const useSocialAuthentication = () => {
  const [socialAuthProviders, setSocialAuthProviders] = useState<string[]>([]);
  const { sendNotification } = useNotification(); // Use the notification context

  const fetchSocialAuthProviders = async () => {
    try {
      const response = await axios.get("/api/social-auth-providers");
      const providers = response.data.providers;
      setSocialAuthProviders(providers);
    } catch (error: any) {
      console.error(
        "Error fetching social authentication providers:",
        error.message
      );
      sendNotification("Failed to fetch social authentication providers"); // Notify on error
    }
  };

  const initiateSocialLogin = (provider: string) => {
    console.log(`Initiating social login with ${provider}`);
    sendNotification(`Social login initiated with ${provider}`); // Notify on social login initiation
  };

  return {
    socialAuthProviders,
    fetchSocialAuthProviders,
    initiateSocialLogin,
  };
};

export default useSocialAuthentication;








