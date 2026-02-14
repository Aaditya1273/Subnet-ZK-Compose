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
    
    proof = response["aggregated_proof"]
    ratio = response.get("compression_ratio", 1.0)
    
    # 1. Basic Validity Check (Simulated mathematical verification)
    # The proof string should contain the depth and a hash of the original content.
    combined_content = "".join(base_proofs)
    expected_hash = hashlib.sha256(combined_content.encode()).hexdigest()
    
    is_valid = (
        proof.startswith(f"zk-recursive-v1-{expected_depth}-") and 
        proof.endswith(expected_hash)
    )
    
    if not is_valid:
        bt.logging.warning(f"Invalid proof signature received: {proof}")
        return 0.0

    # 2. Scoring with Multipliers
    # Base reward for validity
    score = 1.0
    
    # Bonus for succinctness (compression ratio)
    if ratio > 1.2:
        score *= min(ratio, 5.0) # Cap succinctness bonus at 5x
        
    # Bonus for recursion depth
    if expected_depth > 1:
        score *= (1.5 ** (expected_depth - 1))

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
