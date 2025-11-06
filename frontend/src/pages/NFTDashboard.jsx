import React, { useState, useEffect } from 'react';
import {
  initWeb3,
  mintHealthyCropNFT,
  mintDiseaseFreeCertificate,
  mintSoilHealthNFT,
  tokenizeYield,
  getFarmerNFTs,
  stakeNFT,
  unstakeNFT,
  claimRewards,
  getPendingRewards,
  getNFTStats,
  getStakingStats
} from '../components/nftWeb3';

const NFTDashboard = () => {
  const [connected, setConnected] = useState(false);
  const [userAccount, setUserAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('mint');
  
  // NFT Stats
  const [nftStats, setNftStats] = useState({
    totalNFTs: 0,
    totalFarmers: 0,
    currentTokenId: 0
  });
  
  // Staking Stats
  const [stakingStats, setStakingStats] = useState({
    totalStakers: 0,
    totalValueLocked: 0,
    totalRewardsPaid: 0
  });
  
  // User Data
  const [userNFTs, setUserNFTs] = useState([]);
  const [pendingRewards, setPendingRewards] = useState('0');
  
  // Form States
  const [mintForm, setMintForm] = useState({
    cropType: 'Tomato',
    quantity: 100,
    healthScore: 95,
    soilScore: 85,
    soilType: 'Loamy',
    yieldAmount: 1000,
    qualityScore: 90
  });

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      const { userAccount: account } = await initWeb3();
      setUserAccount(account);
      setConnected(true);
      
      // Load data
      await loadData();
      
      setLoading(false);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Get NFT stats
      const nftStatsResult = await getNFTStats();
      if (nftStatsResult.success) {
        setNftStats(nftStatsResult);
      }
      
      // Get staking stats
      const stakingStatsResult = await getStakingStats();
      if (stakingStatsResult.success) {
        setStakingStats(stakingStatsResult);
      }
      
      // Get user NFTs
      const userNFTsResult = await getFarmerNFTs();
      if (userNFTsResult.success) {
        setUserNFTs(userNFTsResult.nfts);
      }
      
      // Get pending rewards
      const rewardsResult = await getPendingRewards();
      if (rewardsResult.success) {
        setPendingRewards(rewardsResult.rewards);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleMintHealthyCrop = async () => {
    setLoading(true);
    const result = await mintHealthyCropNFT(
      mintForm.cropType,
      mintForm.quantity,
      mintForm.healthScore
    );
    
    if (result.success) {
      alert(`✅ ${result.message}\nTX: ${result.txHash}`);
      await loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleMintCertificate = async () => {
    setLoading(true);
    const result = await mintDiseaseFreeCertificate(
      mintForm.cropType,
      mintForm.quantity
    );
    
    if (result.success) {
      alert(`✅ ${result.message}\nTX: ${result.txHash}`);
      await loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleMintSoilNFT = async () => {
    setLoading(true);
    const result = await mintSoilHealthNFT(
      mintForm.soilScore,
      mintForm.soilType
    );
    
    if (result.success) {
      alert(`✅ ${result.message}\nTX: ${result.txHash}`);
      await loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleTokenizeYield = async () => {
    setLoading(true);
    const result = await tokenizeYield(
      mintForm.cropType,
      mintForm.yieldAmount,
      mintForm.qualityScore
    );
    
    if (result.success) {
      alert(`✅ ${result.message}\nTX: ${result.txHash}`);
      await loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleClaimRewards = async () => {
    setLoading(true);
    const result = await claimRewards(0); // First stake
    
    if (result.success) {
      alert(`✅ ${result.message}\nTX: ${result.txHash}`);
      await loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🌾 FarmOracle NFT System
              </h1>
              <p className="text-green-200">ERC-1155 Multi-Token Standard</p>
            </div>
            <div className="text-right">
              {connected ? (
                <div>
                  <div className="bg-green-500 text-white px-4 py-2 rounded-lg mb-2">
                    ✅ Connected
                  </div>
                  <div className="text-white text-sm">
                    {userAccount.slice(0, 6)}...{userAccount.slice(-4)}
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-green-300 text-sm mb-2">Total NFTs Minted</div>
            <div className="text-white text-3xl font-bold">{nftStats.totalNFTs}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-green-300 text-sm mb-2">Total Farmers</div>
            <div className="text-white text-3xl font-bold">{nftStats.totalFarmers}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-green-300 text-sm mb-2">Total Stakers</div>
            <div className="text-white text-3xl font-bold">{stakingStats.totalStakers}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-green-300 text-sm mb-2">Your Pending Rewards</div>
            <div className="text-yellow-400 text-3xl font-bold">{parseFloat(pendingRewards).toFixed(4)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('mint')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'mint'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🎨 Mint NFTs
            </button>
            <button
              onClick={() => setActiveTab('my-nfts')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'my-nfts'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📦 My NFTs
            </button>
            <button
              onClick={() => setActiveTab('staking')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'staking'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              💎 Staking
            </button>
          </div>

          {/* Mint Tab */}
          {activeTab === 'mint' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Healthy Crop NFT */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-white text-xl font-bold mb-4">🌱 Healthy Crop NFT</h3>
                <input
                  type="text"
                  placeholder="Crop Type"
                  value={mintForm.cropType}
                  onChange={(e) => setMintForm({...mintForm, cropType: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={mintForm.quantity}
                  onChange={(e) => setMintForm({...mintForm, quantity: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                />
                <input
                  type="number"
                  placeholder="Health Score (80-100)"
                  value={mintForm.healthScore}
                  onChange={(e) => setMintForm({...mintForm, healthScore: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                />
                <button
                  onClick={handleMintHealthyCrop}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg"
                >
                  {loading ? 'Minting...' : 'Mint Healthy Crop NFT'}
                </button>
              </div>

              {/* Disease-Free Certificate */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-white text-xl font-bold mb-4">🏆 Disease-Free Certificate</h3>
                <input
                  type="text"
                  placeholder="Crop Type"
                  value={mintForm.cropType}
                  onChange={(e) => setMintForm({...mintForm, cropType: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={mintForm.quantity}
                  onChange={(e) => setMintForm({...mintForm, quantity: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                />
                <button
                  onClick={handleMintCertificate}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg mt-8"
                >
                  {loading ? 'Minting...' : 'Mint Certificate'}
                </button>
              </div>

              {/* Soil Health NFT */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-white text-xl font-bold mb-4">🌍 Soil Health NFT</h3>
                <input
                  type="number"
                  placeholder="Soil Score (70-100)"
                  value={mintForm.soilScore}
                  onChange={(e) => setMintForm({...mintForm, soilScore: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                />
                <input
                  type="text"
                  placeholder="Soil Type"
                  value={mintForm.soilType}
                  onChange={(e) => setMintForm({...mintForm, soilType: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                />
                <button
                  onClick={handleMintSoilNFT}
                  disabled={loading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-lg mt-8"
                >
                  {loading ? 'Minting...' : 'Mint Soil NFT'}
                </button>
              </div>

              {/* Tokenize Yield */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-white text-xl font-bold mb-4">💎 Tokenize Yield</h3>
                <input
                  type="text"
                  placeholder="Crop Name"
                  value={mintForm.cropType}
                  onChange={(e) => setMintForm({...mintForm, cropType: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                />
                <input
                  type="number"
                  placeholder="Yield Amount"
                  value={mintForm.yieldAmount}
                  onChange={(e) => setMintForm({...mintForm, yieldAmount: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                />
                <input
                  type="number"
                  placeholder="Quality Score (60-100)"
                  value={mintForm.qualityScore}
                  onChange={(e) => setMintForm({...mintForm, qualityScore: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                />
                <button
                  onClick={handleTokenizeYield}
                  disabled={loading}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg"
                >
                  {loading ? 'Tokenizing...' : 'Tokenize Yield'}
                </button>
              </div>
            </div>
          )}

          {/* My NFTs Tab */}
          {activeTab === 'my-nfts' && (
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">Your NFT Collection</h3>
              {userNFTs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userNFTs.map((nftId, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-6">
                      <div className="text-yellow-400 text-4xl mb-2">🎨</div>
                      <div className="text-white font-bold">NFT #{nftId}</div>
                      <div className="text-green-300 text-sm">Token ID: {nftId}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <div className="text-xl">No NFTs yet. Start minting!</div>
                </div>
              )}
            </div>
          )}

          {/* Staking Tab */}
          {activeTab === 'staking' && (
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">Stake & Earn (12-18% APY)</h3>
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-green-300 text-sm">Your Pending Rewards</div>
                    <div className="text-yellow-400 text-3xl font-bold">{parseFloat(pendingRewards).toFixed(4)} MATIC</div>
                  </div>
                  <button
                    onClick={handleClaimRewards}
                    disabled={loading || parseFloat(pendingRewards) === 0}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg"
                  >
                    {loading ? 'Claiming...' : 'Claim Rewards'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-2">🌱 Healthy Crop NFT</h4>
                  <div className="text-green-300 text-sm mb-4">APY: 12%</div>
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg">
                    Stake Now
                  </button>
                </div>
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-2">🌍 Soil Health NFT</h4>
                  <div className="text-green-300 text-sm mb-4">APY: 15%</div>
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded-lg">
                    Stake Now
                  </button>
                </div>
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-2">💎 Yield Token</h4>
                  <div className="text-green-300 text-sm mb-4">APY: 18%</div>
                  <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 rounded-lg">
                    Stake Now
                  </button>
                </div>
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-2">🌳 Carbon Credit NFT</h4>
                  <div className="text-green-300 text-sm mb-4">APY: 16%</div>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg">
                    Stake Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTDashboard;
