/**
 * FarmOracle Privacy Web3 Integration
 * Connects ZK identity system with smart contracts
 */

import Web3 from 'web3';
import zkIdentityManager from './zkIdentity';

// Contract ABI (simplified)
const PRIVACY_ABI = [
  {
    "inputs": [],
    "name": "createGroup",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "groupId", "type": "uint256"},
      {"internalType": "uint256", "name": "identityCommitment", "type": "uint256"}
    ],
    "name": "addIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "groupId", "type": "uint256"},
      {"internalType": "uint256", "name": "nullifierHash", "type": "uint256"},
      {"internalType": "uint256", "name": "identityCommitment", "type": "uint256"},
      {"internalType": "string", "name": "cropType", "type": "string"},
      {"internalType": "uint256", "name": "quantity", "type": "uint256"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "bytes", "name": "proof", "type": "bytes"}
    ],
    "name": "listCropAnonymously",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "groupId", "type": "uint256"},
      {"internalType": "uint256", "name": "nullifierHash", "type": "uint256"},
      {"internalType": "uint256", "name": "identityCommitment", "type": "uint256"},
      {"internalType": "string", "name": "diseaseType", "type": "string"},
      {"internalType": "string", "name": "location", "type": "string"},
      {"internalType": "bytes", "name": "proof", "type": "bytes"}
    ],
    "name": "reportDiseaseAnonymously",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "groupId", "type": "uint256"}
    ],
    "name": "getGroupInfo",
    "outputs": [
      {"internalType": "uint256", "name": "root", "type": "uint256"},
      {"internalType": "uint256", "name": "memberCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      {"internalType": "uint256", "name": "_totalGroups", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalIdentities", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalAnonymousTransactions", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract address (update after deployment)
const PRIVACY_CONTRACT_ADDRESS = process.env.REACT_APP_PRIVACY_CONTRACT || "0x...";

let web3;
let privacyContract;
let userAccount;

/**
 * Initialize Web3 and privacy contract
 */
export const initPrivacyWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      userAccount = accounts[0];
      
      privacyContract = new web3.eth.Contract(PRIVACY_ABI, PRIVACY_CONTRACT_ADDRESS);
      
      console.log("✅ Privacy Web3 initialized");
      console.log("📍 Privacy Contract:", PRIVACY_CONTRACT_ADDRESS);
      console.log("👤 User Account:", userAccount);
      
      return { web3, privacyContract, userAccount };
    } catch (error) {
      console.error("Error initializing Privacy Web3:", error);
      throw error;
    }
  } else {
    throw new Error("MetaMask not installed");
  }
};

/**
 * Create anonymous identity for farmer
 */
export const createAnonymousIdentity = async () => {
  try {
    // Create ZK identity
    const identityResult = await zkIdentityManager.createIdentity();
    
    if (!identityResult.success) {
      throw new Error(identityResult.error);
    }
    
    console.log("✅ Anonymous identity created");
    console.log("   Commitment:", identityResult.identityCommitment);
    
    return {
      success: true,
      identityCommitment: identityResult.identityCommitment,
      message: "Anonymous identity created! Your real identity is now protected."
    };
  } catch (error) {
    console.error("Error creating anonymous identity:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Register identity on blockchain
 */
export const registerIdentityOnChain = async (groupId = 0) => {
  try {
    if (!privacyContract || !userAccount) {
      await initPrivacyWeb3();
    }
    
    // Load or create identity
    let identityResult = await zkIdentityManager.loadIdentity();
    if (!identityResult.success) {
      identityResult = await zkIdentityManager.createIdentity();
    }
    
    const identityCommitment = identityResult.identityCommitment;
    
    console.log("📝 Registering identity on blockchain...");
    console.log("   Group ID:", groupId);
    console.log("   Identity Commitment:", identityCommitment);
    
    // Add identity to group on-chain
    const tx = await privacyContract.methods
      .addIdentity(groupId, identityCommitment)
      .send({ from: userAccount });
    
    console.log("✅ Identity registered on blockchain!");
    console.log("   TX:", tx.transactionHash);
    
    // Join group locally
    await zkIdentityManager.joinGroup(groupId, []);
    
    return {
      success: true,
      txHash: tx.transactionHash,
      identityCommitment: identityCommitment,
      groupId: groupId,
      message: "Identity registered on blockchain with privacy protection!"
    };
  } catch (error) {
    console.error("Error registering identity:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create new privacy group
 */
export const createPrivacyGroup = async () => {
  try {
    if (!privacyContract || !userAccount) {
      await initPrivacyWeb3();
    }
    
    console.log("🔒 Creating privacy group...");
    
    const tx = await privacyContract.methods
      .createGroup()
      .send({ from: userAccount });
    
    // Extract group ID from events
    const groupId = tx.events.GroupCreated?.returnValues?.groupId || 0;
    
    console.log("✅ Privacy group created!");
    console.log("   Group ID:", groupId);
    console.log("   TX:", tx.transactionHash);
    
    return {
      success: true,
      groupId: groupId,
      txHash: tx.transactionHash,
      message: "Privacy group created successfully!"
    };
  } catch (error) {
    console.error("Error creating group:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * List crop anonymously
 */
export const listCropAnonymously = async (cropType, quantity, price, groupId = 0) => {
  try {
    if (!privacyContract || !userAccount) {
      await initPrivacyWeb3();
    }
    
    console.log("🌾 Listing crop anonymously...");
    
    // Generate ZK proof
    const proofData = await zkIdentityManager.listCropAnonymously(cropType, quantity, price);
    
    if (!proofData.success) {
      throw new Error(proofData.error);
    }
    
    // Submit to blockchain
    const tx = await privacyContract.methods
      .listCropAnonymously(
        groupId,
        proofData.nullifierHash,
        proofData.identityCommitment,
        cropType,
        quantity,
        price,
        proofData.proof
      )
      .send({ from: userAccount });
    
    console.log("✅ Crop listed anonymously!");
    console.log("   TX:", tx.transactionHash);
    
    return {
      success: true,
      txHash: tx.transactionHash,
      cropType,
      quantity,
      price,
      message: "Crop listed anonymously! Your identity is protected."
    };
  } catch (error) {
    console.error("Error listing crop anonymously:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Report disease anonymously
 */
export const reportDiseaseAnonymously = async (diseaseType, location, groupId = 0) => {
  try {
    if (!privacyContract || !userAccount) {
      await initPrivacyWeb3();
    }
    
    console.log("⚠️ Reporting disease anonymously...");
    
    // Generate ZK proof
    const proofData = await zkIdentityManager.reportDiseaseAnonymously(diseaseType, location);
    
    if (!proofData.success) {
      throw new Error(proofData.error);
    }
    
    // Submit to blockchain
    const tx = await privacyContract.methods
      .reportDiseaseAnonymously(
        groupId,
        proofData.nullifierHash,
        proofData.identityCommitment,
        diseaseType,
        location,
        proofData.proof
      )
      .send({ from: userAccount });
    
    console.log("✅ Disease reported anonymously!");
    console.log("   TX:", tx.transactionHash);
    
    return {
      success: true,
      txHash: tx.transactionHash,
      diseaseType,
      location,
      message: "Disease reported anonymously! Your location is protected."
    };
  } catch (error) {
    console.error("Error reporting disease anonymously:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get group info
 */
export const getGroupInfo = async (groupId = 0) => {
  try {
    if (!privacyContract) {
      await initPrivacyWeb3();
    }
    
    const info = await privacyContract.methods.getGroupInfo(groupId).call();
    
    return {
      success: true,
      groupId: groupId,
      root: info.root,
      memberCount: info.memberCount
    };
  } catch (error) {
    console.error("Error getting group info:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get privacy contract stats
 */
export const getPrivacyStats = async () => {
  try {
    if (!privacyContract) {
      await initPrivacyWeb3();
    }
    
    const stats = await privacyContract.methods.getStats().call();
    
    return {
      success: true,
      totalGroups: stats._totalGroups,
      totalIdentities: stats._totalIdentities,
      totalAnonymousTransactions: stats._totalAnonymousTransactions
    };
  } catch (error) {
    console.error("Error getting privacy stats:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get local identity info
 */
export const getIdentityInfo = () => {
  return zkIdentityManager.getIdentityInfo();
};

/**
 * Delete identity (for privacy)
 */
export const deleteIdentity = () => {
  return zkIdentityManager.deleteIdentity();
};

export default {
  initPrivacyWeb3,
  createAnonymousIdentity,
  registerIdentityOnChain,
  createPrivacyGroup,
  listCropAnonymously,
  reportDiseaseAnonymously,
  getGroupInfo,
  getPrivacyStats,
  getIdentityInfo,
  deleteIdentity
};
