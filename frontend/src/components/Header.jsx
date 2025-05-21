import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaSun, FaMoon, FaShieldAlt } from 'react-icons/fa';
import { Link, NavLink } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeDark, setIsThemeDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'; // Default to light (false) if no theme in localStorage
  });
  const [isPrivacyDropdownOpen, setIsPrivacyDropdownOpen] = useState(false);
  const [isGovernanceDropdownOpen, setIsGovernanceDropdownOpen] = useState(false);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isThemeDark);
    localStorage.setItem('theme', isThemeDark ? 'dark' : 'light');
  }, [isThemeDark]);

  const toggleDropdown = (dropdown) => {
    setIsPrivacyDropdownOpen(dropdown === 'privacy' ? !isPrivacyDropdownOpen : false);
    setIsGovernanceDropdownOpen(dropdown === 'governance' ? !isGovernanceDropdownOpen : false);
  };

  console.log('Header render:', { isConnected, address, isThemeDark, isMobileMenuOpen });

  return (
    <nav className="sticky top-0 z-50 bg-neutral-gradient backdrop-blur-sm shadow-celestial">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
        {/* Logo and Branding */}
        <Link to="/" className="flex items-center space-x-3">
          <FaShieldAlt className="w-8 h-8 dark:text-accent-gold text-neutral-dark animate-glow" />
          <div>
            <span className="text-xl md:text-2xl font-inter font-extrabold dark:text-accent-gold text-neutral-dark tracking-tight hover:text-neutral-text transition-colors duration-300">
              DaiShield
            </span>
            <span className="text-sm font-poppins hidden md:block dark:text-neutral-text text-neutral-text">
              Shielded by Dai
            </span>
          </div>
        </Link>

        {/* Mobile Menu Button and Right-Side Actions */}
        <div className="flex items-center space-x-4 md:order-2">
          {/* Theme Toggle */}
          <button
            aria-label="Toggle theme"
            className="flex items-center p-2 rounded-full bg-neutral-dark/10 hover:bg-neutral-gray/30 transition-colors duration-300"
            onClick={() => setIsThemeDark(!isThemeDark)}
          >
            {isThemeDark ? (
              <FaSun className="w-5 h-5 text-accent-gold animate-spin-slow" />
            ) : (
              <FaMoon className="w-5 h-5 text-neutral-dark animate-spin-slow" />
            )}
          </button>

          {/* Wallet Button */}
          <div className="relative">
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
                if (!mounted) {
                  return <span className="text-sm dark:text-neutral-gray text-neutral-text">Loading...</span>;
                }
                const handleClick = () => {
                  if (account && openAccountModal) {
                    console.log('Opening account modal for:', { address: account.address });
                    openAccountModal();
                  } else {
                    console.log('Opening connect modal');
                    openConnectModal();
                  }
                };
                return (
                  <button
                    onClick={handleClick}
                    className="text-sm font-inter dark:text-accent-gold text-neutral-dark bg-neutral-dark/10 hover:bg-neutral-gray/30 px-4 py-2 rounded-lg transition-colors duration-300"
                    aria-label={account ? 'Open wallet menu' : 'Connect wallet'}
                  >
                    {account ? (
                      <span>
                        {account.address.slice(0, 6)}...{account.address.slice(-4)}
                      </span>
                    ) : (
                      <span>Connect Wallet</span>
                    )}
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>

          {/* Hamburger Menu Button */}
          <button
            data-collapse-toggle="navbar-user"
            aria-label="Toggle navigation"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm dark:text-accent-gold text-neutral-dark rounded-lg md:hidden hover:bg-neutral-gray/30 focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-5 h-5" />
            ) : (
              <FaBars className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`md:flex md:w-auto md:order-1 ${
            isMobileMenuOpen
              ? 'absolute top-16 left-0 right-0 bg-neutral-gradient dark:bg-neutral-dark/95 shadow-celestial flex flex-col'
              : 'hidden'
          } md:bg-transparent md:shadow-none md:static md:flex-row md:space-x-8 md:mt-0 md:border-0 w-full`}
          id="navbar-user"
        >
          <ul className="flex flex-col font-poppins font-medium p-4 md:p-0 mt-0 md:flex-row md:space-x-8 md:mt-0 bg-transparent rounded-lg w-full">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `block py-2 px-3 dark:text-accent-gold text-neutral-dark rounded-sm md:p-0 transition-colors duration-300 ${
                    isActive
                      ? 'bg-neutral-gray/30 md:bg-transparent md:border-b-2 md:border-accent-gold'
                      : 'hover:text-neutral-text hover:bg-neutral-gray/30 md:hover:bg-transparent'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
            </li>
            <li className="relative">
              <button
                aria-label="Privacy Vault menu"
                className="flex items-center py-2 px-3 dark:text-accent-gold text-neutral-dark rounded-sm md:p-0 hover:text-neutral-text hover:bg-neutral-gray/30 md:hover:bg-transparent transition-colors duration-300 w-full text-left"
                onClick={() => toggleDropdown('privacy')}
              >
                Privacy Vault
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                    aria-hidden="true"
                  />
                </svg>
              </button>
              {isPrivacyDropdownOpen && (
                <div className="md:absolute md:left-0 md:mt-2 md:w-48 bg-neutral-dark/90 dark:bg-neutral-dark/80 rounded-lg shadow-celestial border border-neutral-gray/30 z-50 animate-slide-in ml-4 md:ml-0">
                  <ul className="py-2">
                    <li>
                      <Link
                        to="/vault/deposit"
                        className="block px-4 py-2 text-sm dark:text-neutral-gray text-neutral-text hover:bg-neutral-gray/30 hover:text-accent-gold"
                        onClick={() => {
                          setIsPrivacyDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Deposit
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/vault/withdraw"
                        className="block px-4 py-2 text-sm dark:text-neutral-gray text-neutral-text hover:bg-neutral-gray/30 hover:text-accent-gold"
                        onClick={() => {
                          setIsPrivacyDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Withdraw
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/vault/transact"
                        className="block px-4 py-2 text-sm dark:text-neutral-gray text-neutral-text hover:bg-neutral-gray/30 hover:text-accent-gold"
                        onClick={() => {
                          setIsPrivacyDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Private Transaction
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>
            <li className="relative">
              <button
                aria-label="Governance menu"
                className="flex items-center py-2 px-3 dark:text-accent-gold text-neutral-dark rounded-sm md:p-0 hover:text-neutral-text hover:bg-neutral-gray/30 md:hover:bg-transparent transition-colors duration-300 w-full text-left"
                onClick={() => toggleDropdown('governance')}
              >
                Governance
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                    aria-hidden="true"
                  />
                </svg>
              </button>
              {isGovernanceDropdownOpen && (
                <div className="md:absolute md:left-0 md:mt-2 md:w-48 bg-neutral-dark/90 dark:bg-neutral-dark/80 rounded-lg shadow-celestial border border-neutral-gray/30 z-50 animate-slide-in ml-4 md:ml-0">
                  <ul className="py-2">
                    <li>
                      <Link
                        to="/governance/proposals"
                        className="block px-4 py-2 text-sm dark:text-neutral-gray text-neutral-text hover:bg-neutral-gray/30 hover:text-accent-gold"
                        onClick={() => {
                          setIsGovernanceDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Proposals
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/governance/voting"
                        className="block px-4 py-2 text-sm dark:text-neutral-gray text-neutral-text hover:bg-neutral-gray/30 hover:text-accent-gold"
                        onClick={() => {
                          setIsGovernanceDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Voting
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/governance/history"
                        className="block px-4 py-2 text-sm dark:text-neutral-gray text-neutral-text hover:bg-neutral-gray/30 hover:text-accent-gold"
                        onClick={() => {
                          setIsGovernanceDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Vote History
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>
            <li>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `block py-2 px-3 dark:text-accent-gold text-neutral-dark rounded-sm md:p-0 transition-colors duration-300 ${
                    isActive
                      ? 'bg-neutral-gray/30 md:bg-transparent md:border-b-2 md:border-accent-gold'
                      : 'hover:text-neutral-text hover:bg-neutral-gray/30 md:hover:bg-transparent'
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </NavLink>
            </li>
            <li>
              <a
                href="https://github.com/Ferdinandraph/DAISHIELD-PRIVACY-VAULT"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 px-3 dark:text-accent-gold text-neutral-dark rounded-sm md:p-0 hover:text-neutral-text hover:bg-neutral-gray/30 md:hover:bg-transparent transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Docs
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;