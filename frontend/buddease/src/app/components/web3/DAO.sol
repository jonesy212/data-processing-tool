// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Proposal struct representing a proposal for voting
struct Proposal {
    string description;
    uint256 forVotes;
    uint256 againstVotes;
    bool executed;
}

// DAO contract
contract DAO is Ownable {
    IERC20 public governanceToken; // Token used for voting
    uint256 public proposalDuration; // Duration (in seconds) for which a proposal is open
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    event NewProposal(uint256 proposalId, string description);
    event VoteCasted(uint256 proposalId, bool inSupport, address voter);
    event ProposalExecuted(uint256 proposalId);

    constructor(address _governanceToken, uint256 _proposalDuration) {
        governanceToken = IERC20(_governanceToken);
        proposalDuration = _proposalDuration;
    }

    // Function to create a new proposal
    function createProposal(string memory _description) external onlyOwner {
        uint256 proposalId = proposalCount++;
        proposals[proposalId] = Proposal(_description, 0, 0, false);
        emit NewProposal(proposalId, _description);
    }

    // Function to cast a vote on a proposal
    function castVote(uint256 _proposalId, bool _inSupport) external {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal has already been executed");
        require(block.timestamp < proposalDuration + proposal.creationTime, "Voting has ended");

        if (_inSupport) {
            proposal.forVotes += governanceToken.balanceOf(msg.sender);
        } else {
            proposal.againstVotes += governanceToken.balanceOf(msg.sender);
        }

        emit VoteCasted(_proposalId, _inSupport, msg.sender);
    }

    // Function to execute a proposal if it has enough votes
    function executeProposal(uint256 _proposalId) external onlyOwner {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal has already been executed");
        require(block.timestamp >= proposalDuration + proposal.creationTime, "Voting is still ongoing");

        // Check if the proposal has enough votes
        if (proposal.forVotes > proposal.againstVotes) {
            // Execute the proposal (implement your logic here)
            proposal.executed = true;
            emit ProposalExecuted(_proposalId);
        }
    }
}
