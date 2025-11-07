import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Check wallet connection
    const checkWalletConnection = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setIsConnected(accounts && accounts.length > 0);
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        setIsConnected(false);
      }
    };

    checkWalletConnection();
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setIsConnected(accounts && accounts.length > 0);
        setShowWalletModal(false);
      });
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);
  
  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Disease Oracle', path: '/disease-detection' },
    { name: 'Market Oracle', path: '/market-prediction' },
    { name: 'Soil Oracle', path: '/soil-predictor' },
    { name: 'Weather Oracle', path: '/weather-prediction' },
    { name: 'Marketplace', path: '/marketplace' }
  ];
  
  const handleNavClick = (e, item) => {
    // Allow Home page navigation always
    if (item.path === '/') {
      return;
    }
    
    // Check if wallet is connected for other pages
    if (!isConnected) {
      e.preventDefault();
      setShowWalletModal(true);
    }
  };
  
  return (
    <>
      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-fadeIn">
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-t-2xl">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white text-center">
                Wallet Connection Required
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-700 text-lg mb-2">
                  Please connect your wallet to access
                </p>
                <p className="text-2xl font-bold text-black">
                  FarmOracle Platform
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold mb-1">Why do I need to connect?</p>
                    <p>FarmOracle uses blockchain technology to provide secure, decentralized agricultural services.</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Close</span>
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                Click "Connect Wallet" in the top-right corner to get started
              </p>
            </div>
          </div>
        </div>
      )}
      
    <header className={`w-full z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-white/90 backdrop-blur-sm py-4'
    } text-gray-900 px-6 md:px-16 border-b border-gray-200`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto md:justify-start">
        <div className="text-2xl font-bold relative overflow-hidden group md:mr-12">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-black rounded-xl mr-3 flex items-center justify-center transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-md">
              <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center">
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </div>
            </div>
            <span className="inline-block relative">
              <span className="inline-block transition-all duration-500 group-hover:transform group-hover:translate-y-[-100%] group-hover:opacity-0 text-black">Farm</span>
              <span className="inline-block transition-all duration-500 group-hover:text-gray-600 text-gray-800">Oracle</span>
              <span className="absolute left-0 top-0 text-gray-600 transition-all duration-500 transform translate-y-[100%] opacity-0 group-hover:transform group-hover:translate-y-0 group-hover:opacity-100 font-light">AI</span>
            </span>
          </div>
          <span className="absolute -bottom-1 left-0 w-0 h-1 bg-black transition-all duration-700 ease-in-out group-hover:w-full rounded-full"></span>
        </div>
        
        <button 
          className="md:hidden focus:outline-none p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-110" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 relative flex justify-center items-center">
            <span className={`absolute h-0.5 w-5 bg-white transform transition-all duration-300 ease-in-out ${menuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
            <span className={`absolute h-0.5 w-5 bg-white transform transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`absolute h-0.5 w-5 bg-white transform transition-all duration-300 ease-in-out ${menuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
          </div>
        </button>
        
        <nav className="hidden md:flex md:justify-between md:flex-grow">
          <ul className="flex items-center space-x-3 lg:space-x-6">
            {menuItems.map((item, index) => (
              <li 
                key={index} 
                className="relative"
                onMouseEnter={() => setActiveItem(item.name)}
                onMouseLeave={() => setActiveItem(null)}
              >
                <a 
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`no-underline text-xs lg:text-sm py-2 px-2 lg:px-3 block transition-all duration-300 font-medium rounded-lg whitespace-nowrap ${
                    pathname === item.path 
                      ? 'bg-black text-white font-semibold shadow-md' 
                      : 'text-gray-700 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  <span className={`transition-all duration-300 ${
                    activeItem === item.name && pathname !== item.path ? 'transform scale-105' : ''
                  }`}>
                    {item.name}
                  </span>
                  <span className={`absolute -bottom-1 left-3 right-3 h-0.5 bg-black transition-all duration-300 ${
                    activeItem === item.name && pathname !== item.path ? 'w-[calc(100%-1.5rem)]' : 'w-0'
                  }`}></span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    
      <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
        menuOpen ? 'max-h-screen opacity-100 pt-6' : 'max-h-0 opacity-0'
      }`}>
        <ul className="flex flex-col">
          {menuItems.map((item, index) => (
            <li 
              key={index} 
              className={`transform transition-all duration-300 hover:bg-gray-50 rounded-xl px-4 ${
                menuOpen ? `opacity-100 translate-x-0` : 'opacity-0 -translate-x-8'
              }`}
              style={{ transitionDelay: menuOpen ? `${index * 50}ms` : '0ms' }}
            >
              <a 
                href={item.path} 
                onClick={(e) => handleNavClick(e, item)}
                className="block py-3 text-gray-700 no-underline text-sm hover:text-black transition-all duration-300 flex items-center font-medium"
              >
                <span>{item.name}</span>
                <span className="ml-auto transform transition-all duration-300 opacity-0 hover:opacity-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
    </>
  );
};

export default Header;