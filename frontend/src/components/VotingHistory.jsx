import { useState, useEffect } from 'react';
import { FaVoteYea, FaSpinner } from 'react-icons/fa';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { toast, ToastContainer } from 'react-toastify';
import GovernanceABI from '../abis/Governance.json';

const GovernanceContractAddress = import.meta.env.VITE_GOVERNANCE_ADDRESS;

const Voting = () => {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: 11155111, // Sepolia
  });
  const [votingStatus, setVotingStatus] = useState({});
  const [isVoting, setIsVoting] = useState({});

  const { data: activeProposals } = useReadContract({
    address: GovernanceContractAddress,
    abi: GovernanceABI,
    functionName: 'getActiveProposals',
    chainId: 11155111,
  });

  const { writeContract: castVote, data: txHash, error: txError } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const handleVote = async (proposalId, voteFor) => {
    setIsVoting((prev) => ({ ...prev, [proposalId]: true }));
    console.log('Voting:', { proposalId, voteFor, voter: address });
    try {
      toast.info(`Casting vote ${voteFor ? 'For' : 'Against'}...`);
      await castVote({
        address: GovernanceContractAddress,
        abi: GovernanceABI,
        functionName: 'vote',
        args: [proposalId, voteFor],
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(`Failed to cast vote: ${error.message}`);
      setIsVoting((prev) => ({ ...prev, [proposalId]: false }));
    }
  };

  useEffect(() => {
    if (isTxConfirmed) {
      const proposalId = Object.keys(isVoting).find((id) => isVoting[id]);
      if (proposalId) {
        const voteFor = isVoting[proposalId];
        setVotingStatus((prev) => ({ ...prev, [proposalId]: voteFor ? 'For' : 'Against' }));
        setIsVoting((prev) => ({ ...prev, [proposalId]: false }));
        console.log('Vote successful:', { proposalId, voteFor, txHash });
        toast.success(`Voted ${voteFor ? 'For' : 'Against'} on proposal ${proposalId}`);
      }
    }
    if (txError) {
      console.error('Vote error:', txError);
      toast.error(`Vote failed: ${txError.message}`);
      setIsVoting((prev) => ({ ...prev, ...Object.keys(isVoting).reduce((acc, id) => ({ ...acc, [id]: false }), {}) }));
    }
    if (isTxConfirming) {
      console.log('Vote transaction pending:', { txHash });
    }
    console.log('Voting render:', {
      isConnected,
      address,
      balance: balance?.formatted,
      votingStatus,
      isVoting,
      isTxConfirming,
      txHash,
      proposalsCount: activeProposals?.length || 0,
      timestamp: new Date().toISOString(),
    });
  }, [isTxConfirmed, txError, isTxConfirming, txHash, isConnected, address, balance, votingStatus, isVoting, activeProposals]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-neutral-gradient flex flex-col justify-center items-center px-4">
        <p className="text-lg dark:text-accent-gold text-neutral-dark animate-fade-in text-center">
          Please connect your wallet to vote on proposals.
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
            Vote on Proposals
          </h1>
          <p className="text-base dark:text-neutral-accent text-neutral-text mt-2 font-poppins">
            Cast your vote on active governance proposals for DaiShield.
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

        {/* Proposals List */}
        <div className="bg-neutral-white dark:bg-neutral-card-dark rounded-xl p-6 shadow-celestial animate-slide-in hover:shadow-celestial-hover transition-all duration-300">
          <div className="flex items-center space-x-3">
            <FaVoteYea className="w-6 h-6 dark:text-accent-gold text-neutral-dark animate-glow" />
            <h2 className="text-xl font-inter font-semibold dark:text-accent-gold text-neutral-dark">
              Active Proposals
            </h2>
          </div>
          <p className="text-sm dark:text-neutral-accent text-neutral-text mt-4 mb-6">
            Vote on active governance proposals.
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
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-neutral-dark/10 dark:bg-neutral-dark/20 p-4 rounded-lg hover:bg-neutral-gray/20 transition-all duration-200 hover:scale-[1.01]"
                >
                  <div className="mb-4 sm:mb-0">
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
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVote(Number(proposal.id), true)}
                      disabled={votingStatus[proposal.id] || isVoting[proposal.id] || isTxConfirming}
                      className={`text-sm font-inter dark:text-neutral-white text-neutral-dark bg-button-gradient hover:bg-neutral-gray/50 px-4 py-2 rounded-lg shadow-celestial transition-all duration-300 hover:scale-105 flex items-center ${
                        votingStatus[proposal.id] || isVoting[proposal.id] || isTxConfirming ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      aria-label={`Vote For Proposal ${proposal.id}`}
                    >
                      {isVoting[proposal.id] && votingStatus[proposal.id] !== 'Against' ? (
                        <FaSpinner className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Vote For
                    </button>
                    <button
                      onClick={() => handleVote(Number(proposal.id), false)}
                      disabled={votingStatus[proposal.id] || isVoting[proposal.id] || isTxConfirming}
                      className={`text-sm font-inter dark:text-neutral-white text-neutral-dark border border-neutral-accent hover:bg-neutral-gray/20 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center ${
                        votingStatus[proposal.id] || isVoting[proposal.id] || isTxConfirming ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      aria-label={`Vote Against Proposal ${proposal.id}`}
                    >
                      {isVoting[proposal.id] && votingStatus[proposal.id] !== 'For' ? (
                        <FaSpinner className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Vote Against
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Back to Proposals */}
        <div className="mt-6 text-center">
          <Link
            to="/governance/proposals"
            className="text-sm font-inter dark:text-accent-gold text-neutral-dark hover:text-neutral-accent transition-all duration-200 hover:scale-105"
          >
            Back to Proposals
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Voting;