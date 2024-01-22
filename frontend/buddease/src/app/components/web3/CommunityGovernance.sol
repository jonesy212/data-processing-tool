// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CommunityGovernance {
    address public admin;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    event NewProposal(uint256 proposalId, string description);

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

    constructor() {
        admin = msg.sender;
    }

    function createProposal(string memory _description) external onlyAdmin {
        uint256 proposalId = proposalCount++;
        proposals[proposalId] = Proposal(_description, 0, 0, false);
        emit NewProposal(proposalId, _description);
    }

    function vote(uint256 _proposalId, bool _supportsProposal) external {
        require(!proposals[_proposalId].executed, "Proposal already executed");
        
        if (_supportsProposal) {
            proposals[_proposalId].yesVotes++;
        } else {
            proposals[_proposalId].noVotes++;
        }
    }

    function executeProposal(uint256 _proposalId) external onlyAdmin {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");

        if (proposal.yesVotes > proposal.noVotes) {
            // Execute proposal logic
            proposal.executed = true;
        }
    }
}
