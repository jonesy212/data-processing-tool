import React, { useState } from 'react';
import PermissionsEditor from './PermissionsEditor';



interface UserRoleEditorProps extends  PermissionsEditor{
  roleName: string;
  permissions: string[];
}
// UserRolesEditor component
const UserRolesEditor: React.FC<UserRoleEditorProps> = ({ roleName, permissions }) => {
  const [userRoles, setUserRoles] = useState([]);

  // Function to handle adding a new user role
  const handleAddUserRole = () => {
    // Logic to add a new user role
    // Example:
    setUserRoles([...userRoles, { roleName: 'New Role', permissions: [] }]);
  };

  return (
    <div>
      <h2>User Roles Editor</h2>
      <button onClick={handleAddUserRole}>Add New Role</button>
      {/* Render user roles */}
      <ul>
        {userRoles.map((role, index) => (
          <li key={index}>
            <span>{role.roleName}</span>
            {/* Render PermissionsEditor for each role */}
            <PermissionsEditor permissions={role.permissions} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export { UserRolesEditor };
