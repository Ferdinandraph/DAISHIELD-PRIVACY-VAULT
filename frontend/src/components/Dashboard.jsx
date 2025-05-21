import { useState, useEffect } from 'react';
import { FaWallet, FaLock, FaVoteYea, FaChartLine, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { Tooltip } from 'react-tooltip';
import GovernanceABI from '../abis/Governance.json';
import VaultABI from '../abis/Vault.json';
import { ethers } from 'ethers'

const GOVERNANCE_ADDRESS = import.meta.env.VITE_GOVERNANCE_ADDRESS; // Replace with deployed Governance address
const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS; // Replace with deployed Vault address

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: 11155111, // Sepolia
  });

  // Read vault balance
  const { data: vaultBalance, isLoading: vaultBalanceLoading } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultABI,
    functionName: 'getBalance',
    args: [address],
    chainId: 11155111,
  });

  // Read active proposals
  const { data: proposals, isLoading: proposalsLoading } = useReadContract({
    address: GOVERNANCE_ADDRESS,
    abi: GovernanceABI,
    functionName: 'getActiveProposals',
    chainId: 11155111,
  });

  const vaultData = {
    totalDeposited: vaultBalance ? `${ethers.formatEther(vaultBalance)} mDAI` : '0 mDAI',
    pendingWithdrawals: '0 mDAI', // Add contract function if needed
    privacyScore: 85, // Static for now
  };

  useEffect(() => {
    console.log('Dashboard render:', {
      isConnected,
      address,
      balance: balance?.formatted,
      vaultBalance: vaultBalance ? ethers.formatEther(vaultBalance) : '0',
      proposals: proposals || [],
      timestamp: new Date().toISOString(),
    });
  }, [isConnected, address, balance, vaultBalance, proposals]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-neutral-gradient flex flex-col justify-center items-center px-4">
        <p className="text-lg dark:text-accent-gold text-neutral-dark animate-fade-in text-center">
          Please connect your wallet to view the dashboard.
        </p>
        <Link
          to="/"
          className="mt-4 text-sm font-inter dark:text-accent-gold text-neutral-dark bg-neutral-dark/10 hover:bg-neutral-gray/30 px-4 py-2 rounded-lg shadow-celestial transition-all duration-300 hover:scale-105"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-gradient py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl shadow-celestial p-8 mb-8 animate-slide-in">
          <h1 className="text-3xl md:text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark tracking-tight">
            DaiShield Dashboard
          </h1>
          <p className="text-base dark:text-neutral-gray text-neutral-text mt-2 font-poppins">
            Manage your private vault and governance activities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-6 shadow-celestial animate-slide-in hover:shadow-celestial-hover hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center space-x-3">
              <FaWallet className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
              <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
                Wallet
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm dark:text-neutral-gray text-neutral-text">
                Address:{' '}
                <span
                  className="font-mono cursor-pointer dark:text-accent-gold text-neutral-dark"
                  data-tooltip-id="wallet-address"
                  data-tooltip-content={address}
                >
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Tooltip id="wallet-address" place="top" className="bg-neutral-dark/90 text-accent-gold" />
              </p>
              <p className="text-sm dark:text-neutral-gray text-neutral-text flex items-center">
                Balance:{' '}
                {balanceLoading ? (
                  <FaSpinner className="ml-2 w-4 h-4 dark:text-neutral-gray text-neutral-text animate-spin" />
                ) : (
                  <span className="dark:text-accent-gold text-neutral-dark ml-2">{balance?.formatted} SEP</span>
                )}
              </p>
            </div>
          </div>

          <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-6 shadow-celestial animate-slide-in hover:shadow-celestial-hover hover:scale-[1.02] transition-all duration-300 lg:col-span-2">
            <div className="flex items-center space-x-3">
              <FaLock className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
              <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
                Privacy Vault
              </h2>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm dark:text-neutral-gray text-neutral-text">Total Deposited</p>
                <p className="text-lg font-inter dark:text-accent-gold text-neutral-dark">{vaultData.totalDeposited}</p>
              </div>
              <div>
                <p className="text-sm dark:text-neutral-gray text-neutral-text">Pending Withdrawals</p>
                <p className="text-lg font-inter dark:text-accent-gold text-neutral-dark">{vaultData.pendingWithdrawals}</p>
              </div>
              <div>
                <p className="text-sm dark:text-neutral-gray text-neutral-text">Privacy Score</p>
                <p className="text-lg font-inter dark:text-accent-gold text-neutral-dark">{vaultData.privacyScore}/100</p>
              </div>
            </div>
            <Link
              to="/vault/deposit"
              className="mt-6 inline-block text-sm font-inter dark:text-neutral-white text-neutral-dark bg-button-gradient hover:bg-neutral-gray/50 px-6 py-3 rounded-lg shadow-celestial transition-all duration-300 hover:scale-105"
            >
              Deposit to Vault
            </Link>
          </div>
        </div>

        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-6 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaVoteYea className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
            <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
              Governance
            </h2>
          </div>
          <p className="text-sm dark:text-neutral-gray text-neutral-text mt-4 mb-6">
            Participate in DaiShield’s governance by voting on proposals.
          </p>
          <div className="space-y-4">
            {proposalsLoading ? (
              <FaSpinner className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-spin mx-auto" />
            ) : proposals && proposals.length > 0 ? (
              proposals.map((proposal, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-neutral-dark/10 dark:bg-neutral-dark/20 p-4 rounded-lg hover:bg-neutral-gray/20 transition-all duration-200 hover:scale-[1.01]"
                >
                  <div>
                    <p className="text-base font-inter dark:text-accent-gold text-neutral-dark">{proposal.title}</p>
                    <p className="text-xs dark:text-neutral-gray text-neutral-text">
                      Status: <span className="font-semibold">{proposal.isActive ? 'Active' : 'Closed'}</span> | Votes: {proposal.forVotes + proposal.againstVotes}
                    </p>
                  </div>
                  <Link
                    to="/governance/proposals"
                    className="text-sm font-inter dark:text-accent-gold text-neutral-dark hover:text-neutral-text px-4 py-2 rounded-lg hover:bg-neutral-gray/30 transition-all duration-200"
                  >
                    View
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm dark:text-neutral-gray text-neutral-text">No active proposals.</p>
            )}
          </div>
          <Link
            to="/governance/proposals"
            className="mt-6 inline-block text-sm font-inter dark:text-neutral-white text-neutral-dark bg-button-gradient hover:bg-neutral-gray/50 px-6 py-3 rounded-lg shadow-celestial transition-all duration-300 hover:scale-105"
          >
            View All Proposals
          </Link>
        </div>

        <div className="mt-8 bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-6 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaChartLine className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
            <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">Analytics</h2>
          </div>
          <p className="text-sm dark:text-neutral-gray text-neutral-text mt-4">
            Advanced vault and governance analytics coming soon.
          </p>
          <Link
            to="/analytics"
            className="mt-4 inline-block text-sm font-inter dark:text-neutral-white text-neutral-dark bg-button-gradient hover:bg-neutral-gray/50 px-6 py-3 rounded-lg shadow-celestial transition-all duration-300 hover:scale-105"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;