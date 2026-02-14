Implementing Subnet ZK-Compose on Bittensor
Aaditya, here's a complete, practical guide to turning your Subnet ZK-Compose idea into a real product on the Bittensor network. For the hackathon (Round II on testnet, March 2026), focus on testnet deployment — no real money or mainnet needed yet. After the hackathon, you can migrate to mainnet.
Bittensor is a Substrate-based blockchain (Polkadot-compatible) for decentralized AI commodities. The native token is TAO (τ) on mainnet and testTAO (tTAO) on testnet.
Bittensor Networks Overview

Testnet:
For testing/hackathons
wss://test.finney.opentensor.ai:443 (or check latest via btcli chain endpoint --network test)
Free testTAO via Discord faucet (#testnet-faucet channel) or community members


Public RPC providers (for reliability): Dwellir, GetBlock, or Chainstack — useful if official endpoints are slow.
Token: TAO (τ)
Mainnet: TAO — buy on exchanges (e.g., Binance, MEXC), transfer to wallet.
Testnet: testTAO — request from Bittensor Discord faucet (post your hotkey address).
Usage for subnets: Pay registration fee (dynamic, ~100-1000 TAO on mainnet; low/free on testnet), stake for immunity, recycle emissions.

Wallets Setup
Bittensor uses coldkey (holds TAO, secure) + hotkey (for mining/validating operations).

Install btcli (see below).
Create wallet:
btcli wallet new_coldkey --wallet.name mycoldkey
btcli wallet new_hotkey --wallet.name mycoldkey --wallet.hotkey myhotkey

Supported wallets:
btcli (CLI) — simplest for devs.
Talisman or Subwallet (browser extensions) — Polkadot-compatible.
TAO.com Wallet (mobile).
Ledger hardware support.
Polkadot.js (web UI: https://polkadot.js.org/apps/?rpc=wss://entrypoint-finney.opentensor.ai:443).


Backup your mnemonic securely!
btcli Installation & Basic Usage
btcli is the main CLI tool.

Install Python 3.10+ and virtual env.
Install:textpip install bittensor(This installs btcli + SDK.)
Switch to testnet:textbtcli config --network test
Common commands:
btcli wallet balance — check TAO.
btcli subnet list — view subnets.
btcli subnet create — register new subnet (testnet cheap).


Creating & Deploying Your Subnet (ZK-Compose)
Follow the official guide: https://docs.learnbittensor.org/subnets/create-a-subnet
Testnet Steps (Recommended for Hackathon Round II):

Get testTAO from Discord faucet.
Use subnet template:textgit clone https://github.com/opentensor/bittensor-subnet-template
cd bittensor-subnet-template
Customize for ZK-Compose:
Edit neurons/miner.py: Implement recursive composition (use libraries like halo2, nova-zk, or plonk via Python wrappers).
Edit neurons/validator.py: Verification + scoring (succinctness, depth bonuses).
Define protocol in protocol.py (synapse for proof submission).

Register subnet on testnet:textbtcli subnet create --network test --wallet.name mycoldkey --wallet.hotkey default(Gets you a netuid, e.g., temporary for testing.)
Run miner/validator:textpython neurons/miner.py --netuid <your_netuid> --wallet.name mycoldkey --wallet.hotkey myhotkey --network test
python neurons/validator.py --netuid <your_netuid> ... (similar)
Register keys on subnet:textbtcli subnet register --netuid <your_netuid> --network test

For ZK-Compose Specifics:

Libraries: Use gnark, halo2-proofs (Rust via Python bindings) or EZKL for zkML integration.
Start simple: Mock base proofs → recursive folding with Nova.
Compute: Basilica credits (hackathon prize) can help with heavy proving.

Mainnet Migration (Post-Hackathon):

Higher registration cost.
Need immunity period (stake TAO).

Official Documentation & Resources

Main Docs Hub: https://docs.learnbittensor.org/
Create Subnet Guide: https://docs.learnbittensor.org/subnets/create-a-subnet
Subnet Template & Testnet Tutorial: https://github.com/opentensor/bittensor-subnet-template (includes running_on_testnet.md)
btcli Reference: https://docs.learnbittensor.org/btcli
SDK/API: https://docs.learnbittensor.org/sdk/bt-api-ref
Mining/Validating: https://docs.learnbittensor.org/miners
Networks & Endpoints: https://docs.learnbittensor.org/concepts/bittensor-networks
Discord: Join for faucet, help, and updates (most active community).