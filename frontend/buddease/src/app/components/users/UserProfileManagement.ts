// UserProfileManagement.ts
import uiStore from "../state/stores/UIStore";
import { User } from "./User";
import UserManagement from "./UserManagement";

class UserProfileManagement {
  private userManagement: UserManagement; // Declare a private property to hold an instance of UserManagement

  constructor() {
    this.userManagement = new UserManagement(); // Initialize an instance of UserManagement
    // Initialize UserProfileManagement component
  }

  // Fetch user profile by ID
  fetchUserProfile = async (userId: string) => {
    try {
      const userProfile = await this.userManagement.fetchUser(userId); // Access fetchUser through the instance of UserManagement
      // Handle user profile fetch success
      return userProfile;
    } catch (error) {
      // Handle user profile fetch failure
      throw error;
    }
  };

  // Update user profile data
  updateUserProfile = async (
    userId: string,
    updatedProfileData: Partial<User>
  ) => {
    try {
      const updatedProfile = await this.userManagement.updateUser(
        userId,
        updatedProfileData
      ); // Access updateUser through the instance of UserManagement
      // Handle user profile update success
      return updatedProfile;
    } catch (error) {
      // Handle user profile update failure
      throw error;
    }
  };

  // Delete user profile by ID
  deleteUserProfile = async (userId: string) => {
    try {
      await this.userManagement.deleteUser(userId); // Access deleteUser through the instance of UserManagement
      // Handle user profile deletion success
    } catch (error) {
      // Handle user profile deletion failure
      throw error;
    }
  };

  // Fetch user profile and update UI state
  fetchAndSetUserProfile = async (userId: string) => {
    try {
      const userProfile = await this.fetchUserProfile(userId);
      // Update UI state with fetched user profile
      uiStore.setUserProfile(userProfile);
    } catch (error: any) {
      // Handle error
      uiStore.setError(error.message);
    }
  };

  // Update user profile and UI state
  updateAndSetUserProfile = async (
    userId: string,
    updatedProfileData: Partial<User>
  ) => {
    try {
      const updatedProfile = await this.updateUserProfile(
        userId,
        updatedProfileData
      );
      // Update UI state with updated user profile
      uiStore.setUserProfile(updatedProfile);
    } catch (error: any) {
      // Handle error
      uiStore.setError(error.message);
    }
  };

  // Delete user profile and update UI state
  deleteAndClearUserProfile = async (userId: string) => {
    try {
      await this.deleteUserProfile(userId);
      // Clear user profile from UI state
      uiStore.clearUserProfile();
    } catch (error: any) {
      // Handle error
      uiStore.setError(error.message);
    }
  };
}

export default UserProfileManagement;
