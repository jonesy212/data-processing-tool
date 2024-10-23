import { User } from '@/app/components/users/User';
import PersonaTypeEnum from '@/app/pages/personas/PersonaBuilder';
import CommonDetails from '../models/CommonData';
import { UserRole } from './UserRole';
import { userService } from './ApiUser';

class UserManagement {
 

  // Fetch user by ID
  fetchUser = async (userId: User['id']) => {
    try {
      const user = await userService.fetchUser(userId);
      // Handle user fetch success
      return user;
    } catch (error) {
      // Handle user fetch failure
      throw error;
    }
  };

  // Update user data
   updateUser = async (userId: User['id'], updatedUserData: Partial<User>) => {
    try {
      const updatedUser = await userService.updateUser(userId, updatedUserData as User);
      // Handle user update success
      return updatedUser;
    } catch (error) {
      // Handle user update failure
      throw error;
    }
  };

  // Delete user by ID
  deleteUser = async (userId: User['id']) => {
    try {
      await userService.deleteUser(userId as unknown as User);
      // Handle user deletion success
    } catch (error) {
      // Handle user deletion failure
      throw error;
    }
  };

  // Fetch list of users
  fetchUsers = async () => {
    try {
      const users = await userService.fetchUsers();
      // Handle users fetch success
      return users;
    } catch (error) {
      // Handle users fetch failure
      throw error;
    }
  };

  // Search users by criteria
  searchUsers = async (criteria: string) => {
    try {
      const users = await userService.searchUsers(criteria);
      // Handle search users success
      return users;
    } catch (error) {
      // Handle search users failure
      throw error;
    }
  };

  // Create new user
  createUser = async (userData: Partial<User>) => {
    const persona: User['persona'] = {
      type: PersonaTypeEnum.CasualUser,
      id: '',
      name: '',
      age: 0,
      gender: ''
    };
    try {
      // Ensure all required properties are provided with default values
      const newUser: User = {
        _id: "",
        id: "",
        username: "",
        email: "",
        tier: "",
        token: null,
        uploadQuota: 0,
        usedQuota: undefined, // Add missing prop with default value
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: undefined, // Add missing prop with default value
        fullName: null,
        isVerified: false, // Add missing prop with default value
        isAdmin: false, // Add missing prop with default value
        isActive: false, // Add missing prop with default value
        bio: null,
        userType: "",
        hasQuota: false,
        profilePicture: null,
        processingTasks: [],
        data: undefined, // Add missing prop with default value
        role: {} as UserRole,
        persona: persona,
        analysisResults: [], // Add missing prop with default value
        isLoggedIn: false, // Add missing prop with default value
        ...userData,
      };
      
      const createdUser = await userService.createUser(newUser);
      // Handle create user success
      return createdUser;
    } catch (error) {
      // Handle create user failure
      throw error;
    }
  };
// Assign role to user
assignUserRole = async (userId: User['id'], role: string) => {
  try {
    // Retrieve the user object based on the userId
    const user = await userService.fetchUser(userId);

    // Update the user's role
    user.role = role;

    // Call the updateUser method to save the changes
    await this.updateUser(userId, user);

    // Optionally, return the updated user
    return user;
  } catch (error) {
    // Handle role assignment failure
    throw error;
  }
};


  updateUserRole = async (userId: User['id'], newRole: UserRole) => {
    try {
      // Call a service or API endpoint to update the user's role
      const response = await userService.updateUserRole(userId, newRole);
      
      // Optionally, handle any additional logic based on the response from the backend
  
      return response; // Return any relevant data from the backend response
    } catch (error) {
      // Handle role update failure
      throw error;
    }
  };


  updateUserRoles = async (users: {
    userId: string | number;
    role: UserRole;
  }) => {
    try {
      // Call service method to bulk update user roles
      await userService.bulkUpdateUserRoles(users);

    }
    catch (error) {
      throw error;
    }
  }




  // Assign project ownership to a user
  assignProjectOwner = async (userId: User['id'], projectId: string) => {
    try {
      // Implement logic to assign project ownership
    } catch (error) {
      // Handle project ownership assignment failure
      throw error;
    }
  };

  // Remove project ownership from a user
  removeProjectOwner = async (userId: User['id'], projectId: string) => {
    try {
      // Implement logic to remove project ownership
    } catch (error) {
      // Handle project ownership removal failure
      throw error;
    }
  };
  

  // Ensure NFT reflects user role accurately
  updateNFTUserRole = async (userId: User['id'], role: string) => {
    try {
      // Implement logic to update the user's NFT to reflect their role
    } catch (error) {
      // Handle NFT update failure
      throw error;
    }
  };
}

export default UserManagement;
