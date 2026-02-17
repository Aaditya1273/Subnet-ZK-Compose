import bittensor as bt
import hashlib
import typing
from pydantic import BaseModel

class SN2ProofRequest(bt.Synapse):
    """
    Simulated synapse for querying SN2 for proofs.
    """
    task_id: str
    proof: typing.Optional[bytes] = None
    proof_system: str = "groth16"
    is_valid: bool = False

class SN2Client:
    """
    Production-grade client for fetching and verifying proofs from Subnet 2 (DSperse).
    Implements 3/5 grouping-based majority consensus.
    """
    def __init__(self, dendrite: bt.dendrite, metagraph_sn2: bt.metagraph):
        self.dendrite = dendrite
        self.metagraph_sn2 = metagraph_sn2

    async def fetch_proof_by_task_id(self, task_id: str) -> typing.Tuple[bytes, typing.Dict[str, typing.Any]]:
        """
        Queries SN2 validators and establishes consensus on the proof data.
        """
        bt.logging.info(f"Querying SN2 validators for proof of task: {task_id}")
        
        # 1. Query Top 5 SN2 Validators
        # In production, we'd select the top-ranking axons.
        axons = self.metagraph_sn2.axons[:5]
        responses = await self.dendrite.query(
            axons=axons,
            synapse=SN2ProofRequest(task_id=task_id),
            timeout=30
        )

        # 2. Group Responses by Proof Hash (Majority Consensus Logic)
        proof_groups = {}
        for r in responses:
            if r.proof:
                p_hash = hashlib.sha256(r.proof).hexdigest()
                if p_hash not in proof_groups:
                    proof_groups[p_hash] = []
                proof_groups[p_hash].append(r)

        # 3. Establish Majority (≥3 Identical Proofs)
        for p_hash, group in proof_groups.items():
            if len(group) >= 3:
                bt.logging.info(f"Consensus reached (majority {len(group)}/5) for proof: {p_hash}")
                winner = group[0]
                return winner.proof, {
                    "proof_system": winner.proof_system,
                    "subnet_id": 2,
                    "consensus_count": len(group)
                }

        # 4. Handle Consensus Failure
        error_msg = f"Zero-Knowledge Consensus Failure on SN2 for task {task_id}. "
        error_msg += f"Received {len(proof_groups)} distinct proof versions. No majority found (3/5)."
        bt.logging.error(error_msg)
        raise ValueError(error_msg)
