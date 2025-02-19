// ApiUser.ts
import { createHeaders } from "@/app/api/ApiClient";
import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import Logger from "@/app/components/logging/Logger";
import dotProp from "dot-prop";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { User } from "./User";
import { UserActions } from "./UserActions";
import { UserRole } from "./UserRole";
import { UserRoleActions } from "./UserRoleActions";
import { sendNotification } from "./UserSlice";
// Other imports remain unchanged
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import updateUI from '../documents/editing/updateUI';

const API_BASE_URL = endpoints.users;

interface UserProfile extends User {
  id: string;
  name: string;
  email: string;
  // permissions: UserRole[];
}

export const fetchUserRequest = (userId: string) => ({
  type: "FETCH_USER_REQUEST",
  payload: userId,
});

const dispatch = useDispatch();

// Dispatching the action
export const { userId } = useParams(); // Extract userId from URL params

// Convert userId to a number
const parsedUserId = Number(userId);
// Calling API_BASE_URL.single to get the URL string
export const url: string | undefined = dotProp.getProperty(
  API_BASE_URL,
  "single",
  [parsedUserId]
) as string | undefined;

// Dispatching the action with the correct userId
dispatch(UserActions.fetchUserRequest({ userId: parsedUserId }));








class UserService {

  // Constructor remains unchanged
  static getCurrentUserId() {
    return parsedUserId;
  }
 // Define the API base URL

// Update the createUser method
createUser = async (newUser: User) => {
  try {
    const API_ADD_ENDPOINT = API_BASE_URL.add;
    if (!API_ADD_ENDPOINT) {
      throw new Error("Add endpoint not found");
    }

    // Call createHeaders function to get the headers configuration
    const headers = createHeaders();

    const response = await axiosInstance.post(`${API_ADD_ENDPOINT}`, newUser, {
      headers: headers, // Pass headers configuration in the request
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// We can then import and use these actions wherever needed in our application.

static fetchUser = async (userId: User["id"], authToken: string) => {
  try {
    // Construct the API endpoint without using dot-prop
    const API_SINGLE_ENDPOINT = `${API_BASE_URL}/single/${userId}`;

    const response = await axiosInstance.get(API_SINGLE_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json", // Adjust as needed
      },
    });

    UserActions.fetchUserSuccess({ user: response.data });
    sendNotification(`User with ID ${userId} fetched successfully`);
    
    return response.data;
  } catch (error) {
    UserActions.fetchUserFailure({ error: String(error) });
    sendNotification(`Error fetching user with ID ${userId}: ${error}`);
    console.error("Error fetching user:", error);
    throw error;
  }
};

  static fetchUserbyUserName = async (userName: string) => { 
    try {
      // Construct API endpoint to fetch user by username
      const API_SINGLE_BY_USERNAME_ENDPOINT = `${API_BASE_URL}/single/username/${userName}`;

      const response = await axiosInstance.get(API_SINGLE_BY_USERNAME_ENDPOINT);

      return response.data;
    } catch(error) {
      throw error;
    }
  }

  static fetchUserById = async (userId: string) => {
    try {
      const API_SINGLE_ENDPOINT = `${API_BASE_URL}/single/${userId}`;
      const response = await axiosInstance.get(API_SINGLE_ENDPOINT);
      return response.data;
      } catch (error) {
        throw error;
      }
    };
  

  fetchUserProfile = async (userId: string) => {
    try {
      const user = await this.fetchUserById(userId);
     
      // Extract user profile from user data
      const userProfile: UserProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        ...user,
      };

      UserActions.fetchUserProfileSuccess({ userProfile });

      sendNotification(
        `User profile for user with ID ${userId} fetched successfully`
      );

      return userProfile;
    } catch (error) {
      UserActions.fetchUserProfileFailure({ error: String(error) });

      sendNotification(
        `Error fetching user profile for user with ID ${userId}: ${error}`
      );

      console.error("Error fetching user profile:", error);
      throw error;
    }
  };


    fetchUserById = async (userId: string) => {
      try {
        const response = await axiosInstance.get(
          `${dotProp.getProperty(API_BASE_URL, "single", [Number(userId)])}`
        );
        const user = response.data;
        // Dispatch the success action
        UserActions.fetchUserByIdSuccess({ user });
        sendNotification(`User with ID ${userId} fetched successfully`);
        return user;
      } catch (error) {
        // Dispatch the failure action
        UserActions.fetchUserByIdFailure({ error: String(error) });
        sendNotification(`Error fetching user with ID ${userId}: ${error}`);
        console.error("Error fetching user:", error);
        throw error;
      }
    }
  
  
  fetchUserData = async (
    req: { userId: string },
    res: {
      dispatch: Dispatch<UnknownAction>;
    }
  ) => {
    try {
      const API_LIST_ENDPOINT = dotProp.getProperty(
        API_BASE_URL,
        "list"
      ) as string;
      if (!API_LIST_ENDPOINT) {
        throw new Error("List endpoint not found");
      }

      const response = await axiosInstance.get(
        `${API_LIST_ENDPOINT}/${req.userId}`
      );
      const userData = response.data;

      // Call the action creator with the fetched user data
      const userDataAction = UserActions.fetchUserDataSuccess(userData);
      res.dispatch(userDataAction);

      sendNotification(`User with ID ${userData.userId} fetched successfully`);
      return userData;
    } catch (error) {
      const errorAction = UserActions.fetchUserDataFailure({
        error: String(error),
      });
      res.dispatch(errorAction);
      sendNotification(`Error fetching user with ID ${req.userId}: ${error}`);
      console.error("Error fetching user:", error);
      throw error;
    }
  };
    
    
  fetchUserByIdSuccess = async () => {
    try {
      const API_LIST_ENDPOINT = dotProp.getProperty(
        API_BASE_URL,
        "list"
      ) as string;
      if (!API_LIST_ENDPOINT) {
        throw new Error("List endpoint not found");
      }

      const response = await axiosInstance.get(API_LIST_ENDPOINT);
      const user = response.data;
      // Dispatch the success action
      UserActions.fetchUserByIdSuccess({ user: user.id });
      sendNotification(`User with ID ${user} fetched successfully`);
      return user;
    } catch (error) {
      // Dispatch the failure action
      UserActions.fetchUserByIdFailure({ error: String(error) });
      sendNotification(`Error fetching user with ID ${userId}: ${error}`);
      console.error("Error fetching user:", error);
      throw error;
    }
  };

  updateUser = async (userId: User["id"], updatedUserData: User) => {
    try {
      const response = await axiosInstance.put(
        `${dotProp.getProperty(API_BASE_URL, "update", [userId as number])}`,
        updatedUserData
      );
      const updatedUser = response.data;
      UserActions.updateUserSuccess({ user: updatedUser });
      sendNotification(`User with ID ${userId} updated successfully`);
      return updatedUser;
    } catch (error) {
      UserActions.updateUserFailure({ error: String(error) });
      sendNotification(`Error updating user with ID ${userId}: ${error}`);
      console.error("Error updating user:", error);
      throw error;
    }
  };

  updateUserFailure = async () => {
    try {
      const API_LIST_ENDPOINT = dotProp.getProperty(
        API_BASE_URL,
        "list"
      ) as string;
      if (!API_LIST_ENDPOINT) {
        throw new Error("List endpoint not found");
      }

      const response = await axiosInstance.get(API_LIST_ENDPOINT);
      const user = response.data;
      // Dispatch the failure action
      UserActions.updateUserFailure({ error: "Update user failed" });
      sendNotification("Failed to update user");
      return user;
    } catch (error) {
      UserActions.fetchUsersFailure({ error: String(error) });
      sendNotification(`Error updating user: ${error}`);
      console.error("Error updating user:", error);
      throw error;
    }
  };
  // Bulk requests
  fetchUsers = async () => {
    try {
      const listEndpoint = dotProp.getProperty(API_BASE_URL, "list") as string;
      if (!listEndpoint) {
        throw new Error("List endpoint not found");
      }
      const response = await axiosInstance.get(listEndpoint);
      const users = response.data;
      // Dispatch the success action
      UserActions.fetchUsersSuccess({ users });
      sendNotification("Users fetched successfully");
      return users;
    } catch (error) {
      // Dispatch the failure action
      UserActions.fetchUsersFailure({ error: String(error) });
      sendNotification(`Error fetching users: ${error}`);
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  updateUsers = async (updatedUsersData: User) => {
    try {
      const updateListEndpoint = dotProp.getProperty(
        API_BASE_URL,
        "updateList"
      ) as string;
      if (!updateListEndpoint) {
        throw new Error("Update list endpoint not found");
      }
      const response = await axiosInstance.put(
        updateListEndpoint,
        updatedUsersData
      );
      const updatedUsers = response.data;
      // Dispatch the success action
      UserActions.updateUsersSuccess({ users: updatedUsers });
      sendNotification("Users updated successfully");
      return updatedUsers;
    } catch (error) {
      // Dispatch the failure action
      UserActions.updateUsersFailure({ error: String(error) });
      sendNotification(`Error updating users: ${error}`);
      console.error("Error updating users:", error);
      throw error;
    }
  };

  deleteUser = async (user: User) => {
    try {
      const removeEndpoint = dotProp.getProperty(API_BASE_URL, "remove", [
        user.id as number,
      ]) as string;
      if (!removeEndpoint) {
        throw new Error("Remove endpoint not found");
      }
      const response = await axiosInstance.delete(removeEndpoint);
      // Dispatch success action
      UserActions.deleteUserSuccess(user as unknown as number);
      sendNotification("User deleted successfully");
      return response.data;
    } catch (error) {
      // Dispatch failure action
      UserActions.deleteUserFailure({ error: String(error) });
      sendNotification(`Error deleting user: ${error}`);
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  deleteUsers = async (userIds: User["id"][]) => {
    try {
      const listEndpoint = dotProp.getProperty(API_BASE_URL, "list") as string;
      if (!listEndpoint) {
        throw new Error("List endpoint not found");
      }
      await axiosInstance.delete(listEndpoint, { data: { userIds } });
      // Dispatch the success action
      UserActions.deleteUsersSuccess(userIds as User["id"][] as number[]);
      sendNotification("Users deleted successfully");
    } catch (error) {
      // Dispatch the failure action
      UserActions.deleteUsersFailure({ error: String(error) });
      sendNotification(`Error deleting users: ${error}`);
      console.error("Error deleting users:", error);
      throw error;
    }
  };

  searchUsers = async (searchQuery: string) => {
    try {
      const searchEndpoint = dotProp.getProperty(
        API_BASE_URL,
        "search"
      ) as string;
      if (!searchEndpoint) {
        throw new Error("Search endpoint not found");
      }
      const response = await axiosInstance.get(
        `${searchEndpoint}?query=${searchQuery}`
      );
      const users = response.data;
      UserActions.searchUsersSuccess({ users });
      sendNotification("Users searched successfully");
      return users;
    } catch (error) {
      UserActions.searchUsersFailure({ error: String(error) });
      sendNotification(`Error searching users: ${error}`);
      console.error("Error searching users:", error);
      throw error;
    }
  };

  // Assign role to user
   assignUserRole = async (userId: User["id"], role: string) => {
    try {
      // Implement logic to assign the role to the user
      const assignRoleEndpoint = dotProp.getProperty(
        API_BASE_URL,
        "assignRole",
        [userId as number]
      ) as string;
      if (!assignRoleEndpoint) {
        throw new Error("Assign role endpoint not found");
      }
      const response = await axiosInstance.put(assignRoleEndpoint, { role });
      const assignedUser = response.data;
      UserRoleActions.assignUserRoleSuccess({
        user: assignedUser,
      });
      sendNotification(`Role assigned to user with ID ${userId} successfully`);
      return assignedUser;
    } catch (error) {
      UserRoleActions.assignUserRoleFailure({
        userId: userId as number, // Convert userId to number
        role: role as unknown as number, // Convert role to number if necessary
        error: String(error),
      });
      sendNotification(
        `Error assigning role to user with ID ${userId}: ${error}`
      );
      console.error("Error assigning role to user:", error);
      throw error;
    }
  };


// Update user roles in bulk
updateUserRoles = async (users: {
  userId: string | number;
  role: UserRole;
}) => {
  try {
    // Call service method to bulk update user roles
    const updatedUsers = await userService.bulkUpdateUserRoles(users);
    
    // Update UI to reflect the changes
    updateUI(updatedUsers);
   // Log the success of the bulk update using the Logger class
     Logger.log('INFO', 'User roles updated successfully');

    // Dispatch success action for bulk update
    UserRoleActions.updateUserRolesSuccess({
       users: updatedUsers // Assuming updatedUsers is returned from the bulk update service method
    });
    sendNotification('User roles updated successfully');
    
    return updatedUsers;
  } catch (error) {
    // Dispatch failure action for bulk update
    UserRoleActions.updateUserRolesFailure({ error: String(error) });
    sendNotification(`Error updating user roles: ${error}`);
    console.error('Error updating user roles:', error);
    throw error;
  }
};

  // Assign project ownership to a user
  assignProjectOwner = async (userId: User["id"], projectId: string) => {
    try {
      // Implement logic to assign project ownership
      const assignProjectOwnerEndpoint = dotProp.getProperty(
        API_BASE_URL,
        "assignProjectOwner",
        [userId as number, projectId]
      ) as string;
      if (!assignProjectOwnerEndpoint) {
        throw new Error("Assign project ownership endpoint not found");
      }
      const response = await axiosInstance.put(assignProjectOwnerEndpoint);
      // Optionally handle any additional logic based on the response from the backend
      return response.data; // Return any relevant data from the backend response
    } catch (error) {
      // Handle project ownership assignment failure
      throw error;
    }
  };

  // Remove project ownership from a user
  removeProjectOwner = async (userId: User["id"], projectId: string) => {
    try {
      // Implement logic to remove project ownership
      const removeProjectOwnerEndpoint = dotProp.getProperty(
        API_BASE_URL,
        "removeProjectOwner",
        [userId as number, projectId]
      ) as string;
      if (!removeProjectOwnerEndpoint) {
        throw new Error("Remove project ownership endpoint not found");
      }
      const response = await axiosInstance.put(removeProjectOwnerEndpoint);
      // Optionally handle any additional logic based on the response from the backend
      return response.data; // Return any relevant data from the backend response
    } catch (error) {
      // Handle project ownership removal failure
      throw error;
    }
  };

  // Ensure NFT reflects user role accurately
  updateNFTUserRole = async (userId: User["id"], role: string) => {
    try {
      // Implement logic to update the user's NFT to reflect their role
      const updateNFTUserRoleEndpoint = dotProp.getProperty(
        API_BASE_URL,
        "updateNFTUserRole",
        [userId as number, role]
      ) as string;
      if (!updateNFTUserRoleEndpoint) {
        throw new Error("Update NFT user role endpoint not found");
      }
      const response = await axiosInstance.put(updateNFTUserRoleEndpoint);
      // Optionally handle any additional logic based on the response from the backend
      return response.data; // Return any relevant data from the backend response
    } catch (error) {
      // Handle NFT update failure
      throw error;
    }
  };

  updateUserRole = async (userId: User["id"], role: User["role"]) => {
    try {
      const updateRoleEndpoint = dotProp.getProperty(
        API_BASE_URL,
        "updateRole",
        [userId as number]
      ) as string;
      if (!updateRoleEndpoint) {
        throw new Error("Update role endpoint not found");
      }
      const response = await axiosInstance.put(updateRoleEndpoint, { role });
      const updatedUser = response.data;
      UserActions.updateUserRoleSuccess({ user: updatedUser });
      sendNotification(`User with ID ${userId} updated successfully`);
      return updatedUser;
    } catch (error) {
      UserActions.updateUserRoleFailure({ error: String(error) });
      sendNotification(`Error updating user with ID ${userId}: ${error}`);
      console.error("Error updating user:", error);
      throw error;
    }
  };

  bulkUpdateUserRoles = async (usersWithUpdatedRoles: {
    userId: User["id"];
    role: User["role"];
  }): Promise<User[]> => {
    try {
      const bulkUpdateRoleEndpoint = dotProp.getProperty(
        API_BASE_URL,
        "bulkUpdateRoles"
      ) as string;
      if (!bulkUpdateRoleEndpoint) {
        throw new Error("Bulk update roles endpoint not found");
      }
      const response = await axiosInstance.put(bulkUpdateRoleEndpoint, {
        users: usersWithUpdatedRoles,
      });
      return response.data;
    } catch (error) {
      UserActions.bulkUpdateUserRolesFailure({ error: String(error) });
    }
    return [];
  };



}

export const userService = new UserService();
export default UserService;
export type {UserProfile}