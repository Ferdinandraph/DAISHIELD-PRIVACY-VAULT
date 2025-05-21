import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect, useRef } from 'react';
import HeroImage from '../assets/HeroImg1.png';

const Home = () => {
  const { isConnected } = useAccount();

  // Counter animation for Stats Section
  const statsRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach((counter) => {
              const updateCounter = () => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const count = parseFloat(counter.innerText);
                const increment = target / 50;
                if (count < target) {
                  counter.innerText = Math.ceil(count + increment);
                  setTimeout(updateCounter, 50);
                } else {
                  counter.innerText = target.toLocaleString() + (target === 99.9 ? '%' : '+');
                }
              };
              updateCounter();
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-neutral-white dark:bg-neutral-card-dark">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col md:flex-row items-center bg-gradient-to-br from-neutral-dark via-neutral-dark/70 to-accent-gold/10 dark:from-neutral-dark/90 dark:via-neutral-dark/60 dark:to-accent-gold/20">
        {/* Image Container - Left Side */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-start p-4 md:pl-8 lg:pl-12">
          <img
            src={HeroImage}
            alt="DaiShield Privacy Vault Illustration"
            className="w-3/1 md:w-4/3 lg:w-2/1 object-contain rounded-lg animate-rise"
          />
        </div>
        {/* Text Container - Center to Right */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left px-4 sm:px-6 lg:px-8 py-12 animate-rise">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark mb-6">
            Secure Your Assets with DaiShield
          </h1>
          <p className="text-lg sm:text-xl font-poppins text-neutral-text dark:text-neutral-accent mb-8 max-w-2xl">
            Experience unparalleled privacy and control with our decentralized vault and governance platform on the Sepolia testnet.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            {isConnected ? (
              <Link
                to="/dashboard"
                className="inline-block bg-accent-gold text-neutral-dark font-poppins font-medium px-6 py-3 rounded-lg shadow-celestial hover:shadow-celestial-hover hover:animate-bounce transition-all duration-300 animate-glow"
                aria-label="Go to Dashboard"
              >
                Go to Dashboard
              </Link>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="inline-block bg-accent-gold text-neutral-dark font-poppins font-medium px-6 py-3 rounded-lg shadow-celestial hover:shadow-celestial-hover hover:animate-bounce transition-all duration-300 animate-glow"
                    aria-label="Connect Wallet"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            )}
            <Link
              to="/governance/proposals"
              className="inline-block bg-transparent border-2 border-accent-gold text-accent-gold font-poppins font-medium px-6 py-3 rounded-lg hover:bg-accent-gold hover:text-neutral-dark hover:animate-bounce transition-all duration-300"
              aria-label="Explore Governance"
            >
              Explore Governance
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-white dark:bg-neutral-card-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark text-center mb-12 animate-fade-in">
            Why Choose DaiShield?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-neutral-card dark:bg-neutral-dark p-6 rounded-xl shadow-celestial hover:shadow-celestial-hover hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl font-inter font-bold dark:text-accent-gold text-neutral-dark mb-4">Privacy Vault</h3>
              <p className="text-neutral-text dark:text-neutral-accent font-poppins">
                Securely deposit and withdraw assets with zero-knowledge proofs, ensuring maximum privacy.
              </p>
            </div>
            <div className="bg-neutral-card dark:bg-neutral-dark p-6 rounded-xl shadow-celestial hover:shadow-celestial-hover hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-xl font-inter font-bold dark:text-accent-gold text-neutral-dark mb-4">Decentralized Governance</h3>
              <p className="text-neutral-text dark:text-neutral-accent font-poppins">
                Propose and vote on platform upgrades, giving you control over DaiShield’s future.
              </p>
            </div>
            <div className="bg-neutral-card dark:bg-neutral-dark p-6 rounded-xl shadow-celestial hover:shadow-celestial-hover hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-xl font-inter font-bold dark:text-accent-gold text-neutral-dark mb-4">Real-Time Analytics</h3>
              <p className="text-neutral-text dark:text-neutral-accent font-poppins">
                Monitor vault performance and governance activity with intuitive dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-neutral-gradient/50 dark:bg-neutral-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark text-center mb-12 animate-fade-in">
            How DaiShield Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse hover:scale-110 transition-all duration-300">
                <span className="text-2xl font-inter font-bold text-neutral-dark">1</span>
              </div>
              <h3 className="text-xl font-inter font-bold dark:text-accent-gold text-neutral-dark mb-2">Connect Wallet</h3>
              <p className="text-neutral-text dark:text-neutral-accent font-poppins">
                Link your wallet (MetaMask, WalletConnect, etc.) to access DaiShield on Sepolia.
              </p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse hover:scale-110 transition-all duration-300">
                <span className="text-2xl font-inter font-bold text-neutral-dark">2</span>
              </div>
              <h3 className="text-xl font-inter font-bold dark:text-accent-gold text-neutral-dark mb-2">Deposit Assets</h3>
              <p className="text-neutral-text dark:text-neutral-accent font-poppins">
                Securely deposit assets into the privacy vault with encrypted transactions.
              </p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse hover:scale-110 transition-all duration-300">
                <span className="text-2xl font-inter font-bold text-neutral-dark">3</span>
              </div>
              <h3 className="text-xl font-inter font-bold dark:text-accent-gold text-neutral-dark mb-2">Vote & Govern</h3>
              <p className="text-neutral-text dark:text-neutral-accent font-poppins">
                Participate in governance by voting on proposals to shape DaiShield.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-neutral-white dark:bg-neutral-card-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark text-center mb-12 animate-fade-in">
            DaiShield by the Numbers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="counter text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark animate-glow" data-target="100">0</p>
              <p className="text-neutral-text dark:text-neutral-accent font-poppins mt-2">Proposals Voted</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p className="counter text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark animate-glow" data-target="1000">0</p>
              <p className="text-neutral-text dark:text-neutral-accent font-poppins mt-2">Private Transactions</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <p className="counter text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark animate-glow" data-target="99.9">0</p>
              <p className="text-neutral-text dark:text-neutral-accent font-poppins mt-2">Platform Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-neutral-gradient/50 dark:bg-neutral-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-slide-in">
          <h2 className="text-3xl sm:text-4xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark mb-6">
            Join the Future of Privacy
          </h2>
          <p className="text-lg font-poppins text-neutral-text dark:text-neutral-accent mb-8 max-w-2xl mx-auto">
            Start using DaiShield today to secure your assets and participate in decentralized governance.
          </p>
          <Link
            to={isConnected ? '/dashboard' : '/vault/deposit'}
            className="inline-block bg-accent-gold text-neutral-dark font-poppins font-medium px-6 py-3 rounded-lg shadow-celestial hover:shadow-celestial-hover hover:bg-gradient-to-r hover:from-accent-gold hover:to-yellow-400 transition-all duration-300 animate-glow"
            aria-label={isConnected ? 'Go to Dashboard' : 'Get Started'}
          >
            {isConnected ? 'Go to Dashboard' : 'Get Started'}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;