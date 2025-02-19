import React, { useState } from 'react';
import UserRoles from './UserRoles';
import { UserRole } from './UserRole';

interface PermissionsEditorProps {
  permissions: string[]; // Define props accepted by PermissionsEditor
}

interface UserRoleEditorProps extends PermissionsEditorProps {
  roleName: string;
}



const UserRolesEditor: React.FC<UserRoleEditorProps> = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  // Function to handle adding a new user role
  const handleAddUserRole = () => {
    // Logic to add a new user role
    // Example:
    setUserRoles([...userRoles, { role: 'New Role', responsibilities: [], permissions: [], positions: [], salary: 0 }]);
  };

  return (
    <div>
      <h2>User Roles Editor</h2>
      <button onClick={handleAddUserRole}>Add New Role</button>
      {/* Render user roles */}
      <ul>
        {/* Iterate over keys of UserRoles object */}
        {Object.keys(UserRoles).map((roleKey, index) => {
          const role = UserRoles[roleKey as keyof typeof UserRoles]; // Access role object
          return (
            <li key={index}>
              <span>{role.role}</span>
              {/* Render role details */}
              <ul>
                <li>Responsibilities: {role.responsibilities.join(', ')}</li>
                <li>Permissions: {role.permissions.join(', ')}</li>
                <li>Salary: {role.salary}</li>
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserRolesEditor;