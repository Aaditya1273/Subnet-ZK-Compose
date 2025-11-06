// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title FarmOracle ERC-1155 NFT System
 * @dev Multi-token standard for agricultural NFTs
 * Built for Africa Blockchain Festival 2025
 */
contract FarmOracleNFT is ERC1155, Ownable, Pausable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    // Token ID counters
    Counters.Counter private _tokenIdCounter;
    
    // NFT Type Definitions
    uint256 public constant HEALTHY_CROP_NFT = 1;
    uint256 public constant DISEASE_FREE_CERTIFICATE = 2;
    uint256 public constant DISEASE_ALERT_NFT = 3;
    uint256 public constant SOIL_HEALTH_NFT = 4;
    uint256 public constant WEATHER_SURVIVAL_NFT = 5;
    uint256 public constant YIELD_TOKEN = 6;
    uint256 public constant CARBON_CREDIT_NFT = 7;
    uint256 public constant ORGANIC_CERTIFICATION = 8;

    // NFT Metadata
    struct NFTMetadata {
        uint256 tokenId;
        uint256 tokenType;
        address farmer;
        string cropType;
        uint256 quantity;
        uint256 healthScore;
        uint256 timestamp;
        bool verified;
        string ipfsHash;
    }

    // Crop Data for Yield Tokens
    struct CropData {
        string cropName;
        uint256 yieldAmount;
        uint256 qualityScore;
        uint256 harvestDate;
        bool diseaseDetected;
        string diseaseType;
    }

    // Mappings
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(uint256 => CropData) public cropData;
    mapping(address => uint256[]) public farmerNFTs;
    mapping(uint256 => bool) public isStakeable;
    
    // Statistics
    uint256 public totalNFTsMinted;
    uint256 public totalFarmers;
    mapping(address => bool) public registeredFarmers;

    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        uint256 indexed tokenType,
        address indexed farmer,
        string cropType,
        uint256 quantity
    );
    
    event CropVerified(
        uint256 indexed tokenId,
        address indexed farmer,
        uint256 healthScore
    );
    
    event YieldTokenized(
        uint256 indexed tokenId,
        address indexed farmer,
        uint256 yieldAmount
    );

    event DiseaseAlertIssued(
        uint256 indexed tokenId,
        address indexed farmer,
        string diseaseType
    );

    constructor() ERC1155("https://farmoracle.io/api/nft/{id}.json") {
        // Make certain NFT types stakeable
        isStakeable[HEALTHY_CROP_NFT] = true;
        isStakeable[SOIL_HEALTH_NFT] = true;
        isStakeable[YIELD_TOKEN] = true;
        isStakeable[CARBON_CREDIT_NFT] = true;
    }

    /**
     * @dev Mint Healthy Crop NFT - Issued when crop passes AI health check
     */
    function mintHealthyCropNFT(
        address farmer,
        string memory cropType,
        uint256 quantity,
        uint256 healthScore
    ) public returns (uint256) {
        require(healthScore >= 80, "Health score too low for certification");
        
        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _mint(farmer, HEALTHY_CROP_NFT, 1, "");

        nftMetadata[newTokenId] = NFTMetadata({
            tokenId: newTokenId,
            tokenType: HEALTHY_CROP_NFT,
            farmer: farmer,
            cropType: cropType,
            quantity: quantity,
            healthScore: healthScore,
            timestamp: block.timestamp,
            verified: true,
            ipfsHash: ""
        });

        farmerNFTs[farmer].push(newTokenId);
        _registerFarmer(farmer);
        totalNFTsMinted++;

        emit NFTMinted(newTokenId, HEALTHY_CROP_NFT, farmer, cropType, quantity);
        emit CropVerified(newTokenId, farmer, healthScore);

        return newTokenId;
    }

    /**
     * @dev Mint Disease-Free Certificate - Premium certification NFT
     */
    function mintDiseaseFreeCertificate(
        address farmer,
        string memory cropType,
        uint256 quantity
    ) public returns (uint256) {
        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _mint(farmer, DISEASE_FREE_CERTIFICATE, 1, "");

        nftMetadata[newTokenId] = NFTMetadata({
            tokenId: newTokenId,
            tokenType: DISEASE_FREE_CERTIFICATE,
            farmer: farmer,
            cropType: cropType,
            quantity: quantity,
            healthScore: 100,
            timestamp: block.timestamp,
            verified: true,
            ipfsHash: ""
        });

        farmerNFTs[farmer].push(newTokenId);
        _registerFarmer(farmer);
        totalNFTsMinted++;

        emit NFTMinted(newTokenId, DISEASE_FREE_CERTIFICATE, farmer, cropType, quantity);

        return newTokenId;
    }

    /**
     * @dev Mint Disease Alert NFT - Issued when disease detected
     */
    function mintDiseaseAlertNFT(
        address farmer,
        string memory cropType,
        string memory diseaseType,
        uint256 quantity
    ) public returns (uint256) {
        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _mint(farmer, DISEASE_ALERT_NFT, 1, "");

        nftMetadata[newTokenId] = NFTMetadata({
            tokenId: newTokenId,
            tokenType: DISEASE_ALERT_NFT,
            farmer: farmer,
            cropType: cropType,
            quantity: quantity,
            healthScore: 0,
            timestamp: block.timestamp,
            verified: true,
            ipfsHash: ""
        });

        cropData[newTokenId] = CropData({
            cropName: cropType,
            yieldAmount: quantity,
            qualityScore: 0,
            harvestDate: block.timestamp,
            diseaseDetected: true,
            diseaseType: diseaseType
        });

        farmerNFTs[farmer].push(newTokenId);
        _registerFarmer(farmer);
        totalNFTsMinted++;

        emit NFTMinted(newTokenId, DISEASE_ALERT_NFT, farmer, cropType, quantity);
        emit DiseaseAlertIssued(newTokenId, farmer, diseaseType);

        return newTokenId;
    }

    /**
     * @dev Mint Soil Health NFT - Tracks soil quality improvements
     */
    function mintSoilHealthNFT(
        address farmer,
        uint256 soilScore,
        string memory soilType
    ) public returns (uint256) {
        require(soilScore >= 70, "Soil score too low for NFT");
        
        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _mint(farmer, SOIL_HEALTH_NFT, 1, "");

        nftMetadata[newTokenId] = NFTMetadata({
            tokenId: newTokenId,
            tokenType: SOIL_HEALTH_NFT,
            farmer: farmer,
            cropType: soilType,
            quantity: 1,
            healthScore: soilScore,
            timestamp: block.timestamp,
            verified: true,
            ipfsHash: ""
        });

        farmerNFTs[farmer].push(newTokenId);
        _registerFarmer(farmer);
        totalNFTsMinted++;

        emit NFTMinted(newTokenId, SOIL_HEALTH_NFT, farmer, soilType, 1);

        return newTokenId;
    }

    /**
     * @dev Tokenize Yield - Convert verified crop yield into tradeable tokens
     */
    function tokenizeYield(
        address farmer,
        string memory cropName,
        uint256 yieldAmount,
        uint256 qualityScore
    ) public returns (uint256) {
        require(yieldAmount > 0, "Yield amount must be positive");
        require(qualityScore >= 60, "Quality too low for tokenization");
        
        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Mint yield tokens (quantity = yield amount)
        _mint(farmer, YIELD_TOKEN, yieldAmount, "");

        nftMetadata[newTokenId] = NFTMetadata({
            tokenId: newTokenId,
            tokenType: YIELD_TOKEN,
            farmer: farmer,
            cropType: cropName,
            quantity: yieldAmount,
            healthScore: qualityScore,
            timestamp: block.timestamp,
            verified: true,
            ipfsHash: ""
        });

        cropData[newTokenId] = CropData({
            cropName: cropName,
            yieldAmount: yieldAmount,
            qualityScore: qualityScore,
            harvestDate: block.timestamp,
            diseaseDetected: false,
            diseaseType: ""
        });

        farmerNFTs[farmer].push(newTokenId);
        _registerFarmer(farmer);
        totalNFTsMinted++;

        emit NFTMinted(newTokenId, YIELD_TOKEN, farmer, cropName, yieldAmount);
        emit YieldTokenized(newTokenId, farmer, yieldAmount);

        return newTokenId;
    }

    /**
     * @dev Mint Carbon Credit NFT - For sustainable farming practices
     */
    function mintCarbonCreditNFT(
        address farmer,
        uint256 carbonOffset,
        string memory practiceType
    ) public returns (uint256) {
        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _mint(farmer, CARBON_CREDIT_NFT, carbonOffset, "");

        nftMetadata[newTokenId] = NFTMetadata({
            tokenId: newTokenId,
            tokenType: CARBON_CREDIT_NFT,
            farmer: farmer,
            cropType: practiceType,
            quantity: carbonOffset,
            healthScore: 100,
            timestamp: block.timestamp,
            verified: true,
            ipfsHash: ""
        });

        farmerNFTs[farmer].push(newTokenId);
        _registerFarmer(farmer);
        totalNFTsMinted++;

        emit NFTMinted(newTokenId, CARBON_CREDIT_NFT, farmer, practiceType, carbonOffset);

        return newTokenId;
    }

    /**
     * @dev Mint Organic Certification NFT
     */
    function mintOrganicCertification(
        address farmer,
        string memory cropType
    ) public returns (uint256) {
        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _mint(farmer, ORGANIC_CERTIFICATION, 1, "");

        nftMetadata[newTokenId] = NFTMetadata({
            tokenId: newTokenId,
            tokenType: ORGANIC_CERTIFICATION,
            farmer: farmer,
            cropType: cropType,
            quantity: 1,
            healthScore: 100,
            timestamp: block.timestamp,
            verified: true,
            ipfsHash: ""
        });

        farmerNFTs[farmer].push(newTokenId);
        _registerFarmer(farmer);
        totalNFTsMinted++;

        emit NFTMinted(newTokenId, ORGANIC_CERTIFICATION, farmer, cropType, 1);

        return newTokenId;
    }

    /**
     * @dev Get all NFTs owned by a farmer
     */
    function getFarmerNFTs(address farmer) public view returns (uint256[] memory) {
        return farmerNFTs[farmer];
    }

    /**
     * @dev Get NFT metadata
     */
    function getNFTMetadata(uint256 tokenId) public view returns (NFTMetadata memory) {
        return nftMetadata[tokenId];
    }

    /**
     * @dev Get crop data for yield tokens
     */
    function getCropData(uint256 tokenId) public view returns (CropData memory) {
        return cropData[tokenId];
    }

    /**
     * @dev Check if NFT type is stakeable
     */
    function isNFTStakeable(uint256 tokenType) public view returns (bool) {
        return isStakeable[tokenType];
    }

    /**
     * @dev Register farmer (internal)
     */
    function _registerFarmer(address farmer) internal {
        if (!registeredFarmers[farmer]) {
            registeredFarmers[farmer] = true;
            totalFarmers++;
        }
    }

    /**
     * @dev Update NFT metadata URI
     */
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    /**
     * @dev Pause contract
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Get contract statistics
     */
    function getStats() public view returns (
        uint256 _totalNFTs,
        uint256 _totalFarmers,
        uint256 _currentTokenId
    ) {
        return (totalNFTsMinted, totalFarmers, _tokenIdCounter.current());
    }
}
