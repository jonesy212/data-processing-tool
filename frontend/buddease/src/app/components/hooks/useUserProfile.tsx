// UseUserProfile.tsx
import { endpoints } from '@/app/api/ApiEndpoints';
import { useState } from 'react';
import { NotificationTypeEnum, useNotification } from '../support/NotificationContext';
import NOTIFICATION_MESSAGES from '../support/NotificationMessages';

const API_BASE_URL = endpoints.user; // Use the user endpoint

/**
 * Custom hook for managing user profile data.
 * 
 * @returns Object containing user profile data and functions to update it.
 */
const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const { notify } = useNotification(); // Destructure notify from the useNotification hook

  /**
   * Function to update the user profile.
   * 
   * @param newProfileData New profile data to be updated.
   */

  const updateProfile = async (newProfileData: any) => {
    try {
      // Logic to update user profile information
      // Send a PUT request to update the user profile data
      notify(
        "updateProfieSuccess",
        "Your profile has been updated.",
        NOTIFICATION_MESSAGES.UserProfile.PROFILE_SAVING,
        new Date(),
        NotificationTypeEnum.Info
      ); // Notify user about profile saving
      const response = await fetch(`${API_BASE_URL}/profile`, { // Use the correct endpoint
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfileData),
      });

      if (response.ok) {
        // Update the local state with the updated profile data upon a successful response
        setUserProfile(newProfileData);
        notify(
          "updateProfileSuccess",
          'Profile updated successfully.',
          NOTIFICATION_MESSAGES.UserProfile.PROFILE_SAVING_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        ); // Notify user about successful profile update
      } else {
        // Handle error response
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to update profile.');
      }
    } catch (error) {
      // Handle error updating user profile
      console.error('Error updating user profile:', error);
      notify(
        "updateProfileError",
        'Failed to update profile. Please try again later.',
        NOTIFICATION_MESSAGES.UserProfile.PROFILE_SAVING_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      ); // Notify user about failed profile update
    }
  };


   /**
   * Function to update user persona data.
   * 
   * @param newPersonaData New persona data to be updated.
   */

  const updatePersonaData = (newPersonaData: any) => {
    // Logic to update user persona data
    setUserProfile((prevProfile: any) => ({
      ...prevProfile,
      personaData: newPersonaData,
    }));
  };



    /**
   * Function to fetch user profile data.
   * 
   * @returns Fetched user profile data.
   */

  const getUserProfile = async () => {
    try {
      // Logic to fetch user profile information
      const response = await fetch(`${API_BASE_URL}/profile`); // Use the correct endpoint
      if (!response.ok) {
        // Handle error response
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Failed to fetch profile.');
      }
      // Update the local state with the fetched profile data
      const profileData = await response.json();
      setUserProfile(profileData);
      return profileData;
    } catch (error) {
      // Handle error fetching user profile
      console.error('Error fetching user profile:', error);
      notify(
        "fetchProfileError",
        'Failed to fetch profile data. Please try again later.',
        NOTIFICATION_MESSAGES.UserProfile.PROFILE_FETCH_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      ); // Notify user about failed profile fetch
      
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


