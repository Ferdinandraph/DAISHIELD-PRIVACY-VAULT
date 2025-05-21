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

const Withdraw = () => {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: 11155111, // Sepolia
  });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isValidAmount, setIsValidAmount] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const hasConfirmedRef = useRef(false); // Track success notification

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

  // Withdraw from Vault
  const { writeContract: withdraw, data: withdrawTxHash, error: withdrawError } = useWriteContract({
    onError: (error) => console.error('useWriteContract error:', error),
  });
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawConfirmed } = useWaitForTransactionReceipt({
    hash: withdrawTxHash,
  });

  const handleWithdraw = () => {
    console.log('handleWithdraw called');
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setIsValidAmount(false);
      console.log('Invalid withdrawal amount');
      return;
    }
    if (!MDAI_ADDRESS || !VAULT_ADDRESS) {
      console.error('Contract addresses missing:', { MDAI_ADDRESS, VAULT_ADDRESS });
      toast.error('Contract addresses not configured. Please check .env file.');
      return;
    }
    setIsValidAmount(true);
    setIsWithdrawing(true);
    setIsButtonDisabled(true);
    console.log('Withdrawing:', { amount: withdrawAmount });
    withdraw({
      address: VAULT_ADDRESS,
      abi: VaultABI,
      functionName: 'withdraw',
      args: [ethers.parseEther(withdrawAmount)],
    }, {
      onSuccess: (hash) => {
        console.log('Withdraw tx hash:', hash);
        toast.info('Withdrawal transaction submitted!');
      },
      onError: (error) => {
        console.error('Withdraw error:', error);
        toast.error(`Withdrawal failed: ${error.message}`);
        setIsWithdrawing(false);
        setIsButtonDisabled(false);
      },
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setWithdrawAmount(value);
    setIsValidAmount(value && parseFloat(value) > 0);
  };

  useEffect(() => {
    if (isWithdrawConfirmed && !hasConfirmedRef.current) {
      hasConfirmedRef.current = true;
      setIsWithdrawing(false);
      setWithdrawAmount('');
      setIsButtonDisabled(false);
      console.log('Withdraw confirmed:', { amount: withdrawAmount, txHash: withdrawTxHash });
      toast.success(`Successfully withdrew ${withdrawAmount} mDAI`);
    }
    if (withdrawError) {
      setIsWithdrawing(false);
      setIsButtonDisabled(false);
      console.error('Withdraw error:', withdrawError);
      toast.error(`Withdrawal failed: ${withdrawError.message}`);
    }
    if (isWithdrawConfirming) {
      console.log('Withdraw transaction pending:', { txHash: withdrawTxHash });
    }
    console.log('Withdraw render:', {
      isConnected,
      address,
      balance: balance?.formatted ?? '0',
      daiBalance: daiBalance ? ethers.formatEther(daiBalance) : '0',
      vaultBalance: vaultBalance ? ethers.formatEther(vaultBalance) : '0',
      withdrawAmount,
      isValidAmount,
      isWithdrawing,
      isWithdrawConfirming,
      withdrawTxHash,
      isButtonDisabled,
      timestamp: new Date().toISOString(),
    });
  }, [isWithdrawConfirmed, withdrawError, isWithdrawConfirming, withdrawTxHash]);

  return (
    <div className="min-h-screen bg-neutral-gradient py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover theme="dark" />
      <div className="max-w-3xl mx-auto">
        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl shadow-celestial p-8 mb-8 animate-slide-in">
          <h1 className="text-3xl md:text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark tracking-tight">
            Withdraw from Privacy Vault
          </h1>
          <p className="text-base dark:text-neutral-gray text-neutral-text mt-2 font-poppins">
            Securely withdraw mDAI from your DaiShield Privacy Vault.
          </p>
        </div>

        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-8 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaLock className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
            <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
              Withdraw mDAI
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
            <div className="mt-6">
              <label
                htmlFor="withdrawAmount"
                className="block text-sm font-inter dark:text-neutral-gray text-neutral-text"
              >
                Amount to Withdraw (mDAI)
              </label>
              <div className="mt-2 relative">
                <input
                  type="number"
                  id="withdrawAmount"
                  value={withdrawAmount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className={`w-full px-4 py-3 bg-neutral-white dark:bg-neutral-dark/50 border ${
                    isValidAmount ? 'border-neutral-gray' : 'border-red-500'
                  } rounded-lg dark:text-accent-gold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-all duration-200`}
                  aria-invalid={!isValidAmount}
                  aria-describedby="withdraw-error"
                />
                <FaCoins className="absolute right-4 top-1/2 transform -translate-y-1/2 dark:text-accent-gold text-neutral-dark w-5 h-5" />
              </div>
              {!isValidAmount && (
                <p id="withdraw-error" className="text-sm text-red-500 mt-2">
                  Please enter a valid amount greater than 0.
                </p>
              )}
            </div>
            <button
              onClick={() => {
                console.log('Withdraw button clicked');
                handleWithdraw();
              }}
              disabled={!isValidAmount || !withdrawAmount || isWithdrawing || isWithdrawConfirming || isButtonDisabled}
              className={`mt-6 w-full text-sm font-inter dark:text-neutral-white text-neutral-dark bg-button-gradient hover:bg-neutral-gray/50 px-6 py-3 rounded-lg shadow-celestial transition-all duration-300 flex items-center justify-center hover:scale-105 ${
                !isValidAmount || !withdrawAmount || isWithdrawing || isWithdrawConfirming || isButtonDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              aria-label="Withdraw mDAI"
            >
              {isWithdrawConfirming && <FaSpinner className="w-5 h-5 animate-spin mr-2" />}
              {isWithdrawConfirming ? 'Withdrawing...' : 'Withdraw'}
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

export default Withdraw;