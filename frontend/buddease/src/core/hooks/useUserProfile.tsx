useUserProfile.tsx
UseUserProfile.tsx
import { endpoints } from '@/core/api/endpointConfigurations';
import NOTIFICATION_MESSAGES from '@/core/features/support/NotificationMessages';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/core/state/context/NotificationContext';
import { useState } from 'react';

const API_BASE_URL = endpoints.user; // Use the user endpoint

/**
 * Custom hook for managing user profile data.
 * 
 * @returns Object containing user profile data and functions to update it.
 */
const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const { notify } = useNotification();

  /**
   * Function to update the user profile.
   */
  const updateProfile = async (newProfileData: any) => {
    try {
      // Notify user about profile saving using consistent object format
      notify({
        id: `profile_saving_${Date.now()}`,
        message: NOTIFICATION_MESSAGES.UserProfile.PROFILE_SAVING || "Saving profile...",
        data: {
          entityType: 'user_profile',
          action: 'update',
          profileData: newProfileData,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.INFO,
        level: 'info' as const
      });

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfileData),
      });

      if (response.ok) {
        // Update the local state with the updated profile data upon a successful response
        setUserProfile(newProfileData);
        
        // Success notification using consistent object format
        notify({
          id: `profile_update_success_${Date.now()}`,
          message: NOTIFICATION_MESSAGES.UserProfile.PROFILE_SAVING_SUCCESS || "Profile updated successfully",
          data: {
            entityType: 'user_profile',
            action: 'update',
            profileData: newProfileData,
            responseData: await response.json(),
            timestamp: new Date().toISOString()
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_SUCCESS,
          level: 'success' as const
        });
        
      } else {
        // Handle error response
        const errorMessage = await response.text();
        const errorData = { status: response.status, message: errorMessage };
        
        // Error notification for non-OK response
        let userMessage = "Failed to update profile";
        if (response.status === 400) {
          userMessage = "Invalid profile data";
        } else if (response.status === 401) {
          userMessage = "Authentication required to update profile";
        } else if (response.status === 403) {
          userMessage = "You don't have permission to update this profile";
        } else if (response.status === 409) {
          userMessage = "Profile update conflict";
        }
        
        notify({
          id: `profile_update_error_${Date.now()}`,
          message: userMessage,
          data: {
            entityType: 'user_profile',
            action: 'update',
            profileData: newProfileData,
            originalError: errorMessage,
            statusCode: response.status,
            errorType: 'PROFILE_UPDATE_ERROR',
            timestamp: new Date().toISOString()
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_ERROR,
          level: 'error' as const
        });
        
        throw new Error(errorMessage || 'Failed to update profile.');
      }
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      
      // Enhanced error notification for caught errors
      let userMessage = "Failed to update profile";
      if (error.message?.includes('network') || error.name === 'TypeError') {
        userMessage = "Network error: Unable to update profile";
      }
      
      notify({
        id: `profile_update_error_${Date.now()}`,
        message: userMessage,
        data: {
          entityType: 'user_profile',
          action: 'update',
          profileData: newProfileData,
          originalError: error.message,
          errorType: 'PROFILE_UPDATE_NETWORK_ERROR',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
      
      throw error;
    }
  };

  /**
   * Function to update user persona data.
   */
  const updatePersonaData = (newPersonaData: any) => {
    try {
      // Logic to update user persona data
      setUserProfile((prevProfile: any) => ({
        ...prevProfile,
        personaData: newPersonaData,
      }));
      
      // Success notification for local state update
      notify({
        id: `persona_update_success_${Date.now()}`,
        message: "Persona data updated successfully",
        data: {
          entityType: 'user_persona',
          action: 'update',
          personaData: newPersonaData,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      
    } catch (error: any) {
      console.error('Error updating persona data:', error);
      
      notify({
        id: `persona_update_error_${Date.now()}`,
        message: "Failed to update persona data",
        data: {
          entityType: 'user_persona',
          action: 'update',
          personaData: newPersonaData,
          originalError: error.message,
          errorType: 'PERSONA_UPDATE_ERROR',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    }
  };

  /**
   * Function to fetch user profile data.
   */
  const getUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`);
      
      if (!response.ok) {
        const errorMessage = await response.text();
        const errorData = { status: response.status, message: errorMessage };
        
        // Error notification for non-OK response
        let userMessage = "Failed to fetch profile";
        if (response.status === 401) {
          userMessage = "Authentication required to view profile";
        } else if (response.status === 403) {
          userMessage = "You don't have permission to view this profile";
        } else if (response.status === 404) {
          userMessage = "Profile not found";
        }
        
        notify({
          id: `profile_fetch_error_${Date.now()}`,
          message: userMessage,
          data: {
            entityType: 'user_profile',
            action: 'fetch',
            originalError: errorMessage,
            statusCode: response.status,
            errorType: 'PROFILE_FETCH_ERROR',
            timestamp: new Date().toISOString()
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_ERROR,
          level: 'error' as const
        });
        
        throw new Error(errorMessage || 'Failed to fetch profile.');
      }
      
      // Update the local state with the fetched profile data
      const profileData = await response.json();
      setUserProfile(profileData);
      
      // Success notification for fetch
      notify({
        id: `profile_fetch_success_${Date.now()}`,
        message: "Profile data fetched successfully",
        data: {
          entityType: 'user_profile',
          action: 'fetch',
          profileData: profileData,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      
      return profileData;
      
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      
      // Enhanced error notification for network/caught errors
      let userMessage = "Failed to fetch profile data";
      if (error.message?.includes('network') || error.name === 'TypeError') {
        userMessage = "Network error: Unable to fetch profile data";
      }
      
      notify({
        id: `profile_fetch_error_${Date.now()}`,
        message: userMessage,
        data: {
          entityType: 'user_profile',
          action: 'fetch',
          originalError: error.message,
          errorType: 'PROFILE_FETCH_NETWORK_ERROR',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
      
      return null;
    }
  };

  return {
    userProfile,
    updateProfile,
    updatePersonaData,
    getUserProfile,
  };
};
export default useUserProfile;


