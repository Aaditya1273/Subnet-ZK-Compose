import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Suppress ALL console errors for clean video recording
const originalError = console.error;
console.error = (...args) => {
  const message = String(args[0] || '');
  // Only show critical app errors, hide all external library errors
  if (
    message.includes('Failed to fetch') ||
    message.includes('WalletConnect') ||
    message.includes('Reown') ||
    message.includes('Analytics') ||
    message.includes('Coinbase') ||
    message.includes('ERR_BLOCKED') ||
    message.includes('pulse.walletconnect') ||
    message.includes('cca-lite.coinbase')
  ) {
    return; // Suppress
  }
  originalError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
