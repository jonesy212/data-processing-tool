import React from "react";

import { initializeUserData } from '@/app/pages/onboarding/PersonaBuilderData';
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { UserData } from '../../users/User';
import { subscribeToRealtimeUpdates } from '../../web3/dAppAdapter/functionality/RealtimeUpdates';


// Define the type for participant data
const RealtimeUpdatesComponent = () => {
  const { state: authState } = useAuth();
  const id = authState.user?.id;
  const [realtimeData, setRealtimeData] = useState<UserData | null>(null);
  const [chatSettings, setChatSettings] = useState<{
    realTimeChatEnabled: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (authState.user) {
        try {
          const userData = await initializeUserData(id as string | number, authState.user);
          setRealtimeData(userData);
        } catch (error) {
          console.error('Error initializing user data:', error);
        }
      }
    };

    fetchData();

    if (authState.user) {
      const unsubscribe = subscribeToRealtimeUpdates(
        authState.user,
        handleRealtimeUpdate
      );

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [authState.user, id]);

  const handleRealtimeUpdate = (newData: UserData) => {
    setRealtimeData(newData);

    const chatSettings =
      typeof newData.chatSettings === "string"
        ? { realTimeChatEnabled: false }
        : newData.chatSettings || {
            realTimeChatEnabled: false,
          };

    setChatSettings({
      realTimeChatEnabled: chatSettings.realTimeChatEnabled,
    });
  };

  if (!authState.user) {
    return (
      <div>
        <p>User is not authenticated.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Real-time Updates</h2>
      <p>Username: {authState.user.username}</p>
      <p>Email: {authState.user.email}</p>
      <p>Real-time Data: {JSON.stringify(realtimeData)}</p>
      {chatSettings && (
        <p>Real-time Chat Enabled: {chatSettings.realTimeChatEnabled ? 'Yes' : 'No'}</p>
      )}
    </div>
  );
};

export default RealtimeUpdatesComponent;
