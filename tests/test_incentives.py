import pytest
import numpy as np
import hashlib
import json
from zk_compose.validator.reward import reward
from zk_compose.zk_logic.zk_engine import ZKEngine

def test_reward_depth_multiplier():
    base_proofs = ["proof1_binary_data", "proof2_binary_data"]
    base_subnet_ids = [1, 1]
    
    # Depth 1 (Base)
    serialized_1, _ = ZKEngine.prove_composition(base_proofs, base_subnet_ids, 1)
    q1 = {"base_proofs": base_proofs, "depth": 1, "base_subnet_ids": base_subnet_ids}
    r1 = {"aggregated_proof": serialized_1, "compression_ratio": 1.0}
    score1 = reward(q1, r1)
    assert score1 == 1.0

    # Depth 2 (1.5x)
    serialized_2, _ = ZKEngine.prove_composition(base_proofs, base_subnet_ids, 2)
    q2 = {"base_proofs": base_proofs, "depth": 2, "base_subnet_ids": base_subnet_ids}
    r2 = {"aggregated_proof": serialized_2, "compression_ratio": 1.0}
    score2 = reward(q2, r2)
    assert score2 == 1.5

    # Depth 4 (Capped at 5x or scaling)
    serialized_4, _ = ZKEngine.prove_composition(base_proofs, base_subnet_ids, 4)
    q4 = {"base_proofs": base_proofs, "depth": 4, "base_subnet_ids": base_subnet_ids}
    r4 = {"aggregated_proof": serialized_4, "compression_ratio": 1.0}
    score4 = reward(q4, r4)
    # 2.0 + (4-3)*0.5 = 2.5
    assert score4 == 2.5

def test_reward_cross_subnet_premium():
    base_proofs = ["proof1_binary_data_sn2_long_proof_padding", "proof2_binary_data"]
    
    # Single Subnet
    base_subnet_ids_single = [1, 1]
    serialized_single, _ = ZKEngine.prove_composition(base_proofs, base_subnet_ids_single, 1)
    q_s = {"base_proofs": base_proofs, "depth": 1, "base_subnet_ids": base_subnet_ids_single}
    r_s = {"aggregated_proof": serialized_single}
    score_s = reward(q_s, r_s)
    
    # Multi Subnet (2x)
    base_subnet_ids_multi = [2, 8]
    serialized_multi, _ = ZKEngine.prove_composition(base_proofs, base_subnet_ids_multi, 1)
    q_m = {"base_proofs": base_proofs, "depth": 1, "base_subnet_ids": base_subnet_ids_multi}
    r_m = {"aggregated_proof": serialized_multi}
    score_m = reward(q_m, r_m)
    
    assert score_m == score_s * 2.0

def test_reward_succinctness_bonus():
    base_proofs = ["p1" * 100, "p2" * 100]
    base_subnet_ids = [1, 1]
    serialized, _ = ZKEngine.prove_composition(base_proofs, base_subnet_ids, 1)
    
    # Low ratio
    q = {"base_proofs": base_proofs, "depth": 1, "base_subnet_ids": base_subnet_ids}
    r_low = {"aggregated_proof": serialized, "compression_ratio": 1.5}
    score_low = reward(q, r_low)
    
    # High ratio (1.5x bonus)
    r_high = {"aggregated_proof": serialized, "compression_ratio": 5.0}
    score_high = reward(q, r_high)
    
    assert score_high == score_low * 1.5
