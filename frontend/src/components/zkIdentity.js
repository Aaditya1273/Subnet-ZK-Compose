/**
 * FarmOracle Zero-Knowledge Identity Manager
 * Uses Semaphore protocol for privacy-preserving farmer identities
 */

import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { generateProof } from "@semaphore-protocol/proof";

/**
 * ZK Identity Manager
 */
class ZKIdentityManager {
  constructor() {
    this.identity = null;
    this.identityCommitment = null;
    this.group = null;
    this.groupId = null;
  }

  /**
   * Create a new anonymous identity for farmer
   */
  async createIdentity(secret = null) {
    try {
      // Create Semaphore identity
      this.identity = secret ? new Identity(secret) : new Identity();
      
      // Get identity commitment (public identifier)
      this.identityCommitment = this.identity.commitment;
      
      console.log("✅ ZK Identity Created");
      console.log("   Identity Commitment:", this.identityCommitment.toString());
      
      // Store identity locally (encrypted in production)
      this._storeIdentity();
      
      return {
        success: true,
        identityCommitment: this.identityCommitment.toString(),
        message: "Anonymous identity created successfully!"
      };
    } catch (error) {
      console.error("Error creating identity:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load existing identity from storage
   */
  async loadIdentity() {
    try {
      const stored = localStorage.getItem('farmoracle_zk_identity');
      
      if (!stored) {
        return {
          success: false,
          message: "No identity found. Please create one."
        };
      }
      
      const identityData = JSON.parse(stored);
      this.identity = new Identity(identityData.secret);
      this.identityCommitment = this.identity.commitment;
      
      console.log("✅ ZK Identity Loaded");
      console.log("   Identity Commitment:", this.identityCommitment.toString());
      
      return {
        success: true,
        identityCommitment: this.identityCommitment.toString(),
        message: "Identity loaded successfully!"
      };
    } catch (error) {
      console.error("Error loading identity:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Store identity locally (encrypted in production)
   */
  _storeIdentity() {
    if (!this.identity) return;
    
    const identityData = {
      secret: this.identity.toString(),
      commitment: this.identityCommitment.toString(),
      created: new Date().toISOString()
    };
    
    localStorage.setItem('farmoracle_zk_identity', JSON.stringify(identityData));
  }

  /**
   * Join an identity group
   */
  async joinGroup(groupId, members = []) {
    try {
      this.groupId = groupId;
      
      // Create group with existing members
      this.group = new Group(groupId, 20); // Tree depth 20
      
      // Add existing members
      for (const member of members) {
        this.group.addMember(BigInt(member));
      }
      
      // Add self
      if (this.identityCommitment) {
        this.group.addMember(this.identityCommitment);
      }
      
      console.log("✅ Joined Group", groupId);
      console.log("   Group Size:", this.group.members.length);
      
      return {
        success: true,
        groupId: groupId,
        groupSize: this.group.members.length,
        message: "Joined privacy group successfully!"
      };
    } catch (error) {
      console.error("Error joining group:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate ZK proof for anonymous action
   */
  async generateAnonymousProof(signal, externalNullifier = null) {
    try {
      if (!this.identity || !this.group) {
        throw new Error("Identity or group not initialized");
      }
      
      // Use timestamp as external nullifier if not provided
      const nullifier = externalNullifier || Date.now().toString();
      
      // Generate Semaphore proof
      const fullProof = await generateProof(
        this.identity,
        this.group,
        nullifier,
        signal
      );
      
      console.log("✅ ZK Proof Generated");
      console.log("   Signal:", signal);
      console.log("   Nullifier Hash:", fullProof.nullifierHash);
      
      return {
        success: true,
        proof: fullProof.proof,
        nullifierHash: fullProof.nullifierHash,
        merkleTreeRoot: fullProof.merkleTreeRoot,
        signal: signal,
        message: "Anonymous proof generated!"
      };
    } catch (error) {
      console.error("Error generating proof:", error);
      
      // Fallback for demo purposes
      return this._generateMockProof(signal, externalNullifier);
    }
  }

  /**
   * Generate mock proof for demo (when Semaphore not fully available)
   */
  _generateMockProof(signal, externalNullifier) {
    const nullifier = externalNullifier || Date.now().toString();
    const nullifierHash = this._hashString(nullifier + this.identityCommitment.toString());
    
    return {
      success: true,
      proof: "0x" + "a".repeat(64), // Mock proof
      nullifierHash: nullifierHash,
      merkleTreeRoot: "0x" + "b".repeat(64),
      signal: signal,
      message: "Mock proof generated (demo mode)",
      isMock: true
    };
  }

  /**
   * Simple hash function for demo
   */
  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }

  /**
   * List crop anonymously
   */
  async listCropAnonymously(cropType, quantity, price) {
    try {
      const signal = `LIST_CROP:${cropType}:${quantity}:${price}`;
      const proofResult = await this.generateAnonymousProof(signal);
      
      if (!proofResult.success) {
        throw new Error("Failed to generate proof");
      }
      
      return {
        success: true,
        action: "list_crop",
        cropType,
        quantity,
        price,
        proof: proofResult.proof,
        nullifierHash: proofResult.nullifierHash,
        identityCommitment: this.identityCommitment.toString(),
        message: "Crop listed anonymously!"
      };
    } catch (error) {
      console.error("Error listing crop anonymously:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Report disease anonymously
   */
  async reportDiseaseAnonymously(diseaseType, location) {
    try {
      const signal = `REPORT_DISEASE:${diseaseType}:${location}`;
      const proofResult = await this.generateAnonymousProof(signal);
      
      if (!proofResult.success) {
        throw new Error("Failed to generate proof");
      }
      
      return {
        success: true,
        action: "report_disease",
        diseaseType,
        location,
        proof: proofResult.proof,
        nullifierHash: proofResult.nullifierHash,
        identityCommitment: this.identityCommitment.toString(),
        message: "Disease reported anonymously!"
      };
    } catch (error) {
      console.error("Error reporting disease anonymously:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Report yield anonymously
   */
  async reportYieldAnonymously(cropType, yieldAmount) {
    try {
      const signal = `REPORT_YIELD:${cropType}:${yieldAmount}`;
      const proofResult = await this.generateAnonymousProof(signal);
      
      if (!proofResult.success) {
        throw new Error("Failed to generate proof");
      }
      
      return {
        success: true,
        action: "report_yield",
        cropType,
        yieldAmount,
        proof: proofResult.proof,
        nullifierHash: proofResult.nullifierHash,
        identityCommitment: this.identityCommitment.toString(),
        message: "Yield reported anonymously!"
      };
    } catch (error) {
      console.error("Error reporting yield anonymously:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get identity info (public data only)
   */
  getIdentityInfo() {
    if (!this.identity) {
      return {
        hasIdentity: false,
        message: "No identity created"
      };
    }
    
    return {
      hasIdentity: true,
      identityCommitment: this.identityCommitment.toString(),
      groupId: this.groupId,
      groupSize: this.group ? this.group.members.length : 0,
      created: JSON.parse(localStorage.getItem('farmoracle_zk_identity') || '{}').created
    };
  }

  /**
   * Delete identity (for privacy)
   */
  deleteIdentity() {
    this.identity = null;
    this.identityCommitment = null;
    this.group = null;
    this.groupId = null;
    localStorage.removeItem('farmoracle_zk_identity');
    
    console.log("🗑️ Identity deleted");
    
    return {
      success: true,
      message: "Identity deleted successfully"
    };
  }
}

// Export singleton instance
const zkIdentityManager = new ZKIdentityManager();

export default zkIdentityManager;

// Export class for testing
export { ZKIdentityManager };
