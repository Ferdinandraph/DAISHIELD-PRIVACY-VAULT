DaiShield: Privacy Vault for DAI
Tagline: Privacy Meets Power: Secure DAI with DaiShield
Elevator Pitch
Imagine a world where your financial transactions are private, secure, and community-driven. DaiShield is a decentralized platform on Ethereum that lets you deposit, withdraw, and transfer DAI privately using zero-knowledge proofs, shielding your financial data from prying eyes. With built-in governance, users propose and vote on protocol upgrades, ensuring true decentralization. Our intuitive interface, with analytics and customizable themes, makes privacy accessible to everyone. Deployed on Sepolia, DaiShield empowers users to control their finances with confidence. Join us to redefine privacy in DeFi!
Overview
DaiShield is a decentralized application (dApp) designed to enhance privacy for DAI transactions on the Ethereum blockchain (Sepolia testnet). By leveraging zero-knowledge proofs (ZKPs), DaiShield enables private deposits, withdrawals, and transfers of MockDAI (mDAI). The platform includes decentralized governance for community-driven protocol management and analytics for tracking user activity. With a user-friendly interface featuring light/dark themes and a responsive mobile design, DaiShield makes privacy accessible to all.
Features

Privacy Vault: 
Deposit mDAI into a shielded pool using ZKPs.
Withdraw mDAI privately to any address.
Execute private transactions between users.


Decentralized Governance: 
Create and vote on proposals to upgrade the protocol.
View voting history and proposal outcomes.


Analytics Dashboard: 
Track deposits, withdrawals, and governance activity.
Visualize transaction and voting trends.


User-Friendly Interface: 
Light theme by default for new users, with dark theme toggle.
Responsive mobile navbar for seamless navigation.
Wallet integration via RainbowKit (MetaMask, WalletConnect).


Testnet Deployment: 
Fully functional on Sepolia with MockDAI.



Tech Stack

Frontend: 
React, Vite, Tailwind CSS
wagmi (Ethereum interactions)
RainbowKit (wallet integration)


Smart Contracts: 
Solidity (Vault, MockDAI, Governance)
Hardhat (development, testing, deployment)


Blockchain: 
Ethereum Sepolia testnet


Privacy: 
Zero-knowledge proofs (ZK-SNARKs or similar)


Dependencies:
@rainbow-me/rainbowkit, wagmi, ethers
react-router-dom, react-icons



Smart Contracts

Vault: 0x(address)
Handles private deposits, withdrawals, and transfers.


MockDAI (mDAI): 0x(address)
ERC-20 token for testing on Sepolia.


Governance: [Your Governance Contract Address]
Manages proposals and voting.



Setup Instructions
Prerequisites

Node.js (v18 or later)
MetaMask or WalletConnect (configured for Sepolia)
Sepolia ETH (via faucet, e.g., Infura Sepolia Faucet)
Git

Installation

Clone the Repository:
git clone https://github.com/Ferdinandraph/DAISHIELD-PRIVACY-VAULT.git
cd daishield


Install Dependencies:
npm install


Configure Environment:Create a .env file in frontend/:
VITE_VAULT_ADDRESS=[vault Address]
VITE_MDAI_ADDRESS=[mDAI address]
VITE_GOVERNANCE_ADDRESS=[Your Governance Address]
VITE_INFURA_API_KEY=[Your Infura Key]
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/[Your Infura Key]



Run the Frontend:
cd frontend
npm run dev

Open http://localhost:5173 in your browser.

(Optional) Deploy Contracts:

Configure Hardhat in contracts/:cd contracts
npm install


Update hardhat.config.js with your Sepolia provider and private key.
Deploy:npx hardhat run scripts/deploy.js --network sepolia





Usage

Connect Wallet:

Click "Connect Wallet" in the navbar.
Use MetaMask or WalletConnect on Sepolia.
Ensure you have Sepolia ETH and mDAI (faucet or transfer).


Privacy Vault:

Navigate to "Privacy Vault" > "Deposit" to shield mDAI.
Use "Withdraw" to retrieve mDAI privately.
Perform private transfers via "Private Transaction".


Governance:

Go to "Governance" > "Proposals" to create or view proposals.
Vote on active proposals in "Voting".
Check past votes in "Vote History".


Analytics:

Visit "Analytics" to view transaction and governance metrics.
Explore charts for deposits, withdrawals, and votes.


Theme Toggle:

Click the moon/sun icon to switch between light and dark themes.
New users see the light theme by default.



Demo

Live URL: [Your Deployed URL, e.g., https://daishield.vercel.app]




Testing

Frontend:
Light theme default for new users (clear localStorage to test).
Responsive mobile navbar (test at <768px).
Wallet integration (MetaMask, WalletConnect).


Contracts:
Deposit/withdraw mDAI via Vault.
Create/vote on proposals via Governance.


Tools:
Hardhat tests: npx hardhat test
Sepolia explorer



Future Improvements

Mainnet deployment.
Enhanced ZKP optimizations for faster transactions.
Additional analytics metrics (e.g., user growth, TVL).
Multi-chain support (e.g., Optimism, Arbitrum).

Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/xyz).
Commit changes (git commit -m 'Add xyz feature').
Push to the branch (git push origin feature/xyz).
Open a pull request.

License
MIT License. See LICENSE for details.
Acknowledgments

Inspired by privacy-focused DeFi protocols.
Built with ❤️ for the Ethereum community.

