pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Governance is Ownable {
    enum VoteChoice { None, For, Against }
    enum ProposalStatus { Active, Closed }

    struct Proposal {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 endTime;
        ProposalStatus status;
        uint256 votesFor;
        uint256 votesAgainst;
        bool passed;
    }

    struct Vote {
        uint256 proposalId;
        VoteChoice choice;
        uint256 timestamp;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => VoteChoice)) public userVotes;
    mapping(address => Vote[]) public userVoteHistory;
    uint256 public proposalCount;

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed creator,
        string title,
        string description,
        uint256 endTime
    );
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        VoteChoice choice,
        uint256 timestamp
    );
    event ProposalClosed(uint256 indexed proposalId, bool passed);

    constructor() Ownable(msg.sender) {
        proposalCount = 0;
    }

    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _duration
    ) external {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_duration >= 1 days, "Duration must be at least 1 day");
        require(balanceOf(msg.sender) > 0, "Must have balance to propose");

        proposalCount++;
        uint256 endTime = block.timestamp + _duration;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            creator: msg.sender,
            title: _title,
            description: _description,
            endTime: endTime,
            status: ProposalStatus.Active,
            votesFor: 0,
            votesAgainst: 0,
            passed: false
        });

        emit ProposalCreated(proposalCount, msg.sender, _title, _description, endTime);
    }

    function vote(uint256 _proposalId, bool _voteFor) external {
        Proposal storage proposal = proposals[_proposalId];
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        require(proposal.status == ProposalStatus.Active, "Proposal is not active");
        require(block.timestamp <= proposal.endTime, "Voting period has ended");
        require(userVotes[msg.sender][_proposalId] == VoteChoice.None, "Already voted");
        require(balanceOf(msg.sender) > 0, "Must have balance to vote");

        VoteChoice choice = _voteFor ? VoteChoice.For : VoteChoice.Against;
        userVotes[msg.sender][_proposalId] = choice;
        userVoteHistory[msg.sender].push(Vote({
            proposalId: _proposalId,
            choice: choice,
            timestamp: block.timestamp
        }));

        if (_voteFor) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        emit Voted(_proposalId, msg.sender, choice, block.timestamp);
    }

    function closeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        require(proposal.status == ProposalStatus.Active, "Proposal is not active");
        require(block.timestamp > proposal.endTime, "Voting period not ended");

        proposal.status = ProposalStatus.Closed;
        proposal.passed = proposal.votesFor > proposal.votesAgainst;
        emit ProposalClosed(_proposalId, proposal.passed);
    }

    function getProposal(uint256 _proposalId) external view returns (Proposal memory) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        return proposals[_proposalId];
    }

    function getUserVotes(address _user) external view returns (Vote[] memory) {
        return userVoteHistory[_user];
    }

    function getActiveProposals() external view returns (Proposal[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].status == ProposalStatus.Active && block.timestamp <= proposals[i].endTime) {
                activeCount++;
            }
        }

        Proposal[] memory activeProposals = new Proposal[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].status == ProposalStatus.Active && block.timestamp <= proposals[i].endTime) {
                activeProposals[index] = proposals[i];
                index++;
            }
        }
        return activeProposals;
    }

    function balanceOf(address _user) internal view returns (uint256) {
        return _user.balance; // Mock: Use ETH balance for simplicity
    }
}