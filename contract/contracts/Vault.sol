// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract Vault {
    IERC20 public daiToken;
    mapping(address => uint256) public balances;
    address public governance;

    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event PrivateTransaction(address indexed sender, address indexed recipient, uint256 amount, uint256 timestamp);

    constructor(address _daiToken, address _governance) {
        daiToken = IERC20(_daiToken);
        governance = _governance;
    }

    modifier onlyGovernance() {
        require(msg.sender == governance, "Only governance can call this function");
        _;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(daiToken.transferFrom(msg.sender, address(this), amount), "DAI transfer failed");
        balances[msg.sender] += amount;
        emit Deposited(msg.sender, amount, block.timestamp);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        require(daiToken.transfer(msg.sender, amount), "DAI transfer failed");
        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    function privateTransaction(address recipient, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(recipient != address(0), "Invalid recipient");
        balances[msg.sender] -= amount;
        balances[recipient] += amount;
        emit PrivateTransaction(msg.sender, recipient, amount, block.timestamp);
    }

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    // Governance can update DAI token address (e.g., for upgrades)
    function updateDaiToken(address newDaiToken) external onlyGovernance {
        daiToken = IERC20(newDaiToken);
    }
}