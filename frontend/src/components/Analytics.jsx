import { useEffect, useState } from 'react';
import { FaChartBar, FaSpinner } from 'react-icons/fa';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { toast, ToastContainer } from 'react-toastify';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import VaultABI from '../abis/Vault.json';
import MockDAIABI from '../abis/MockDAI.json';
import GovernanceABI from '../abis/Governance.json';
import { ethers } from 'ethers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
const GOVERNANCE_ADDRESS = import.meta.env.VITE_GOVERNANCE_ADDRESS;
const MDAI_ADDRESS = import.meta.env.VITE_MDAI_ADDRESS;

const Analytics = () => {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: 11155111, // Sepolia
  });

  // Read vault balance
  const { data: vaultBalance, isLoading: vaultBalanceLoading, isError: vaultBalanceError } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultABI,
    functionName: 'getBalance',
    args: [address],
    chainId: 11155111,
  });

  // Read allowance
  const { data: allowance, isError: allowanceError } = useReadContract({
    address: MDAI_ADDRESS,
    abi: MockDAIABI,
    functionName: 'allowance',
    args: [address, VAULT_ADDRESS],
    chainId: 11155111,
  });

  // Read active proposals count
  const { data: proposals, isLoading: proposalsLoading, isError: proposalsError } = useReadContract({
    address: GOVERNANCE_ADDRESS,
    abi: GovernanceABI,
    functionName: 'getActiveProposals',
    chainId: 11155111,
  });

  // Initialize userAnalytics with defaults
  const [userAnalytics, setUserAnalytics] = useState({
    deposits: { count: 0, volume: '0 mDAI' },
    withdrawals: { count: 0, volume: '0 mDAI' },
    transactions: { count: 0, volume: '0 mDAI' },
    proposalsCreated: 0,
    votesCast: 0,
  });

  useEffect(() => {
    if (vaultBalanceError) {
      toast.error('Failed to fetch vault balance.');
    }
    if (allowanceError) {
      toast.error('Failed to fetch allowance data.');
    }
    if (proposalsError) {
      toast.error('Failed to fetch proposals data.');
    }
    // Update userAnalytics based on fetched data
    setUserAnalytics({
      deposits: {
        count: vaultBalance ? 1 : 0, // Placeholder; replace with event data
        volume: vaultBalance ? `${ethers.formatEther(vaultBalance)} mDAI` : '0 mDAI',
      },
      withdrawals: { count: 0, volume: '0 mDAI' }, // Replace with event data
      transactions: { count: 0, volume: '0 mDAI' }, // Replace with event data
      proposalsCreated: 0, // Replace with Governance contract query
      votesCast: 0, // Replace with Governance contract query
    });
    console.log('Analytics render:', {
      isConnected,
      address,
      balance: balance?.formatted,
      vaultBalance: vaultBalance ? ethers.formatEther(vaultBalance) : '0',
      allowance: allowance ? ethers.formatEther(allowance) : '0',
      activeProposals: proposals ? proposals.length : 0,
      userAnalytics,
      timestamp: new Date().toISOString(),
    });
  }, [isConnected, address, balance, vaultBalance, allowance, proposals, vaultBalanceError, allowanceError, proposalsError]);

  const chartData = {
    labels: ['Deposits', 'Withdrawals', 'Transactions'],
    datasets: [
      {
        label: 'Activity Count',
        data: [
          userAnalytics.deposits.count,
          userAnalytics.withdrawals.count,
          userAnalytics.transactions.count,
        ],
        backgroundColor: ['#F4C107', '#DAA520', '#B8860B'],
        borderColor: ['#2D3748', '#2D3748', '#2D3748'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count',
          color: '#F9FAFB',
        },
        ticks: { color: '#F9FAFB' },
        grid: { color: '#6B7280' },
      },
      x: {
        title: {
          display: true,
          text: 'Activity Type',
          color: '#F9FAFB',
        },
        ticks: { color: '#F9FAFB' },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Your Vault Activity',
        color: '#F9FAFB',
        font: { size: 16 },
      },
    },
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-neutral-gradient flex flex-col justify-center items-center px-4">
        <p className="text-lg dark:text-accent-gold text-neutral-dark animate-fade-in text-center">
          Please connect your wallet to view analytics.
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
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover theme="dark" />
      <div className="max-w-7xl mx-auto">
        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl shadow-celestial p-8 mb-8 animate-slide-in">
          <h1 className="text-3xl md:text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark tracking-tight">
            Your Vault Analytics
          </h1>
          <p className="text-base dark:text-neutral-accent text-neutral-text mt-2 font-poppins">
            Monitor your activity and performance metrics for DaiShield Privacy Vault.
          </p>
        </div>

        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-6 mb-8 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaChartBar className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
            <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
              Your Wallet
            </h2>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-sm dark:text-neutral-accent text-neutral-text">
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
            <p className="text-sm dark:text-neutral-accent text-neutral-text flex items-center">
              Sepolia Balance:{' '}
              {balanceLoading ? (
                <FaSpinner className="ml-2 w-4 h-4 dark:text-neutral-accent text-neutral-text animate-spin" />
              ) : (
                <span className="dark:text-accent-gold text-neutral-dark ml-2">{balance?.formatted} SEP</span>
              )}
            </p>
            <p className="text-sm dark:text-neutral-accent text-neutral-text flex items-center">
              Vault Balance:{' '}
              {vaultBalanceLoading ? (
                <FaSpinner className="ml-2 w-4 h-4 dark:text-neutral-accent text-neutral-text animate-spin" />
              ) : (
                <span className="dark:text-accent-gold text-neutral-dark ml-2">
                  {vaultBalance ? ethers.formatEther(vaultBalance) : '0'} mDAI
                </span>
              )}
            </p>
            <p className="text-sm dark:text-neutral-accent text-neutral-text flex items-center">
              Vault Allowance:{' '}
              {allowanceError ? (
                <span className="text-red-500 ml-2">Error</span>
              ) : (
                <span className="dark:text-accent-gold text-neutral-dark ml-2">
                  {allowance ? ethers.formatEther(allowance) : '0'} mDAI
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-6 mb-8 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaChartBar className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
            <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
              Your Vault Activity
            </h2>
          </div>
          <p className="text-sm dark:text-neutral-accent text-neutral-text mt-4 mb-6">
            Overview of your deposits, withdrawals, and private transactions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-neutral-dark/10 dark:bg-neutral-dark/20 p-4 rounded-lg">
              <p className="text-sm dark:text-neutral-accent text-neutral-text">Total Deposits</p>
              <p className="text-lg font-mono dark:text-accent-gold text-neutral-dark">
                {userAnalytics.deposits.count} ({userAnalytics.deposits.volume})
              </p>
            </div>
            <div className="bg-neutral-dark/10 dark:bg-neutral-dark/20 p-4 rounded-lg">
              <p className="text-sm dark:text-neutral-accent text-neutral-text">Total Withdrawals</p>
              <p className="text-lg font-mono dark:text-accent-gold text-neutral-dark">
                {userAnalytics.withdrawals.count} ({userAnalytics.withdrawals.volume})
              </p>
            </div>
            <div className="bg-neutral-dark/10 dark:bg-neutral-dark/20 p-4 rounded-lg">
              <p className="text-sm dark:text-neutral-accent text-neutral-text">Private Transactions</p>
              <p className="text-lg font-mono dark:text-accent-gold text-neutral-dark">
                {userAnalytics.transactions.count} ({userAnalytics.transactions.volume})
              </p>
            </div>
          </div>
          <div className="mt-6" style={{ height: '250px' }}>
            {vaultBalanceLoading || proposalsLoading ? (
              <p className="text-sm dark:text-neutral-accent text-neutral-text text-center">Loading chart...</p>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-6 mb-8 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaChartBar className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
            <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
              Your Governance Activity
            </h2>
          </div>
          <p className="text-sm dark:text-neutral-accent text-neutral-text mt-4 mb-6">
            Summary of your governance participation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-neutral-dark/10 dark:bg-neutral-dark/20 p-4 rounded-lg">
              <p className="text-sm dark:text-neutral-accent text-neutral-text">Proposals Created</p>
              <p className="text-lg font-mono dark:text-accent-gold text-neutral-dark">
                {userAnalytics.proposalsCreated}
              </p>
            </div>
            <div className="bg-neutral-dark/10 dark:bg-neutral-dark/20 p-4 rounded-lg">
              <p className="text-sm dark:text-neutral-accent text-neutral-text">Votes Cast</p>
              <p className="text-lg font-mono dark:text-accent-gold text-neutral-dark">
                {userAnalytics.votesCast}
              </p>
            </div>
            <div className="bg-neutral-dark/10 dark:bg-neutral-dark/20 p-4 rounded-lg">
              <p className="text-sm dark:text-neutral-accent text-neutral-text">Active Proposals</p>
              <p className="text-lg font-mono dark:text-accent-gold text-neutral-dark">
                {proposals ? proposals.length : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/dashboard"
            className="text-sm font-inter dark:text-accent-gold text-neutral-dark hover:text-neutral-accent transition-all duration-200 hover:scale-105"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Analytics;