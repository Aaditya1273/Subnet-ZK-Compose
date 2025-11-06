// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FarmOracle Staking & Yield Farming
 * @dev Stake NFTs to earn rewards (12-18% APY)
 * Built for Africa Blockchain Festival 2025
 */
contract FarmOracleStaking is ERC1155Holder, Ownable, ReentrancyGuard {
    
    IERC1155 public farmOracleNFT;
    
    // Staking pool configuration
    struct StakingPool {
        uint256 tokenType;
        uint256 rewardRate; // Basis points (100 = 1%)
        uint256 totalStaked;
        bool active;
    }
    
    // Stake information
    struct Stake {
        uint256 tokenId;
        uint256 tokenType;
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        bool active;
    }
    
    // Mappings
    mapping(uint256 => StakingPool) public stakingPools;
    mapping(address => Stake[]) public userStakes;
    mapping(address => uint256) public totalRewardsEarned;
    mapping(address => uint256) public pendingRewards;
    
    // Statistics
    uint256 public totalStakers;
    uint256 public totalValueLocked;
    uint256 public totalRewardsPaid;
    mapping(address => bool) public hasStaked;
    
    // Events
    event Staked(
        address indexed user,
        uint256 indexed tokenId,
        uint256 tokenType,
        uint256 amount,
        uint256 timestamp
    );
    
    event Unstaked(
        address indexed user,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 timestamp
    );
    
    event RewardsClaimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event PoolCreated(
        uint256 indexed tokenType,
        uint256 rewardRate
    );

    constructor(address _nftContract) {
        farmOracleNFT = IERC1155(_nftContract);
        
        // Initialize staking pools with APY rates
        _createPool(1, 1200); // Healthy Crop NFT - 12% APY
        _createPool(4, 1500); // Soil Health NFT - 15% APY
        _createPool(6, 1800); // Yield Token - 18% APY
        _createPool(7, 1600); // Carbon Credit NFT - 16% APY
    }
    
    /**
     * @dev Create a staking pool
     */
    function _createPool(uint256 tokenType, uint256 rewardRate) internal {
        stakingPools[tokenType] = StakingPool({
            tokenType: tokenType,
            rewardRate: rewardRate,
            totalStaked: 0,
            active: true
        });
        
        emit PoolCreated(tokenType, rewardRate);
    }
    
    /**
     * @dev Stake NFTs to earn rewards
     */
    function stake(
        uint256 tokenId,
        uint256 tokenType,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(stakingPools[tokenType].active, "Pool not active");
        require(
            farmOracleNFT.balanceOf(msg.sender, tokenType) >= amount,
            "Insufficient NFT balance"
        );
        
        // Transfer NFTs to staking contract
        farmOracleNFT.safeTransferFrom(
            msg.sender,
            address(this),
            tokenType,
            amount,
            ""
        );
        
        // Create stake record
        userStakes[msg.sender].push(Stake({
            tokenId: tokenId,
            tokenType: tokenType,
            amount: amount,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            active: true
        }));
        
        // Update statistics
        stakingPools[tokenType].totalStaked += amount;
        totalValueLocked += amount;
        
        if (!hasStaked[msg.sender]) {
            hasStaked[msg.sender] = true;
            totalStakers++;
        }
        
        emit Staked(msg.sender, tokenId, tokenType, amount, block.timestamp);
    }
    
    /**
     * @dev Unstake NFTs and claim rewards
     */
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.active, "Stake not active");
        
        // Calculate and claim pending rewards
        uint256 rewards = _calculateRewards(msg.sender, stakeIndex);
        if (rewards > 0) {
            _claimRewards(msg.sender, rewards);
        }
        
        // Return NFTs to user
        farmOracleNFT.safeTransferFrom(
            address(this),
            msg.sender,
            userStake.tokenType,
            userStake.amount,
            ""
        );
        
        // Update statistics
        stakingPools[userStake.tokenType].totalStaked -= userStake.amount;
        totalValueLocked -= userStake.amount;
        
        // Mark stake as inactive
        userStake.active = false;
        
        emit Unstaked(msg.sender, userStake.tokenId, userStake.amount, block.timestamp);
    }
    
    /**
     * @dev Claim rewards without unstaking
     */
    function claimRewards(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.active, "Stake not active");
        
        uint256 rewards = _calculateRewards(msg.sender, stakeIndex);
        require(rewards > 0, "No rewards to claim");
        
        _claimRewards(msg.sender, rewards);
        
        // Update last claim time
        userStake.lastClaimTime = block.timestamp;
    }
    
    /**
     * @dev Calculate rewards for a stake
     */
    function _calculateRewards(address user, uint256 stakeIndex) internal view returns (uint256) {
        Stake memory userStake = userStakes[user][stakeIndex];
        
        if (!userStake.active) {
            return 0;
        }
        
        StakingPool memory pool = stakingPools[userStake.tokenType];
        
        // Calculate time staked (in seconds)
        uint256 timeStaked = block.timestamp - userStake.lastClaimTime;
        
        // Calculate rewards: (amount * rewardRate * timeStaked) / (365 days * 10000)
        // rewardRate is in basis points (1200 = 12%)
        uint256 rewards = (userStake.amount * pool.rewardRate * timeStaked) / (365 days * 10000);
        
        return rewards;
    }
    
    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards(address user, uint256 amount) internal {
        totalRewardsEarned[user] += amount;
        totalRewardsPaid += amount;
        
        // In production, this would transfer actual reward tokens
        // For demo, we track the rewards
        pendingRewards[user] += amount;
        
        emit RewardsClaimed(user, amount, block.timestamp);
    }
    
    /**
     * @dev Get all stakes for a user
     */
    function getUserStakes(address user) external view returns (Stake[] memory) {
        return userStakes[user];
    }
    
    /**
     * @dev Get pending rewards for a specific stake
     */
    function getPendingRewards(address user, uint256 stakeIndex) external view returns (uint256) {
        if (stakeIndex >= userStakes[user].length) {
            return 0;
        }
        return _calculateRewards(user, stakeIndex);
    }
    
    /**
     * @dev Get total pending rewards for a user (all stakes)
     */
    function getTotalPendingRewards(address user) external view returns (uint256) {
        uint256 total = 0;
        
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            if (userStakes[user][i].active) {
                total += _calculateRewards(user, i);
            }
        }
        
        return total;
    }
    
    /**
     * @dev Get staking pool info
     */
    function getPoolInfo(uint256 tokenType) external view returns (
        uint256 rewardRate,
        uint256 totalStaked,
        bool active
    ) {
        StakingPool memory pool = stakingPools[tokenType];
        return (pool.rewardRate, pool.totalStaked, pool.active);
    }
    
    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 _totalStakers,
        uint256 _totalValueLocked,
        uint256 _totalRewardsPaid
    ) {
        return (totalStakers, totalValueLocked, totalRewardsPaid);
    }
    
    /**
     * @dev Update pool reward rate (only owner)
     */
    function updatePoolRewardRate(uint256 tokenType, uint256 newRate) external onlyOwner {
        require(stakingPools[tokenType].active, "Pool not active");
        stakingPools[tokenType].rewardRate = newRate;
    }
    
    /**
     * @dev Toggle pool active status (only owner)
     */
    function togglePoolStatus(uint256 tokenType) external onlyOwner {
        stakingPools[tokenType].active = !stakingPools[tokenType].active;
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw(
        uint256 tokenType,
        uint256 amount
    ) external onlyOwner {
        farmOracleNFT.safeTransferFrom(
            address(this),
            msg.sender,
            tokenType,
            amount,
            ""
        );
    }
}
