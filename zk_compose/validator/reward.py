# The MIT License (MIT)
# Copyright © 2023 Yuma Rao
# TODO(developer): Set your name
# Copyright © 2023 <your name>

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
# documentation files (the “Software”), to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
# and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of
# the Software.

# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
# THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
# DEALINGS IN THE SOFTWARE.
import numpy as np
from typing import List
import bittensor as bt


import hashlib
from typing import Dict, Any

def reward(query: Dict[str, Any], response: Dict[str, Any]) -> float:
    """
    Reward the miner based on proof validity, succinctness, and depth.
    """
    if response is None or response.get("aggregated_proof") is None:
        return 0.0

    base_proofs = query["base_proofs"]
    expected_depth = query["depth"]
    base_subnet_ids = query.get("base_subnet_ids", [])
    unique_subnets = len(set(base_subnet_ids)) if base_subnet_ids else 1
    
    proof = response["aggregated_proof"]
    ratio = response.get("compression_ratio", 1.0)
    
    from zk_compose.zk_logic.zk_engine import ZKEngine
    
    # 1. Real Mathematical Verification
    is_valid, message = ZKEngine.verify_composition(
        proof, 
        base_proofs, 
        base_subnet_ids, 
        expected_depth
    )
    
    if not is_valid:
        bt.logging.warning(f"Proof verification failed: {message}")
        return 0.0

    # 2. Incentive Design Multipliers (from idea.md)
    score = 1.0
    
    # Recursion Depth Multiplier: 1.5x–5x for depth >= 2
    if expected_depth == 2:
        score *= 1.5
    elif expected_depth > 2:
        # Linear scaling from 2.0x to 5.0x for depth 3 to 10+
        score *= min(2.0 + (expected_depth - 3) * 0.5, 5.0)
        
    # Succinctness Bonus: Extra for >50% compression (ratio > 2.0)
    if ratio > 2.0:
        score *= 1.5 # 50% bonus for high succinctness
        
    # Cross-Subnet Premium: 2x if proofs from >= 2 different subnets
    if unique_subnets >= 2:
        score *= 2.0

    return score


def get_rewards(
    self,
    query: Dict[str, Any],
    responses: List[Dict[str, Any]],
) -> np.ndarray:
    """
    Returns an array of rewards for the given query and responses.
    """
    return np.array([reward(query, response) for response in responses])
