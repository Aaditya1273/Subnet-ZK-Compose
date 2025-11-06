const FarmOraclePrivacy = artifacts.require("FarmOraclePrivacy");

module.exports = async function (deployer, network, accounts) {
  console.log("\n🔒 Deploying FarmOracle Privacy Layer (ZK Proofs)...\n");
  
  // Deploy Privacy Contract
  console.log("📦 Deploying FarmOraclePrivacy...");
  await deployer.deploy(FarmOraclePrivacy);
  const privacyContract = await FarmOraclePrivacy.deployed();
  console.log("✅ FarmOraclePrivacy deployed at:", privacyContract.address);
  
  // Get contract statistics
  const stats = await privacyContract.getStats();
  console.log("\n📊 Privacy Contract Stats:");
  console.log("   - Total Groups:", stats._totalGroups.toString());
  console.log("   - Total Identities:", stats._totalIdentities.toString());
  console.log("   - Total Anonymous Transactions:", stats._totalAnonymousTransactions.toString());
  
  // Test privacy features (optional - only on development)
  if (network === 'development') {
    console.log("\n🧪 Testing privacy features...");
    
    const testAccount = accounts[0];
    
    // Create a privacy group
    const tx1 = await privacyContract.createGroup();
    console.log("✅ Created privacy group 0");
    
    // Add test identity
    const testIdentityCommitment = "12345678901234567890"; // Mock commitment
    const tx2 = await privacyContract.addIdentity(0, testIdentityCommitment, {
      from: testAccount
    });
    console.log("✅ Added test identity to group");
    
    // Get group info
    const groupInfo = await privacyContract.getGroupInfo(0);
    console.log("✅ Group 0 has", groupInfo.memberCount.toString(), "members");
    
    console.log("\n🎉 Privacy testing completed!");
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("🎉 PRIVACY LAYER DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📝 Contract Address:");
  console.log("   Privacy Contract:", privacyContract.address);
  console.log("\n💡 Next Steps:");
  console.log("   1. Update frontend config: REACT_APP_PRIVACY_CONTRACT");
  console.log("   2. Test anonymous identity creation");
  console.log("   3. Test anonymous crop listing");
  console.log("   4. Verify ZK proof generation");
  console.log("\n🔒 Privacy Features:");
  console.log("   • Zero-Knowledge Identity Commitments");
  console.log("   • Anonymous Crop Listings");
  console.log("   • Anonymous Disease Reporting");
  console.log("   • Privacy Groups");
  console.log("   • Semaphore-style ZK Proofs");
  console.log("\n");
};
