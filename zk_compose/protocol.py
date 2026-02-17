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

import typing
import bittensor as bt

# TODO(developer): Rewrite with your protocol definition.

# This is the protocol for the dummy miner and validator.
# It is a simple request-response protocol where the validator sends a request
# to the miner, and the miner responds with a dummy response.

# ---- miner ----
# Example usage:
#   def dummy( synapse: Dummy ) -> Dummy:
#       synapse.dummy_output = synapse.dummy_input + 1
#       return synapse
#   axon = bt.axon().attach( dummy ).serve(netuid=...).start()

# ---- validator ---
# Example usage:
#   dendrite = bt.dendrite()
#   dummy_output = dendrite.query( Dummy( dummy_input = 1 ) )
#   assert dummy_output == 2


from pydantic import BaseModel

class ProofMetadata(BaseModel):
    """
    Structured metadata for component proofs.
    """
    subnet_id: int
    proof_system: str  # "groth16", "plonk", "halo2", "nova"
    vk_hash: str       # Linked to VKRegistry
    public_inputs: typing.List[str]

class ZKCompose(bt.Synapse):
    """
    The ZKCompose protocol handles recursive ZK proof aggregation between validators and miners.
    
    Attributes:
    - base_proofs: A list of serialized ZK proofs (strings or bytes) to be aggregated.
    - aggregated_proof: The resulting succinct recursive proof (filled by the miner).
    - complexity: An integer representing the estimated complexity of the aggregation task.
    - recursion_depth: The target depth of the recursive aggregation.
    - compression_ratio: The ratio of (input size / output size), calculated after proof generation.
    """

    # Component proofs to be aggregated. Supports both str (simulated) 
    # and bytes (production SN2/Arkworks format).
    base_proofs: typing.List[typing.Union[str, bytes]]

    # Optional metadata for each component proof.
    proof_metadata: typing.Optional[typing.List[ProofMetadata]] = None

    # Metadata identifying which subnets the base proofs originated from.
    # [Deprecated]: Metadata now handled by proof_metadata.
    base_subnet_ids: typing.Optional[typing.List[int]] = None

    # Architecture of the base proofs (e.g., "plonk_dsperse", "halo2").
    base_proof_type: str = "plonk_dsperse"

    # Optional recursion parameters.
    recursion_depth: int = 1
    
    # OUTPUTS:
    # The final succinct recursive proof.
    aggregated_proof: typing.Optional[typing.Union[str, bytes]] = None
    
    # Performance and quality metrics.
    compression_ratio: typing.Optional[float] = None
    proving_time: typing.Optional[float] = None

    def deserialize(self) -> typing.Dict[str, typing.Any]:
        """
        Deserialize the miner's response.
        """
        return {
            "aggregated_proof": self.aggregated_proof,
            "compression_ratio": self.compression_ratio,
            "proving_time": self.proving_time,
            "recursion_depth": self.recursion_depth,
        }
