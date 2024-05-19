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
        {UserRoles.map((role: UserRole) => (
          <li key={role.role}>
            <strong>{role.role}</strong>
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
