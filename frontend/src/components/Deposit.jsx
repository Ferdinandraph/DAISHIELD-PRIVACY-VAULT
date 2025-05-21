import { useState, useEffect, useRef } from 'react';
import { FaLock, FaCoins, FaSpinner } from 'react-icons/fa';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { toast, ToastContainer } from 'react-toastify';
import VaultABI from '../abis/Vault.json';
import MockDAIABI from '../abis/MockDAI.json';
import { ethers } from 'ethers';

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
const MDAI_ADDRESS = import.meta.env.VITE_MDAI_ADDRESS;
console.log('VAULT_ADDRESS:', VAULT_ADDRESS);
console.log('MDAI_ADDRESS:', MDAI_ADDRESS);

const Deposit = () => {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: 11155111, // Sepolia
  });
  const [depositAmount, setDepositAmount] = useState('');
  const [isValidAmount, setIsValidAmount] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);
  const hasApprovalConfirmedRef = useRef(false); // Track approval toast
  const hasDepositConfirmedRef = useRef(false); // Track deposit toast
  const isApprovedRef = useRef(false); // Track approval status

  // Read DAI balance
  const { data: daiBalance, isLoading: daiBalanceLoading } = useReadContract({
    address: MDAI_ADDRESS,
    abi: MockDAIABI,
    functionName: 'balanceOf',
    args: [address],
    chainId: 11155111,
    watch: true,
  });

  // Read vault balance
  const { data: vaultBalance, isLoading: vaultBalanceLoading } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultABI,
    functionName: 'getBalance',
    args: [address],
    chainId: 11155111,
    watch: true,
  });

  // Read allowance
  const { data: allowance, isLoading: allowanceLoading } = useReadContract({
    address: MDAI_ADDRESS,
    abi: MockDAIABI,
    functionName: 'allowance',
    args: [address, VAULT_ADDRESS],
    chainId: 11155111,
    watch: true,
  });

  // Approve DAI for Vault
  const { writeContract: approveDAI, data: approveTxHash, reset: resetApprove } = useWriteContract();
  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveTxHash });

  // Deposit to Vault
  const { writeContract: deposit, data: depositTxHash, error: depositError } = useWriteContract();
  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } = useWaitForTransactionReceipt({
    hash: depositTxHash,
  });

  const handleApprove = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setIsValidAmount(false);
      console.log('Invalid deposited amount');
      return;
    }
    if (!MDAI_ADDRESS || !VAULT_ADDRESS) {
      console.error('Contract addresses missing:', { MDAI_ADDRESS, VAULT_ADDRESS });
      toast.error('Contract addresses not configured.');
      return;
    }
    setIsValidAmount(true);
    console.log('Approving:', { amount: depositAmount, vault: VAULT_ADDRESS });
    approveDAI({
      address: MDAI_ADDRESS,
      abi: MockDAIABI,
      functionName: 'approve',
      args: [VAULT_ADDRESS, ethers.parseEther(depositAmount)],
    }, {
      onSuccess: (hash) => {
        console.log('Approve tx hash:', hash);
        toast.info('Approval transaction submitted!');
      },
      onError: (error) => {
        console.error('Approve error:', error);
        toast.error(`Approval failed: ${error.message}`);
      },
    });
  };

  const handleDeposit = async () => {
    console.log('handleDeposit called');
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setIsValidAmount(false);
      console.log('Invalid deposited amount');
      return;
    }
    if (!MDAI_ADDRESS || !VAULT_ADDRESS) {
      console.error('Contract addresses missing:', { MDAI_ADDRESS, VAULT_ADDRESS });
      toast.error('Contract addresses not configured.');
      return;
    }
    try {
      setIsValidAmount(true);
      setIsDepositing(true);
      console.log('Depositing:', { amount: depositAmount });
      await deposit({
        address: VAULT_ADDRESS,
        abi: VaultABI,
        functionName: 'deposit',
        args: [ethers.parseEther(depositAmount)],
      }, {
        onSuccess: (hash) => {
          console.log('Deposit tx hash:', hash);
          toast.info('Deposit transaction submitted!');
        },
        onError: (error) => {
          console.error('Deposit error:', error);
          toast.error(`Deposit failed: ${error.message}`);
          setIsDepositing(false);
        },
      });
    } catch (error) {
      console.error('Deposit attempt error:', error);
      toast.error(`Deposit attempt failed: ${error.message}`);
      setIsDepositing(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setDepositAmount(value);
    setIsValidAmount(value && parseFloat(value) > 0);
    if (value !== depositAmount) {
      isApprovedRef.current = false;
      hasApprovalConfirmedRef.current = false;
      resetApprove();
    }
  };

  const handleButtonClick = () => {
    try {
      console.log('Button clicked, isApproved:', isApprovedRef.current);
      if (isApprovedRef.current) {
        handleDeposit();
      } else {
        handleApprove();
      }
    } catch (error) {
      console.error('Button click error:', error);
      toast.error('Failed to process button click.');
    }
  };

  useEffect(() => {
    if (isDepositConfirmed && !hasDepositConfirmedRef.current) {
      hasDepositConfirmedRef.current = true;
      setIsDepositing(false);
      setDepositAmount('');
      isApprovedRef.current = false;
      resetApprove();
      console.log('Deposit confirmed:', { amount: depositAmount, txHash: depositTxHash });
      toast.success(`Successfully deposited ${depositAmount} mDAI`);
    }
    if (depositError) {
      setIsDepositing(false);
      console.error('Deposit error:', depositError);
      toast.error(`Deposit failed: ${depositError.message}`);
    }
    if (isDepositConfirming) {
      console.log('Deposit transaction pending:', { txHash: depositTxHash });
    }
    if (approveTxHash && !isApproving && !hasApprovalConfirmedRef.current) {
      hasApprovalConfirmedRef.current = true;
      isApprovedRef.current = true;
      console.log('Approval confirmed, ready to deposit');
      toast.info('Approval confirmed, you can now deposit!');
      resetApprove();
    }
    console.log('Deposit render:', {
      isConnected,
      address,
      balance: balance?.formatted ?? '0',
      daiBalance: daiBalance ? ethers.formatEther(daiBalance) : '0',
      vaultBalance: vaultBalance ? ethers.formatEther(vaultBalance) : '0',
      allowance: allowance ? ethers.formatEther(allowance) : '0',
      depositAmount,
      isValidAmount,
      isDepositing,
      isApproving,
      isDepositConfirming,
      approveTxHash,
      depositTxHash,
      isApproved: isApprovedRef.current,
      buttonDisabled: !isValidAmount || !depositAmount || isDepositing || isApproving || isDepositConfirming,
      timestamp: new Date().toISOString(),
    });
  }, [isDepositConfirmed, depositError, isDepositConfirming, approveTxHash, isApproving, depositTxHash, resetApprove, depositAmount, allowance]);

  return (
    <div className="min-h-screen bg-neutral-gradient py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover theme="dark" />
      <div className="max-w-3xl mx-auto">
        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl shadow-celestial p-8 mb-8 animate-slide-in">
          <h1 className="text-3xl md:text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark tracking-tight">
            Deposit to Privacy Vault
          </h1>
          <p className="text-base dark:text-neutral-gray text-neutral-text mt-2 font-poppins">
            Securely deposit mDAI into your DaiShield Privacy Vault.
          </p>
        </div>

        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-8 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaLock className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
            <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
              Deposit mDAI
            </h2>
          </div>
          <div className="mt-6 space-y-4">
            <div className="text-sm dark:text-neutral-gray text-neutral-text flex items-center">
              Wallet Address:{' '}
              <span
                className="font-mono cursor-pointer dark:text-accent-gold text-neutral-dark ml-2"
                data-tooltip-id="wallet-address"
                data-tooltip-content={address}
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Tooltip id="wallet-address" place="top" className="bg-neutral-dark/90 text-accent-gold" />
            </div>
            <div className="text-sm dark:text-neutral-gray text-neutral-text flex items-center">
              Sepolia Balance:{' '}
              {balanceLoading ? (
                <FaSpinner className="ml-2 w-4 h-4 dark:text-neutral-gray text-neutral-text animate-spin" />
              ) : (
                <span className="dark:text-accent-gold text-neutral-dark ml-2">
                  {balance?.formatted ?? '0'} SEP
                </span>
              )}
            </div>
            <div className="text-sm dark:text-neutral-gray text-neutral-text flex items-center">
              mDAI Balance:{' '}
              {daiBalanceLoading ? (
                <FaSpinner className="ml-2 w-4 h-4 dark:text-neutral-gray text-neutral-text animate-spin" />
              ) : (
                <span className="dark:text-accent-gold text-neutral-dark ml-2">
                  {daiBalance ? ethers.formatEther(daiBalance) : '0'} mDAI
                </span>
              )}
            </div>
            <div className="text-sm dark:text-neutral-gray text-neutral-text flex items-center">
              Vault Balance:{' '}
              {vaultBalanceLoading ? (
                <FaSpinner className="ml-2 w-4 h-4 dark:text-neutral-gray text-neutral-text animate-spin" />
              ) : (
                <span className="dark:text-accent-gold text-neutral-dark ml-2">
                  {vaultBalance ? ethers.formatEther(vaultBalance) : '0'} mDAI
                </span>
              )}
            </div>
            <div className="text-sm dark:text-neutral-gray text-neutral-text flex items-center">
              Vault Allowance:{' '}
              {allowanceLoading ? (
                <FaSpinner className="ml-2 w-4 h-4 dark:text-neutral-gray text-neutral-text animate-spin" />
              ) : (
                <span className="dark:text-accent-gold text-neutral-dark ml-2">
                  {allowance ? ethers.formatEther(allowance) : '0'} mDAI
                </span>
              )}
            </div>
            <div className="mt-6">
              <label
                htmlFor="depositAmount"
                className="block text-sm font-inter dark:text-neutral-gray text-neutral-text"
              >
                Amount to Deposit (mDAI)
              </label>
              <div className="mt-2 relative">
                <input
                  type="number"
                  id="depositAmount"
                  value={depositAmount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className={`w-full px-4 py-3 bg-neutral-white dark:bg-neutral-dark/50 border ${
                    isValidAmount ? 'border-neutral-gray' : 'border-red-500'
                  } rounded-lg dark:text-accent-gold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-all duration-200`}
                  aria-invalid={!isValidAmount}
                  aria-describedby="deposit-error"
                />
                <FaCoins className="absolute right-4 top-1/2 transform -translate-y-1/2 dark:text-accent-gold text-neutral-dark w-5 h-5" />
              </div>
              {!isValidAmount && (
                <p id="deposit-error" className="text-sm text-red-500 mt-2">
                  Please enter a valid amount greater than 0.
                </p>
              )}
            </div>
            <button
              key={`button-${isApprovedRef.current}`}
              onClick={handleButtonClick}
              disabled={!isValidAmount || !depositAmount || isDepositing || isApproving || isDepositConfirming}
              className={`mt-6 w-full text-sm font-inter dark:text-neutral-white text-neutral-dark bg-button-gradient hover:bg-neutral-gray/50 px-6 py-3 rounded-lg shadow-celestial transition-all duration-300 flex items-center justify-center hover:scale-105 ${
                !isValidAmount || !depositAmount || isDepositing || isApproving || isDepositConfirming
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              aria-label={isApprovedRef.current ? 'Deposit mDAI' : 'Approve mDAI'}
            >
              {(isApproving || isDepositConfirming) && (
                <FaSpinner className="w-5 h-5 animate-spin mr-2" />
              )}
              {isApproving
                ? 'Approving...'
                : isDepositConfirming
                ? 'Depositing...'
                : isApprovedRef.current
                ? 'Deposit'
                : 'Approve'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/dashboard"
            className="text-sm font-inter dark:text-accent-gold text-neutral-dark hover:text-neutral-text transition-all duration-200 hover:scale-105"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Deposit;