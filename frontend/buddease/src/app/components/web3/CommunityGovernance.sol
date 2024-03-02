//CommunityGovernance.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CommunityGovernance {
    address public admin;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    event NewProposal(uint256 indexed proposalId, string description, address indexed proposer);
    event VoteCasted(uint256 indexed proposalId, address indexed voter, bool supportsProposal);
    event ProposalExecuted(uint256 indexed proposalId);

    // NFT contract address for role management
    address public nftContract;

    // Role definitions
    enum Role { Freelancer, ProjectOwner, Moderator }

    // Mapping of address to role
    mapping(address => Role) public userRoles;

    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor(address _nftContract) {
        admin = msg.sender;
        nftContract = _nftContract;
    }

    function createProposal(string memory _description) external onlyAdmin {
        uint256 proposalId = proposalCount++;
        proposals[proposalId] = Proposal(_description, 0, 0, false);
        emit NewProposal(proposalId, _description, msg.sender);
    }

    function vote(uint256 _proposalId, bool _supportsProposal) external {
        require(!proposals[_proposalId].executed, "Proposal already executed");
        
        if (_supportsProposal) {
            proposals[_proposalId].yesVotes++;
        } else {
            proposals[_proposalId].noVotes++;
        }
        emit VoteCasted(_proposalId, msg.sender, _supportsProposal);
    }

    function executeProposal(uint256 _proposalId) external onlyAdmin {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");

        if (proposal.yesVotes > proposal.noVotes) {
            // Execute proposal logic
            proposal.executed = true;
            emit ProposalExecuted(_proposalId);
        }
    }

    // Function to assign roles to users based on NFT ownership
    function assignRole(address _user, uint256 _tokenId) external {
        require(msg.sender == nftContract, "Only NFT contract can call this function");
        
        // Implement logic to determine role based on NFT ownership
        // Example: Check NFT ownership and assign corresponding role
        Role role;
        // Logic to determine role based on _tokenId
        // ...
        userRoles[_user] = role;
    }

    // Function to check if a user has a specific role
    function hasRole(address _user, Role _role) external view returns (bool) {
        return userRoles[_user] == _role;
    }
}
