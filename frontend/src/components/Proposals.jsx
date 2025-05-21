import { useState, useEffect } from 'react';
import { FaVoteYea, FaSpinner } from 'react-icons/fa';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { toast, ToastContainer } from 'react-toastify';
import GovernanceABI from '../abis/Governance.json';

const GovernanceContractAddress = import.meta.env.VITE_GOVERNANCE_ADDRESS;

const Proposals = () => {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: 11155111, // Sepolia
  });
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [isValidDescription, setIsValidDescription] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [hasShownSuccess, setHasShownSuccess] = useState(false); // New state to track toast
  const [selectedProposal, setSelectedProposal] = useState(null); // For pop-out details

  const { data: activeProposals, refetch: refetchProposals, isError: proposalsError } = useReadContract({
    address: GovernanceContractAddress,
    abi: GovernanceABI,
    functionName: 'getActiveProposals',
    chainId: 11155111,
  });

  const { writeContract: createProposal, data: txHash, error: txError, isLoading: isWriteLoading } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const handleCreateProposal = async () => {
    const titleValid = proposalTitle.trim() !== '';
    const descriptionValid = proposalDescription.trim() !== '';
    setIsValidTitle(titleValid);
    setIsValidDescription(descriptionValid);

    if (!titleValid || !descriptionValid) return;

    setIsCreating(true);
    setHasShownSuccess(false); // Reset success flag
    try {
      console.log('Creating proposal:', { title: proposalTitle, description: proposalDescription, address });
      toast.info('Creating proposal...');
      await createProposal({
        address: GovernanceContractAddress,
        abi: GovernanceABI,
        functionName: 'createProposal',
        args: [proposalTitle, proposalDescription, 7 * 24 * 60 * 60], // 7 days duration
      });
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast.error(`Failed to create proposal: ${error.message}`);
      setIsCreating(false);
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setProposalTitle(value);
    setIsValidTitle(value.trim() !== '');
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setProposalDescription(value);
    setIsValidDescription(value.trim() !== '');
  };

  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
  };

  const handleCloseDetails = () => {
    setSelectedProposal(null);
  };

  useEffect(() => {
    let toastId = null;
    if (isTxConfirmed && !hasShownSuccess) {
      setIsCreating(false);
      setProposalTitle('');
      setProposalDescription('');
      refetchProposals();
      console.log('Proposal created successfully:', { txHash });
      toastId = toast.success('Proposal created successfully!');
      setHasShownSuccess(true); // Prevent further toasts
    }
    if (txError) {
      setIsCreating(false);
      console.error('Proposal error:', txError);
      toast.error(`Proposal failed: ${txError.message}`);
    }
    if (isTxConfirming) {
      console.log('Proposal transaction pending:', { txHash });
    }
    if (proposalsError) {
      console.error('Failed to fetch proposals');
      toast.error('Failed to load proposals.');
    }
    console.log('Proposals render:', {
      isConnected,
      address,
      balance: balance?.formatted,
      proposalTitle,
      proposalDescription,
      isValidTitle,
      isValidDescription,
      isCreating,
      isWriteLoading,
      isTxConfirming,
      txHash,
      hasShownSuccess,
      proposalsCount: activeProposals?.length || 0,
      timestamp: new Date().toISOString(),
    });

    return () => {
      if (toastId) toast.dismiss(toastId); // Cleanup toast on unmount
    };
  }, [isTxConfirmed, txError, isTxConfirming, txHash, hasShownSuccess, activeProposals, address, balance, isConnected, proposalTitle, proposalDescription, isValidTitle, isValidDescription, isCreating, refetchProposals, proposalsError, isWriteLoading]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-neutral-gradient flex flex-col justify-center items-center px-4">
        <p className="text-lg dark:text-accent-gold text-neutral-dark animate-fade-in text-center">
          Please connect your wallet to view or create proposals.
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
        {/* Header Section */}
        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl shadow-celestial p-8 mb-8 animate-slide-in">
          <h1 className="text-3xl md:text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark tracking-tight">
            Governance Proposals
          </h1>
          <p className="text-base dark:text-neutral-accent text-neutral-text mt-2 font-poppins">
            Participate in DaiShield’s decentralized governance by creating and reviewing proposals.
          </p>
        </div>

        {/* Wallet Info */}
        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-6 mb-8 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaVoteYea className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
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
          </div>
        </div>

        {/* Create Proposal Form */}
        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-8 mb-8 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaVoteYea className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
            <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
              Create New Proposal
            </h2>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="proposalTitle"
                className="block text-sm font-inter dark:text-neutral-accent text-neutral-text"
              >
                Proposal Title
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="proposalTitle"
                  value={proposalTitle}
                  onChange={handleTitleChange}
                  placeholder="Enter proposal title"
                  className={`w-full px-4 py-3 bg-neutral-white dark:bg-neutral-dark/50 border ${
                    isValidTitle ? 'border-neutral-gray' : 'border-red-500'
                  } rounded-lg dark:text-accent-gold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-all duration-200`}
                  aria-invalid={!isValidTitle}
                  aria-describedby="title-error"
                />
              </div>
              {!isValidTitle && (
                <p id="title-error" className="text-sm text-red-500 mt-2">
                  Please enter a valid title.
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="proposalDescription"
                className="block text-sm font-inter dark:text-neutral-accent text-neutral-text"
              >
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="proposalDescription"
                  value={proposalDescription}
                  onChange={handleDescriptionChange}
                  placeholder="Enter proposal description"
                  rows="4"
                  className={`w-full px-4 py-3 bg-neutral-white dark:bg-neutral-dark/50 border ${
                    isValidDescription ? 'border-neutral-gray' : 'border-red-500'
                  } rounded-lg dark:text-accent-gold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-all duration-200`}
                  aria-invalid={!isValidDescription}
                  aria-describedby="description-error"
                />
              </div>
              {!isValidDescription && (
                <p id="description-error" className="text-sm text-red-500 mt-2">
                  Please enter a valid description.
                </p>
              )}
            </div>
            <button
              onClick={handleCreateProposal}
              disabled={!isValidTitle || !isValidDescription || !proposalTitle || !proposalDescription || isCreating || isTxConfirming || isWriteLoading}
              className={`mt-6 w-full text-sm font-inter dark:text-neutral-white text-neutral-dark bg-button-gradient hover:bg-neutral-gray/50 px-6 py-3 rounded-lg shadow-celestial transition-all duration-300 flex items-center justify-center hover:scale-105 ${
                !isValidTitle || !isValidDescription || !proposalTitle || !proposalDescription || isCreating || isTxConfirming || isWriteLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Create Proposal"
            >
              {(isCreating || isTxConfirming || isWriteLoading) && (
                <FaSpinner className="w-5 h-5 animate-spin mr-2" />
              )}
              {isCreating || isTxConfirming || isWriteLoading ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        </div>

        {/* Proposals List */}
        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-6 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaVoteYea className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
            <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
              Active Proposals
            </h2>
          </div>
          <p className="text-sm dark:text-neutral-accent text-neutral-text mt-4 mb-6">
            Review and vote on active governance proposals.
          </p>
          <div className="space-y-4">
            {(!activeProposals || activeProposals.length === 0) ? (
              <p className="text-sm dark:text-neutral-accent text-neutral-text text-center">
                No active proposals available.
              </p>
            ) : (
              activeProposals.map((proposal) => (
                <div
                  key={Number(proposal.id)}
                  className="flex justify-between items-center bg-neutral-dark/10 dark:bg-neutral-dark/20 p-4 rounded-lg hover:bg-neutral-gray/20 transition-all duration-200 hover:scale-[1.01]"
                >
                  <div>
                    <p className="text-base font-inter dark:text-accent-gold text-neutral-dark">{proposal.title}</p>
                    <p className="text-xs dark:text-neutral-accent text-neutral-text">
                      Status: <span className="font-semibold">{proposal.status === 0 ? 'Active' : 'Closed'}</span> | 
                      Votes: {Number(proposal.votesFor) + Number(proposal.votesAgainst)}
                    </p>
                    <p className="text-xs dark:text-neutral-accent text-neutral-text mt-1">
                      {proposal.description}
                    </p>
                    <p className="text-xs dark:text-neutral-accent text-neutral-text mt-1">
                      Ends: {new Date(Number(proposal.endTime) * 1000).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetails(proposal)}
                    className="text-sm font-inter dark:text-accent-gold text-neutral-dark hover:text-neutral-accent px-4 py-2 rounded-lg hover:bg-neutral-gray/30 transition-all duration-200"
                    aria-label={`View Details for Proposal ${proposal.id}`}
                  >
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Proposal Details Pop-out */}
        {selectedProposal && (
          <div className="fixed inset-0 bg-neutral-dark/80 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-8 max-w-lg w-full shadow-celestial animate-slide-in">
              <h3 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark mb-4">
                Proposal Details
              </h3>
              <p className="text-base dark:text-accent-gold text-neutral-dark">
                <strong>Title:</strong> {selectedProposal.title}
              </p>
              <p className="text-sm dark:text-neutral-accent text-neutral-text mt-2">
                <strong>Description:</strong> {selectedProposal.description}
              </p>
              <p className="text-sm dark:text-neutral-accent text-neutral-text mt-2">
                <strong>Status:</strong> {selectedProposal.status === 0 ? 'Active' : 'Closed'}
              </p>
              <p className="text-sm dark:text-neutral-accent text-neutral-text mt-2">
                <strong>Votes For:</strong> {Number(selectedProposal.votesFor)}
              </p>
              <p className="text-sm dark:text-neutral-accent text-neutral-text mt-2">
                <strong>Votes Against:</strong> {Number(selectedProposal.votesAgainst)}
              </p>
              <p className="text-sm dark:text-neutral-accent text-neutral-text mt-2">
                <strong>End Time:</strong> {new Date(Number(selectedProposal.endTime) * 1000).toLocaleString()}
              </p>
              <button
                onClick={handleCloseDetails}
                className="mt-6 w-full text-sm font-inter dark:text-neutral-white text-neutral-dark bg-button-gradient hover:bg-neutral-gray/50 px-6 py-3 rounded-lg shadow-celestial transition-all duration-300 hover:scale-105"
                aria-label="Close Proposal Details"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
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

export default Proposals;