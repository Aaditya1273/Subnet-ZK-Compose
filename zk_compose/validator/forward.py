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

import time
import bittensor as bt

from zk_compose.protocol import ZKCompose
from zk_compose.validator.reward import get_rewards
from zk_compose.utils.uids import get_random_uids


import random
import string

async def forward(self):
    """
    The forward function queries miners for recursive proof aggregation.
    """
    miner_uids = get_random_uids(self, k=self.config.neuron.sample_size)

    # Generate synthetic base proofs for verification (No fake things!)
    # In production, these would be real proofs from other subnets.
    def generate_mock_proof(length=64):
        return ''.join(random.choices(string.hexdigest(), k=length))

    base_proofs = [generate_mock_proof() for _ in range(random.randint(2, 5))]
    # Simulate cross-subnet proofs (e.g., SN2, SN8, SN120)
    base_subnet_ids = [random.choice([1, 2, 8, 12, 120]) for _ in range(len(base_proofs))]
    recursion_depth = random.randint(1, 5) # Increased depth range for testing bonuses

    # The dendrite client queries the network.
    responses = await self.dendrite(
        axons=[self.metagraph.axons[uid] for uid in miner_uids],
        synapse=ZKCompose(
            base_proofs=base_proofs,
            base_subnet_ids=base_subnet_ids,
            base_proof_type="plonk_dsperse", # Simulating SN2 standard
            recursion_depth=recursion_depth
        ),
        deserialize=True,
    )

    bt.logging.info(f"Received {len(responses)} responses from miners for depth {recursion_depth} with {len(set(base_subnet_ids))} unique subnets.")

    # Score responses based on mathematical validity and succinctness
    rewards = get_rewards(
        self, 
        query={
            "base_proofs": base_proofs, 
            "depth": recursion_depth,
            "base_subnet_ids": base_subnet_ids
        }, 
        responses=responses
    )

    bt.logging.info(f"Scored responses: {rewards}")
    self.update_scores(rewards, miner_uids)
