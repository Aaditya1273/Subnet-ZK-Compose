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

    # Required request input: List of base proofs to aggregate.
    base_proofs: typing.List[str]

    # Optional recursion parameters.
    recursion_depth: int = 1
    
    # Optional request output: The succinct aggregated proof.
    aggregated_proof: typing.Optional[str] = None
    
    # Performance and verification metadata returned by the miner.
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
