import { useState, useEffect } from 'react';
import { FaLock, FaCoins, FaSpinner } from 'react-icons/fa';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { toast, ToastContainer } from 'react-toastify';
import VaultABI from '../abis/Vault.json';
import { ethers } from 'ethers';

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;

const PrivateTransaction = () => {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: 11155111, // Sepolia
  });
  const [transactionAmount, setTransactionAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isValidAmount, setIsValidAmount] = useState(true);
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [isTransacting, setIsTransacting] = useState(false);

  // Read vault balance
  const { data: vaultBalance, isLoading: vaultBalanceLoading } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VaultABI,
    functionName: 'getBalance',
    args: [address],
    chainId: 11155111,
  });

  // Initiate private transaction
  const { writeContract, data: txHash, error: txError } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const isValidEthereumAddress = (addr) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleTransaction = async () => {
    const amountValid = transactionAmount && parseFloat(transactionAmount) > 0;
    const addressValid = isValidEthereumAddress(recipientAddress);

    setIsValidAmount(amountValid);
    setIsValidAddress(addressValid);

    if (!amountValid || !addressValid) {
      return;
    }

    setIsTransacting(true);
    try {
      console.log('Initiating private transaction:', { amount: transactionAmount, recipient: recipientAddress });
      toast.info('Initiating private transaction...');
      await writeContract({
        address: VAULT_ADDRESS,
        abi: VaultABI,
        functionName: 'privateTransaction',
        args: [recipientAddress, ethers.parseEther(transactionAmount)],
      });
    } catch (error) {
      console.error('Error initiating transaction:', error);
      toast.error(`Transaction failed: ${error.message}`);
      setIsTransacting(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setTransactionAmount(value);
    setIsValidAmount(value && parseFloat(value) > 0);
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setRecipientAddress(value);
    setIsValidAddress(isValidEthereumAddress(value) || value === '');
  };

  useEffect(() => {
    if (isTxConfirmed) {
      setIsTransacting(false);
      setTransactionAmount('');
      setRecipientAddress('');
      console.log('Private transaction confirmed:', { amount: transactionAmount, recipient: recipientAddress, txHash });
      toast.success(`Private transaction of ${transactionAmount} mDAI to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)} successful`);
    }
    if (txError) {
      setIsTransacting(false);
      console.error('Transaction error:', txError);
      toast.error(`Transaction failed: ${txError.message}`);
    }
    if (isTxConfirming) {
      console.log('Transaction pending:', { txHash });
    }
    console.log('PrivateTransaction render:', {
      isConnected,
      address,
      balance: balance?.formatted,
      vaultBalance: vaultBalance ? ethers.formatEther(vaultBalance) : '0',
      transactionAmount,
      recipientAddress,
      isValidAmount,
      isValidAddress,
      isTransacting,
      isTxConfirming,
      txHash,
      timestamp: new Date().toISOString(),
    });
  }, [isTxConfirmed, txError, isTxConfirming, txHash, isConnected, address, balance, vaultBalance, transactionAmount, recipientAddress, isValidAmount, isValidAddress, isTransacting]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-neutral-gradient flex flex-col justify-center items-center px-4">
        <p className="text-lg dark:text-accent-gold text-neutral-dark animate-fade-in text-center">
          Please connect your wallet to initiate a private transaction.
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl shadow-celestial p-8 mb-8 animate-slide-in">
          <h1 className="text-3xl md:text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark tracking-tight">
            Initiate Private Transaction
          </h1>
          <p className="text-base dark:text-neutral-accent text-neutral-text mt-2 font-poppins">
            Send DAI privately using zero-knowledge proofs with DaiShield’s Privacy Vault.
          </p>
        </div>

        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-8 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaLock className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
            <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
              Private Transaction
            </h2>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-sm dark:text-neutral-accent text-neutral-text">
              Wallet Address:{' '}
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
              Vault DAI Balance:{' '}
              {vaultBalanceLoading ? (
                <FaSpinner className="ml-2 w-4 h-4 dark:text-neutral-accent text-neutral-text animate-spin" />
              ) : (
                <span className="dark:text-accent-gold text-neutral-dark ml-2">
                  {vaultBalance ? ethers.formatEther(vaultBalance) : '0'} mDAI
                </span>
              )}
            </p>
            <div className="mt-6">
              <label
                htmlFor="recipientAddress"
                className="block text-sm font-inter dark:text-neutral-accent text-neutral-text"
              >
                Recipient Address
              </label>
              <div className="mt-2 relative">
                <input
                  type="text"
                  id="recipientAddress"
                  value={recipientAddress}
                  onChange={handleAddressChange}
                  placeholder="Enter recipient address (0x...)"
                  className={`w-full px-4 py-3 bg-neutral-white dark:bg-neutral-dark/50 border ${
                    isValidAddress ? 'border-neutral-gray' : 'border-red-500'
                  } rounded-lg dark:text-accent-gold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-all duration-200 font-mono`}
                  aria-invalid={!isValidAddress}
                  aria-describedby="address-error"
                />
              </div>
              {!isValidAddress && recipientAddress && (
                <p id="address-error" className="text-sm text-red-500 mt-2">
                  Please enter a valid Ethereum address.
                </p>
              )}
            </div>
            <div className="mt-6">
              <label
                htmlFor="transactionAmount"
                className="block text-sm font-inter dark:text-neutral-accent text-neutral-text"
              >
                Amount to Send (mDAI)
              </label>
              <div className="mt-2 relative">
                <input
                  type="number"
                  id="transactionAmount"
                  value={transactionAmount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                  className={`w-full px-4 py-3 bg-neutral-white dark:bg-neutral-dark/50 border ${
                    isValidAmount ? 'border-neutral-gray' : 'border-red-500'
                  } rounded-lg dark:text-accent-gold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-all duration-200`}
                  aria-invalid={!isValidAmount}
                  aria-describedby="amount-error"
                />
                <FaCoins className="absolute right-4 top-1/2 transform -translate-y-1/2 dark:text-accent-gold text-neutral-dark w-5 h-5" />
              </div>
              {!isValidAmount && transactionAmount && (
                <p id="amount-error" className="text-sm text-red-500 mt-2">
                  Please enter a valid amount greater than 0.
                </p>
              )}
            </div>
            <button
              onClick={handleTransaction}
              disabled={!isValidAmount || !isValidAddress || !transactionAmount || !recipientAddress || isTransacting || isTxConfirming}
              className={`mt-6 w-full text-sm font-inter dark:text-neutral-white text-neutral-dark bg-button-gradient hover:bg-neutral-gray/50 px-6 py-3 rounded-lg shadow-celestial transition-all duration-300 flex items-center justify-center hover:scale-105 ${
                !isValidAmount || !isValidAddress || !transactionAmount || !recipientAddress || isTransacting || isTxConfirming
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              aria-label="Initiate Private Transaction"
            >
              {(isTransacting || isTxConfirming) && <FaSpinner className="w-5 h-5 animate-spin mr-2" />}
              {isTransacting || isTxConfirming ? 'Processing...' : 'Send Private Transaction'}
            </button>
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

export default PrivateTransaction;