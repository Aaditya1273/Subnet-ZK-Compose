'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children, pageName }) => {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if wallet is connected by checking for ethereum provider and accounts
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
      } finally {
        setIsChecking(false);
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setIsConnected(accounts && accounts.length > 0);
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleGoHome = () => {
    router.push('/');
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-900 text-lg">Checking wallet connection...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
          {/* Modal */}
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Header */}
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

            {/* Body */}
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-700 text-lg mb-2">
                  Please connect your wallet to access
                </p>
                <p className="text-2xl font-bold text-black">
                  {pageName || 'this page'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold mb-1">Why do I need to connect?</p>
                    <p>FarmOracle uses blockchain technology to provide secure, decentralized agricultural services. Your wallet connection ensures data integrity and enables blockchain features.</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleGoHome}
                  className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Go to Home & Connect Wallet</span>
                </button>

                <p className="text-center text-sm text-gray-500">
                  Click "Connect Wallet" in the top-right corner of the home page
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
