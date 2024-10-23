// UserManagementComponent.tsx
import { User } from '@/app/components/users/User'; // Adjust import path as needed
import React, { useEffect, useState } from "react";
import UserManagement from '../UserManagement';
import { UserRole } from '../UserRole';

const UserManagementComponent = () => {
  const userManagement = new UserManagement(); // Initialize UserManagement

  // State variables
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [selectedRole, setSelectedRole] = useState<string>('');

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch list of users
  const fetchUsers = async () => {
    try {
      const fetchedUsers = await userManagement.fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Select a user
  const selectUser = (user: User) => {
    setSelectedUser(user);
  };

  // Update user data
  const updateUser = async (userId: string, updatedUserData: Partial<User>) => {
    try {
      await userManagement.updateUser(userId, updatedUserData);
      // Refresh user list after update
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      await userManagement.deleteUser(userId);
      // Refresh user list after deletion
      fetchUsers();
      setSelectedUser(null); // Clear selected user after deletion
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Create new user
  const createUser = async () => {
    try {
      await userManagement.createUser(newUser);
      // Refresh user list after creation
      fetchUsers();
      setNewUser({}); // Clear new user data after creation
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Assign role to user
  const assignUserRole = async (userId: string, role: string) => {
    try {
      await userManagement.assignUserRole(userId, role);
      // Refresh user list after role assignment
      fetchUsers();
    } catch (error) {
      console.error('Error assigning role to user:', error);
    }
  };

  // Update user role
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await userManagement.updateUserRole(userId, newRole);
      // Refresh user list after role update
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

    
    
    
  const handleAssignProjectOwner = async (userId: string, projectId: string) => {
    try {
      await userManagement.assignProjectOwner(userId, projectId);
      // Handle project owner assignment success
    } catch (error) {
      // Handle project owner assignment failure
    }
  };

  const handleRemoveProjectOwner = async (userId: string, projectId: string) => {
    try {
      await userManagement.removeProjectOwner(userId, projectId);
      // Handle project owner removal success
    } catch (error) {
      // Handle project owner removal failure
    }
  };
    
    
  // Render user profile details
  const renderUserProfile = () => {
    if (!selectedUser) return null;
    return (
      <div>
        <h2>User Profile</h2>
        <p>ID: {selectedUser.id}</p>
        <p>Username: {selectedUser.username}</p>
        {/* Render other user profile details */}
      </div>
    );
  };

  // Render user list
  const renderUserList = () => (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map(user => (
          <li key={user.id} onClick={() => selectUser(user)}>
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );

  // Render user management form
  const renderUserManagementForm = () => (
    <div>
      <h2>Create New User</h2>
      <input
        type="text"
        placeholder="Username"
        value={newUser.username || ''}
        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
      />
      {/* Add input fields for other user details */}
      <button onClick={createUser}>Create User</button>
    </div>
  );

  // Render role assignment form
  const renderRoleAssignmentForm = () => {
    const projectId = "123";

    return (
      <div>
        <h2>Assign Role</h2>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <button
          onClick={() =>
            assignUserRole(selectedUser?.id as string, selectedRole)
          }
        >
          Assign Role
        </button>
        <button
          onClick={() =>
            handleAssignProjectOwner(selectedUser?.id as string, projectId)
          }
        >
          Assign Project Owner
        </button>
        <button
          onClick={() =>
            handleRemoveProjectOwner(selectedUser?.id as string, projectId)
          }
        >
          Remove Project Owner
        </button>
      </div>
    );
  };

  return (
    <div>
      {renderUserProfile()}
      {renderUserList()}
      {renderUserManagementForm()}
      {renderRoleAssignmentForm()}
    </div>
  );
};

export default UserManagementComponent;
