const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts to Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  // Deploy MockDAI
  const MockDAI = await ethers.getContractFactory("MockDAI");
  const initialSupply = ethers.parseEther("10000"); // 10,000 mDAI
  const mockDai = await MockDAI.deploy(initialSupply);
  const mockDaiReceipt = await mockDai.deploymentTransaction().wait();
  console.log("MockDAI deployed to:", mockDai.target);
  console.log("MockDAI transaction:", mockDaiReceipt.hash);
  console.log("MockDAI block number:", mockDaiReceipt.blockNumber);

  // Deploy Governance
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy();
  const governanceReceipt = await governance.deploymentTransaction().wait();
  console.log("Governance deployed to:", governance.target);
  console.log("Governance transaction:", governanceReceipt.hash);
  console.log("Governance block number:", governanceReceipt.blockNumber);

  // Deploy Vault
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(mockDai.target, governance.target);
  const vaultReceipt = await vault.deploymentTransaction().wait();
  console.log("Vault deployed to:", vault.target);
  console.log("Vault transaction:", vaultReceipt.hash);
  console.log("Vault block number:", vaultReceipt.blockNumber);

  // Transfer some mDAI to deployer for testing
  await mockDai.transfer(deployer.address, ethers.parseEther("1000"));
  console.log("Transferred 1000 mDAI to deployer:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error);
    process.exit(1);
  });