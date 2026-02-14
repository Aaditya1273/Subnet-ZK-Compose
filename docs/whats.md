Bittensor: L1 or L2? And Deployment Details
Aaditya, to directly answer your questions about Subnet ZK-Compose (or any Bittensor subnet):
Is Bittensor L1 or L2?

Bittensor is a sovereign Layer 1 (L1) blockchain.
It's built on Substrate (the same framework as Polkadot), so it's its own independent chain with native token TAO.
Not an L2 (no rollups, no settlement on Ethereum or another base layer).
Not EVM-compatible → no Solidity smart contracts, no Ethereum-style deployments.


This means Bittensor runs fully independently — consensus, emissions, staking all happen on its own L1.
Do You Have to Deploy Backend "On Chain"?

No, you do NOT deploy the full backend on-chain.
Only a tiny part is on-chain: Subnet registration (pay a small fee in testTAO → get a netuid/subnet ID).
The actual "backend" (your ZK-Compose logic) is off-chain:
Miners and validators are Python scripts (miner.py, validator.py) that run on your own servers, VPS, or local machine.
They communicate peer-to-peer (P2P) via Bittensor's Axon/Dendrite system.
Heavy compute (recursive proving) happens off-chain — perfect for your ZK idea.



Do You Have to Make a Smart Contract?

No smart contracts required at all.
Bittensor has no EVM/Solidity support.
Subnet incentive logic is defined off-chain in Python (you code the task assignment, scoring, rewards behavior).
On-chain only handles:
Registration (netuid).
Emissions distribution (automatically based on validator weights).
Staking/delegation.



Summary of What You Actually Deploy









































PartWhereHowRequired for Hackathon?Subnet RegistrationOn-chain (testnet)btcli subnet create --network test (costs almost nothing on testnet)Yes (Round II)Miner LogicOff-chain (your servers)Run python neurons/miner.py --netuid X --network testYes (core requirement)Validator LogicOff-chain (your servers)Run python neurons/validator.py ...Yes (for full demo)Frontend/UIAnywhere (Vercel, etc.)Next.js/React app (optional but great for demo)Bonus (not required)Smart ContractsNowhereNot neededNo
Why this hybrid model? Bittensor focuses on decentralized compute/AI commodities (off-chain work) with on-chain incentives — not general-purpose smart contracts like Ethereum.
For your hackathon submission:

Round I (now): Just the proposal — no deployment.
Round II (if you advance): Register on testnet + run basic Python miners/validators showing recursion flow.

No on-chain backend deployment, no smart contracts — just Python off-chain neurons + simple on-chain registration. This keeps it lightweight and focused on your ZK innovation.