import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import Header from './components/Header';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import PrivateTransaction from './components/PrivateTransaction';
import Proposals from './components/Proposals';
import Voting from './components/Voting';
import VotingHistory from './components/VotingHistory';
import Analytics from './components/Analytics';
import Footer from './components/Footer';

function App() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, error: switchChainError } = useSwitchChain();
  const location = useLocation();

  useEffect(() => {
    // Clear wagmi localStorage
    localStorage.removeItem('wagmi.connected');
    localStorage.removeItem('wagmi.wallet');

    if (!isConnected || !window.ethereum) return;

    const ensureSepoliaNetwork = async () => {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainId, 16);
        console.log('Current chainId:', currentChainId);

        if (currentChainId !== 11155111) {
          console.log('Switching to Sepolia via wagmi...');
          switchChain({ chainId: 11155111 });
        }
      } catch (error) {
        console.error('Failed to check or switch chain:', error);
      }
    };

    ensureSepoliaNetwork();

    const handleAccountsChanged = (accounts) => {
      console.log('Accounts changed:', accounts, 'timestamp:', new Date().toISOString());
      if (accounts.length === 0 && isConnected) {
        console.log('No accounts detected, disconnecting...');
        disconnect();
      }
    };

    const handleChainChanged = (chainId) => {
      console.log('Chain changed:', parseInt(chainId, 16), 'timestamp:', new Date().toISOString());
      if (parseInt(chainId, 16) !== 11155111) {
        console.log('Switching back to Sepolia...');
        switchChain({ chainId: 11155111 });
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [isConnected, disconnect, switchChain]);

  useEffect(() => {
    if (switchChainError) {
      console.error('Switch chain error:', switchChainError.message);
    }
  }, [switchChainError]);

  console.log('App render, wallet state:', {
    isConnected,
    isConnecting,
    isReconnecting,
    address,
    path: location.pathname,
    timestamp: new Date().toISOString(),
    wagmiConnected: localStorage.getItem('wagmi.connected'),
  });

  if (isConnecting || isReconnecting) {
    return (
      <div className="min-h-screen bg-celestial-gradient flex flex-col justify-center items-center">
        <p className="text-lg text-celestial-gold animate-pulse">Connecting wallet...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vault/deposit" element={<Deposit />} />
        <Route path="/vault/withdraw" element={<Withdraw />} />
        <Route path="/vault/transact" element={<PrivateTransaction />} />
        <Route path="/governance/proposals" element={<Proposals />} />
        <Route path="/governance/voting" element={<Voting />} />
        <Route path="/governance/history" element={<VotingHistory />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;