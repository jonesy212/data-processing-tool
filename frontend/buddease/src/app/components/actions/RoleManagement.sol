// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RoleManagement {
    // Define the NFT contract address
    address public nftContract;

    // Define enum for roles
    enum Role { None, Role1, Role2, Role3 }

    // Mapping to store user roles
    mapping(address => Role) public userRoles;

    // Event emitted when a role is assigned to a user
    event RoleAssigned(address indexed user, Role role);

    // Constructor to set the NFT contract address
    constructor(address _nftContract) {
        nftContract = _nftContract;
    }

    // Function to assign roles to users based on NFT ownership
    function assignRole(address _user, uint256 _tokenId) external {
        require(msg.sender == nftContract, "Only NFT contract can call this function");
        
        // Implement logic to determine role based on NFT ownership
        // Example: Check NFT ownership and assign corresponding role
        Role role = Role.None; // Initialize with default role
        
        // Logic to determine role based on _tokenId
        // For example, check NFT ownership and assign roles accordingly
        // ...

        userRoles[_user] = role; // Assign the role to the user

        emit RoleAssigned(_user, role); // Emit event
    }

    // Function to check if a user has a specific role
    function hasRole(address _user, Role _role) external view returns (bool) {
        return userRoles[_user] == _role;
    }
}









// #review
// In this contract:

// The nftContract variable stores the address of the NFT contract.
// The Role enum defines different roles that users can have.
// The userRoles mapping stores the roles assigned to each user.
// The assignRole function assigns roles to users based on NFT ownership. It can only be called by the NFT contract.
// The hasRole function checks if a user has a specific role by querying the userRoles mapping.
// Please note that the actual logic to determine roles based on NFT ownership needs to be 
// implemented in the assignRole function as per your project requirements. Additionally, you'll need to deploy this contract and interact with it using a web3-enabled application to assign roles and check role ownership.