from zk_compose.zk_logic.zk_engine import ZKEngine
from zk_compose.validator.reward import reward
import json

def run_verification():
    print("--- Starting Subnet ZK-Compose Logic Verification ---")
    
    # 1. Test ZK Prove/Verify
    base_proofs = ["proof_data_1_sn2_compliant", "proof_data_2"]
    base_subnet_ids = [2, 8]
    depth = 3
    
    print(f"Testing ZK Proving for depth {depth}...")
    proof, p_time = ZKEngine.prove_composition(base_proofs, base_subnet_ids, depth)
    print(f"Proof generated in {p_time:.2f}s")
    
    print("Testing Cryptographic Verification...")
    is_valid, msg = ZKEngine.verify_composition(proof, base_proofs, base_subnet_ids, depth)
    print(f"Result: {is_valid}, Message: {msg}")
    assert is_valid == True
    
    # 2. Test Multipliers
    print("\n--- Testing Incentive Multipliers ---")
    
    # Base (Single subnet, depth 1)
    q1 = {"base_proofs": ["p1"], "depth": 1, "base_subnet_ids": [1]}
    p1, _ = ZKEngine.prove_composition(["p1"], [1], 1)
    r1 = {"aggregated_proof": p1, "compression_ratio": 1.0}
    score1 = reward(q1, r1)
    print(f"Base Score (Depth 1, Subnet 1): {score1}")
    
    # Multi-Subnet (2x)
    q2 = {"base_proofs": ["p1", "p2"], "depth": 1, "base_subnet_ids": [2, 8]}
    p2, _ = ZKEngine.prove_composition(["p1", "p2"], [2, 8], 1)
    r2 = {"aggregated_proof": p2, "compression_ratio": 1.0}
    score2 = reward(q2, r2)
    print(f"Multi-Subnet Score (Expected 2.0x): {score2}")
    assert score2 == 2.0
    
    # Deep Recursion (Depth 4 -> 2.5x)
    q4 = {"base_proofs": ["p1"], "depth": 4, "base_subnet_ids": [1]}
    p4, _ = ZKEngine.prove_composition(["p1"], [1], 4)
    r4 = {"aggregated_proof": p4, "compression_ratio": 1.0}
    score4 = reward(q4, r4)
    print(f"Deep Recursion Score (Depth 4, Base 1.0 -> Expected 2.5): {score4}")
    assert score4 == 2.5
    
    print("\n--- Verification CLEAN SUCCESS ---")

if __name__ == "__main__":
    run_verification()
