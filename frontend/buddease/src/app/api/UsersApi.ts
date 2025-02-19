import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import axios from 'axios';
import Logger from '../components/logging/Logger';
import UserService from '../components/users/ApiUser';
import { User } from '../components/users/User';
import { databaseConfig } from '../configs/DatabaseConfig';

// Function to log API errors
const handleApiError = (error: any) => {
  console.error('API Error: ', error);
  Logger.error('API Error: ', error);
  throw error; // Propagate the error to the calling code
};

// Modify the function to accept user ID as a parameter
export const getUserData = async (userId: string) => {
  try {
    // Use the user ID to fetch data for a specific user
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getUsersData = async (userIds: string[]) => {
  try {
    const userDataArray = [];
    for (const userId of userIds) {
      // Use the user ID to fetch data for each user
      const userService = new UserService(); // Create an instance of UserService
      const response = await userService.fetchUserData({ userId }, {
        dispatch: {} as Dispatch<UnknownAction>
      }); // Pass an empty object as the second argument
      userDataArray.push(response.payload); // Access the payload property instead of data
    }
    return userDataArray;
  } catch (error) {
    handleApiError(error);
  }
};


// Function to process user data
export const processUserData = (userData: any): any => {
  // Ensure userData is an object
  if (userData && typeof userData === 'object') {
    // Iterate over each property of the user data object
    for (const key in userData) {
      if (userData.hasOwnProperty(key)) {
        // Check if the property value is a string
        if (typeof userData[key] === 'string') {
          // Convert the string value to uppercase
          userData[key] = userData[key].toUpperCase();
        }
        // Add additional processing logic for other data types if needed
      }
    }
  } else {
    // Log a warning if userData is not an object
    console.warn('Input data is not an object.');
  }
  
  return userData;
};

//api pattern
// Function to save user profiles to the database
export const saveUserProfiles = async (profiles: User[]): Promise<{ success: boolean, message?: string, error?: string }> => {
  try {
    // Check if the databaseConfig object has a saveUserProfiles method
    if (!databaseConfig.saveUserProfiles) {
      throw new Error('saveUserProfiles method is not implemented in the databaseConfig object.');
    }
    
    // Call the saveUserProfiles method, passing the array of user profiles
    await databaseConfig.saveUserProfiles(profiles);

    // Return success message or result
    return { success: true, message: "User profiles saved successfully." };
  } catch (error) {
    // Log and handle the error
    console.error("Error saving user profiles:", error);
    Logger.error("Error saving user profiles:", error);

    // Return error message
    return { success: false, error: "Failed to save user profiles." };
  }
};



// Function to fetch user data (example)
export const fetchUserData = async (req: any, res: any) => {
  try {
    const userId = req.params.userId; // Example: Extract userId from request parameters

    // Fetch user data using req or any other parameters if needed
    let userData = await fetchDataFromExternalAPI(userId); // Example function to fetch user data from an external API

    // Process the fetched data if necessary
    userData = processUserData(userData);

    // Send response with fetched user data
    res.status(200).json(userData);
  } catch (error) {
    handleApiError(error);
  }
};





// Helper function to save user profile to database (example)
const saveToDatabase = async (userProfile: any) => {
  try {
    // For demonstration, let's assume saving is successful
    console.log('Saving user profile to database:', userProfile);
    Logger.info('Saving user profile to database:', userProfile);

    // Simulating database operation with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('User profile saved to database successfully.');
    Logger.info('User profile saved to database successfully.');
  } catch (error) {
    // Handle database save error
    console.error('Error saving user profile to database:', error);
    Logger.error('Error saving user profile to database:', error);
    throw new Error('Failed to save user profile to database.');
  }
};

// Function to fetch user data from an external API (example)
const fetchDataFromExternalAPI = async (userId: string) => {
  try {
    // Example logic to fetch user data from an external API
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
