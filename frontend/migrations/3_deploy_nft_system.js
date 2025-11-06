const FarmOracleNFT = artifacts.require("FarmOracleNFT");
const FarmOracleStaking = artifacts.require("FarmOracleStaking");

module.exports = async function (deployer, network, accounts) {
  console.log("\n🚀 Deploying FarmOracle ERC-1155 NFT System...\n");
  
  // Deploy NFT Contract
  console.log("📦 Deploying FarmOracleNFT...");
  await deployer.deploy(FarmOracleNFT);
  const nftContract = await FarmOracleNFT.deployed();
  console.log("✅ FarmOracleNFT deployed at:", nftContract.address);
  
  // Deploy Staking Contract
  console.log("\n📦 Deploying FarmOracleStaking...");
  await deployer.deploy(FarmOracleStaking, nftContract.address);
  const stakingContract = await FarmOracleStaking.deployed();
  console.log("✅ FarmOracleStaking deployed at:", stakingContract.address);
  
  // Get contract statistics
  const stats = await nftContract.getStats();
  console.log("\n📊 NFT Contract Stats:");
  console.log("   - Total NFTs Minted:", stats._totalNFTs.toString());
  console.log("   - Total Farmers:", stats._totalFarmers.toString());
  console.log("   - Current Token ID:", stats._currentTokenId.toString());
  
  const stakingStats = await stakingContract.getStats();
  console.log("\n📊 Staking Contract Stats:");
  console.log("   - Total Stakers:", stakingStats._totalStakers.toString());
  console.log("   - Total Value Locked:", stakingStats._totalValueLocked.toString());
  console.log("   - Total Rewards Paid:", stakingStats._totalRewardsPaid.toString());
  
  // Test minting (optional - only on development)
  if (network === 'development') {
    console.log("\n🧪 Testing NFT minting...");
    
    const testFarmer = accounts[0];
    
    // Mint a Healthy Crop NFT
    const tx1 = await nftContract.mintHealthyCropNFT(
      testFarmer,
      "Tomato",
      1000,
      95
    );
    console.log("✅ Minted Healthy Crop NFT");
    
    // Tokenize Yield
    const tx2 = await nftContract.tokenizeYield(
      testFarmer,
      "Wheat",
      5000,
      85
    );
    console.log("✅ Tokenized Yield");
    
    // Mint Soil Health NFT
    const tx3 = await nftContract.mintSoilHealthNFT(
      testFarmer,
      90,
      "Loamy Soil"
    );
    console.log("✅ Minted Soil Health NFT");
    
    console.log("\n🎉 Test minting completed!");
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📝 Contract Addresses:");
  console.log("   NFT Contract:", nftContract.address);
  console.log("   Staking Contract:", stakingContract.address);
  console.log("\n💡 Next Steps:");
  console.log("   1. Update frontend config with contract addresses");
  console.log("   2. Verify contracts on PolygonScan");
  console.log("   3. Test minting and staking functionality");
  console.log("\n");
};
