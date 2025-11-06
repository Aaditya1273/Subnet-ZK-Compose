/**
 * FarmOracle ERC-1155 NFT Web3 Integration
 * Handles minting, staking, and NFT operations
 */

import Web3 from 'web3';

// Contract ABIs (simplified - add full ABI from compiled contracts)
const NFT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "farmer", "type": "address"},
      {"internalType": "string", "name": "cropType", "type": "string"},
      {"internalType": "uint256", "name": "quantity", "type": "uint256"},
      {"internalType": "uint256", "name": "healthScore", "type": "uint256"}
    ],
    "name": "mintHealthyCropNFT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "farmer", "type": "address"},
      {"internalType": "string", "name": "cropType", "type": "string"},
      {"internalType": "uint256", "name": "quantity", "type": "uint256"}
    ],
    "name": "mintDiseaseFreeCertificate",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "farmer", "type": "address"},
      {"internalType": "string", "name": "cropType", "type": "string"},
      {"internalType": "string", "name": "diseaseType", "type": "string"},
      {"internalType": "uint256", "name": "quantity", "type": "uint256"}
    ],
    "name": "mintDiseaseAlertNFT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "farmer", "type": "address"},
      {"internalType": "uint256", "name": "soilScore", "type": "uint256"},
      {"internalType": "string", "name": "soilType", "type": "string"}
    ],
    "name": "mintSoilHealthNFT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "farmer", "type": "address"},
      {"internalType": "string", "name": "cropName", "type": "string"},
      {"internalType": "uint256", "name": "yieldAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "qualityScore", "type": "uint256"}
    ],
    "name": "tokenizeYield",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "farmer", "type": "address"}],
    "name": "getFarmerNFTs",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      {"internalType": "uint256", "name": "_totalNFTs", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalFarmers", "type": "uint256"},
      {"internalType": "uint256", "name": "_currentTokenId", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const STAKING_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "uint256", "name": "tokenType", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "stakeIndex", "type": "uint256"}],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "stakeIndex", "type": "uint256"}],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserStakes",
    "outputs": [],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getTotalPendingRewards",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      {"internalType": "uint256", "name": "_totalStakers", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalValueLocked", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalRewardsPaid", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract addresses (update after deployment)
const NFT_CONTRACT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT || "0x...";
const STAKING_CONTRACT_ADDRESS = process.env.REACT_APP_STAKING_CONTRACT || "0x...";

let web3;
let nftContract;
let stakingContract;
let userAccount;

/**
 * Initialize Web3 and contracts
 */
export const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      userAccount = accounts[0];
      
      nftContract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS);
      stakingContract = new web3.eth.Contract(STAKING_ABI, STAKING_CONTRACT_ADDRESS);
      
      console.log("✅ Web3 initialized");
      console.log("📍 NFT Contract:", NFT_CONTRACT_ADDRESS);
      console.log("📍 Staking Contract:", STAKING_CONTRACT_ADDRESS);
      console.log("👤 User Account:", userAccount);
      
      return { web3, nftContract, stakingContract, userAccount };
    } catch (error) {
      console.error("Error initializing Web3:", error);
      throw error;
    }
  } else {
    throw new Error("MetaMask not installed");
  }
};

/**
 * Mint Healthy Crop NFT
 */
export const mintHealthyCropNFT = async (cropType, quantity, healthScore) => {
  try {
    if (!nftContract || !userAccount) {
      await initWeb3();
    }
    
    console.log("🌱 Minting Healthy Crop NFT...");
    
    const tx = await nftContract.methods
      .mintHealthyCropNFT(userAccount, cropType, quantity, healthScore)
      .send({ from: userAccount });
    
    console.log("✅ NFT Minted! TX:", tx.transactionHash);
    
    return {
      success: true,
      txHash: tx.transactionHash,
      message: "Healthy Crop NFT minted successfully!"
    };
  } catch (error) {
    console.error("Error minting NFT:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mint Disease-Free Certificate
 */
export const mintDiseaseFreeCertificate = async (cropType, quantity) => {
  try {
    if (!nftContract || !userAccount) {
      await initWeb3();
    }
    
    console.log("🏆 Minting Disease-Free Certificate...");
    
    const tx = await nftContract.methods
      .mintDiseaseFreeCertificate(userAccount, cropType, quantity)
      .send({ from: userAccount });
    
    console.log("✅ Certificate Minted! TX:", tx.transactionHash);
    
    return {
      success: true,
      txHash: tx.transactionHash,
      message: "Disease-Free Certificate minted!"
    };
  } catch (error) {
    console.error("Error minting certificate:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mint Disease Alert NFT
 */
export const mintDiseaseAlertNFT = async (cropType, diseaseType, quantity) => {
  try {
    if (!nftContract || !userAccount) {
      await initWeb3();
    }
    
    console.log("⚠️ Minting Disease Alert NFT...");
    
    const tx = await nftContract.methods
      .mintDiseaseAlertNFT(userAccount, cropType, diseaseType, quantity)
      .send({ from: userAccount });
    
    console.log("✅ Alert NFT Minted! TX:", tx.transactionHash);
    
    return {
      success: true,
      txHash: tx.transactionHash,
      message: "Disease Alert NFT minted!"
    };
  } catch (error) {
    console.error("Error minting alert NFT:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mint Soil Health NFT
 */
export const mintSoilHealthNFT = async (soilScore, soilType) => {
  try {
    if (!nftContract || !userAccount) {
      await initWeb3();
    }
    
    console.log("🌍 Minting Soil Health NFT...");
    
    const tx = await nftContract.methods
      .mintSoilHealthNFT(userAccount, soilScore, soilType)
      .send({ from: userAccount });
    
    console.log("✅ Soil NFT Minted! TX:", tx.transactionHash);
    
    return {
      success: true,
      txHash: tx.transactionHash,
      message: "Soil Health NFT minted!"
    };
  } catch (error) {
    console.error("Error minting soil NFT:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Tokenize Yield
 */
export const tokenizeYield = async (cropName, yieldAmount, qualityScore) => {
  try {
    if (!nftContract || !userAccount) {
      await initWeb3();
    }
    
    console.log("💎 Tokenizing Yield...");
    
    const tx = await nftContract.methods
      .tokenizeYield(userAccount, cropName, yieldAmount, qualityScore)
      .send({ from: userAccount });
    
    console.log("✅ Yield Tokenized! TX:", tx.transactionHash);
    
    return {
      success: true,
      txHash: tx.transactionHash,
      message: "Yield tokenized successfully!"
    };
  } catch (error) {
    console.error("Error tokenizing yield:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get Farmer's NFTs
 */
export const getFarmerNFTs = async (farmerAddress = null) => {
  try {
    if (!nftContract || !userAccount) {
      await initWeb3();
    }
    
    const address = farmerAddress || userAccount;
    const nftIds = await nftContract.methods.getFarmerNFTs(address).call();
    
    console.log("📦 Farmer NFTs:", nftIds);
    
    return {
      success: true,
      nfts: nftIds
    };
  } catch (error) {
    console.error("Error getting NFTs:", error);
    return {
      success: false,
      error: error.message,
      nfts: []
    };
  }
};

/**
 * Stake NFT
 */
export const stakeNFT = async (tokenId, tokenType, amount) => {
  try {
    if (!stakingContract || !userAccount) {
      await initWeb3();
    }
    
    console.log("🔒 Staking NFT...");
    
    // First approve staking contract to transfer NFTs
    // (This would require approval transaction first)
    
    const tx = await stakingContract.methods
      .stake(tokenId, tokenType, amount)
      .send({ from: userAccount });
    
    console.log("✅ NFT Staked! TX:", tx.transactionHash);
    
    return {
      success: true,
      txHash: tx.transactionHash,
      message: "NFT staked successfully!"
    };
  } catch (error) {
    console.error("Error staking NFT:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Unstake NFT
 */
export const unstakeNFT = async (stakeIndex) => {
  try {
    if (!stakingContract || !userAccount) {
      await initWeb3();
    }
    
    console.log("🔓 Unstaking NFT...");
    
    const tx = await stakingContract.methods
      .unstake(stakeIndex)
      .send({ from: userAccount });
    
    console.log("✅ NFT Unstaked! TX:", tx.transactionHash);
    
    return {
      success: true,
      txHash: tx.transactionHash,
      message: "NFT unstaked successfully!"
    };
  } catch (error) {
    console.error("Error unstaking NFT:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Claim Staking Rewards
 */
export const claimRewards = async (stakeIndex) => {
  try {
    if (!stakingContract || !userAccount) {
      await initWeb3();
    }
    
    console.log("💰 Claiming Rewards...");
    
    const tx = await stakingContract.methods
      .claimRewards(stakeIndex)
      .send({ from: userAccount });
    
    console.log("✅ Rewards Claimed! TX:", tx.transactionHash);
    
    return {
      success: true,
      txHash: tx.transactionHash,
      message: "Rewards claimed successfully!"
    };
  } catch (error) {
    console.error("Error claiming rewards:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get Pending Rewards
 */
export const getPendingRewards = async (userAddress = null) => {
  try {
    if (!stakingContract || !userAccount) {
      await initWeb3();
    }
    
    const address = userAddress || userAccount;
    const rewards = await stakingContract.methods.getTotalPendingRewards(address).call();
    
    return {
      success: true,
      rewards: web3.utils.fromWei(rewards, 'ether')
    };
  } catch (error) {
    console.error("Error getting rewards:", error);
    return {
      success: false,
      error: error.message,
      rewards: "0"
    };
  }
};

/**
 * Get NFT Contract Stats
 */
export const getNFTStats = async () => {
  try {
    if (!nftContract) {
      await initWeb3();
    }
    
    const stats = await nftContract.methods.getStats().call();
    
    return {
      success: true,
      totalNFTs: stats._totalNFTs,
      totalFarmers: stats._totalFarmers,
      currentTokenId: stats._currentTokenId
    };
  } catch (error) {
    console.error("Error getting NFT stats:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get Staking Contract Stats
 */
export const getStakingStats = async () => {
  try {
    if (!stakingContract) {
      await initWeb3();
    }
    
    const stats = await stakingContract.methods.getStats().call();
    
    return {
      success: true,
      totalStakers: stats._totalStakers,
      totalValueLocked: stats._totalValueLocked,
      totalRewardsPaid: stats._totalRewardsPaid
    };
  } catch (error) {
    console.error("Error getting staking stats:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  initWeb3,
  mintHealthyCropNFT,
  mintDiseaseFreeCertificate,
  mintDiseaseAlertNFT,
  mintSoilHealthNFT,
  tokenizeYield,
  getFarmerNFTs,
  stakeNFT,
  unstakeNFT,
  claimRewards,
  getPendingRewards,
  getNFTStats,
  getStakingStats
};
