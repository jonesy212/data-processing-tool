import React from 'react';
import { generateNFT } from '@/app/generators/NFTGenerator';
import UserRoles from './UserRoles';
import { UserRole } from './UserRole';

const PermissionsEditor: React.FC = () => {
  const assignNFT = () => {
    // Simulate assigning NFTs to users
    const nft = generateNFT();
    console.log("Assigned NFT:", nft);
  };

  return (
    <div>
      <h2>Permissions Editor</h2>
      <button onClick={assignNFT}>Assign NFT</button>
      <h3>User Roles</h3>
      <ul>
      {Object.values(UserRoles).map((role: UserRole) => (
          <li key={role.roleType.toString()}> {/* Use roleType as key */}
              <strong>{typeof role.roleType === 'string' ? role.roleType : role.roleType.toString()}</strong> {/* Display roleType */}
              <ul>
              <li>Responsibilities: {role.responsibilities.join(", ")}</li>
              <li>Permissions: {role.permissions.join(", ")}</li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};
export { PermissionsEditor }; // Export PermissionsEditor as a named export
