import Web3 from "web3";

// Suppress external library warnings for clean console
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args[0]?.toString() || '';
  // Filter out external library errors
  if (
    message.includes('WalletConnect') ||
    message.includes('Reown Config') ||
    message.includes('Analytics SDK') ||
    message.includes('Coinbase') ||
    message.includes('ERR_BLOCKED_BY_CLIENT') ||
    message.includes('Failed to fetch remote')
  ) {
    return; // Suppress these errors
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('WalletConnect') ||
    message.includes('Reown') ||
    message.includes('Analytics')
  ) {
    return; // Suppress these warnings
  }
  originalConsoleWarn.apply(console, args);
};

// Get the correct Web3 provider - prioritize MetaMask
const getWeb3Provider = () => {
  if (typeof window !== 'undefined') {
    // Check for MetaMask specifically
    if (window.ethereum?.isMetaMask) {
      return new Web3(window.ethereum);
    }
    // Check for multiple providers (when multiple wallets installed)
    if (window.ethereum?.providers) {
      const metamaskProvider = window.ethereum.providers.find(p => p.isMetaMask);
      if (metamaskProvider) {
        return new Web3(metamaskProvider);
      }
      // Use first available provider if MetaMask not found
      return new Web3(window.ethereum.providers[0]);
    }
    // Use whatever ethereum provider is available
    if (window.ethereum) {
      return new Web3(window.ethereum);
    }
  }
  // Fallback to Sepolia testnet RPC
  return new Web3(new Web3.providers.HttpProvider("https://rpc.sepolia.org"));
};

let web3 = getWeb3Provider();

// Ethereum Sepolia Testnet Contract Address - DEPLOYED!
const contractAddress = "0x2f4C507343fC416eAD53A1223b7d344E1e90eeC4"; // FarmOracleComplete deployed on Sepolia
const abi = [
    {
        "inputs": [
            { "internalType": "string", "name": "name", "type": "string" },
            { "internalType": "uint256", "name": "quantity", "type": "uint256" },
            { "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "listCrop",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "cropId", "type": "uint256" }],
        "name": "buyCrop",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "cropId", "type": "uint256" }],
        "name": "getCrop",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "address", "name": "", "type": "address" },
            { "internalType": "string", "name": "", "type": "string" },
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "bool", "name": "", "type": "bool" },
            { "internalType": "address", "name": "", "type": "address" },
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "farmer", "type": "address" }],
        "name": "getFarmerCrops",
        "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "buyer", "type": "address" }],
        "name": "getBuyerPurchases",
        "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllAvailableCrops",
        "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextCropId",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

const contract = new web3.eth.Contract(abi, contractAddress);

export const listCrop = async (name, quantity, price) => {
    try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.listCrop(name, quantity, price).send({
            from: accounts[0],
            gas: 300000, 
        });
        console.log("✅ Crop listed for sale!");
    } catch (error) {
        if (error.message.includes("revert")) {
            console.error("❌ Transaction Reverted: ", error.message);
        } else {
            console.error("❌ Error listing crop:", error);
        }
    }
};

export const buyCrop = async (cropId, price) => {
    try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.buyCrop(cropId).send({ from: accounts[0], value: price });
        console.log("✅ Crop purchased!");
    } catch (error) {
        console.error("❌ Error buying crop:", error);
    }
};

export const getCrop = async (cropId) => {
    try {
        const crop = await contract.methods.getCrop(cropId).call();
        return crop;
    } catch (error) {
        console.error("❌ Error fetching crop:", error);
    }
};

export const getMyListings = async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        const listings = await contract.methods.getFarmerCrops(accounts[0]).call();
        return listings;
    } catch (error) {
        console.error("❌ Error fetching listings:", error);
        return [];
    }
};

export const getMyPurchases = async () => {
    try {
        // Old contract doesn't have this function, return empty for now
        console.log("⚠️ getBuyerPurchases not available in deployed contract");
        return [];
    } catch (error) {
        console.error("❌ Error fetching purchases:", error);
        return [];
    }
};

export const getAllAvailableCrops = async () => {
    try {
        console.log("🔍 Fetching available crops...");
        
        // Check if contract is initialized
        if (!contract) {
            console.error("Contract not initialized");
            return [];
        }
        
        // Get total number of crops
        const nextId = await contract.methods.nextCropId().call();
        console.log("Total crops listed:", nextId);
        
        if (!nextId || nextId == 0) {
            console.log("No crops listed yet");
            return [];
        }
        
        const availableCrops = [];
        
        // Check each crop
        for (let i = 0; i < nextId; i++) {
            try {
                const crop = await contract.methods.getCrop(i).call();
                console.log(`Crop ${i}:`, crop);
                
                // Check if not sold (index 5 is 'sold' field in old contract)
                if (crop && !crop[5]) {
                    availableCrops.push(i);
                }
            } catch (e) {
                console.error(`Error fetching crop ${i}:`, e);
                // Skip if crop doesn't exist
            }
        }
        
        console.log("✅ Available crops:", availableCrops);
        return availableCrops;
    } catch (error) {
        console.error("❌ Error fetching available crops:", error);
        console.error("Error details:", error.message);
        return [];
    }
};

export const connectWallet = async () => {
    try {
        console.log("🔍 Starting wallet connection...");
        
        if (typeof window === 'undefined') {
            throw new Error("Window not available");
        }

        // Check if MetaMask is installed
        if (!window.ethereum) {
            const errorMsg = "❌ MetaMask not detected! Please install MetaMask extension.";
            alert(errorMsg);
            throw new Error(errorMsg);
        }

        console.log("✅ window.ethereum detected");
        console.log("MetaMask?", window.ethereum.isMetaMask);
        console.log("Providers?", window.ethereum.providers);

        let provider = null;
        let walletName = "Unknown Wallet";

        // Try to find MetaMask first (preferred)
        if (window.ethereum?.isMetaMask) {
            provider = window.ethereum;
            walletName = "MetaMask";
            console.log("✅ MetaMask found directly");
        } 
        // Check if multiple providers exist
        else if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
            console.log("🔍 Checking multiple providers...");
            const metamask = window.ethereum.providers.find(p => p.isMetaMask);
            if (metamask) {
                provider = metamask;
                walletName = "MetaMask";
                console.log("✅ MetaMask found in providers array");
            } else {
                // Use first available provider
                provider = window.ethereum.providers[0];
                if (provider.isPhantom) walletName = "Phantom";
                else if (provider.isOkxWallet) walletName = "OKX Wallet";
                console.log(`⚠️ Using ${walletName} (MetaMask not found)`);
            }
        }
        // Accept any Web3 wallet
        else if (window.ethereum) {
            provider = window.ethereum;
            if (window.ethereum.isPhantom) walletName = "Phantom";
            else if (window.ethereum.isOkxWallet) walletName = "OKX Wallet";
            else if (window.ethereum.isCoinbaseWallet) walletName = "Coinbase Wallet";
            else walletName = "Web3 Wallet";
            console.log(`✅ Using ${walletName}`);
        }

        if (!provider) {
            const errorMsg = "❌ No Web3 wallet detected! Please install MetaMask.";
            alert(errorMsg);
            throw new Error(errorMsg);
        }

        console.log(`🔐 Requesting accounts from ${walletName}...`);

        // Re-initialize web3 with the selected provider
        web3 = new Web3(provider);
        
        // Request account access
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        console.log("✅ Accounts received:", accounts);
        
        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found. Please unlock your wallet.");
        }

        console.log(`✅ Connected to ${walletName}:`, accounts[0]);
        alert(`✅ Connected to ${walletName}!\nAddress: ${accounts[0].substring(0, 10)}...`);
        return accounts[0];
    } catch (error) {
        console.error("❌ Error connecting wallet:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        if (error.code === 4001) {
            alert("❌ You rejected the connection request. Please try again.");
            throw new Error("User rejected the connection request");
        } else if (error.code === -32002) {
            alert("❌ MetaMask is already processing a request. Please check MetaMask and approve the pending request.");
            throw new Error("MetaMask request already pending");
        } else {
            alert(`❌ Wallet connection failed: ${error.message}`);
            throw error;
        }
    }
};
