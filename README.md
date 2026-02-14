# Subnet ZK-Compose: Recursive ZK Aggregation for Bittensor

Subnet ZK-Compose is a specialized meta-layer subnet on the Bittensor network dedicated to **recursive zero-knowledge (ZK) proof aggregation**. It enables scalable, private, and verifiable multi-step AI workflows across the Bittensor ecosystem.

---

## 🚀 Vision
In the exploding landscape of Bittensor inference subnets (text, image, coding), the biggest bottleneck is **scalability** and **privacy** for complex pipelines. 

ZK-Compose solves this by:
- Taking existing ZK proofs (e.g., from SN2 / DSperse).
- Composing them into single, succinct recursive proofs.
- Maintaining privacy without revealing intermediate data or models.

---

## 🧠 Core Architecture

### 1. Protocol (`template/protocol.py`)
Defines the `ZKCompose` synapse for transmitting base proofs and receiving the aggregated result.

### 2. Miner (Prover) (`neurons/miner.py`)
Generates recursive proofs using state-of-the-art folding schemes (simulated via `template/folding_logic.py`).
- **Proof of Intelligence**: Heavy mathematical compute required for witness generation and folding.

### 3. Validator (Verifier) (`neurons/validator.py`)
Mathematically confirms the validity of recursive proofs.
- **Incentive Mechanism**: Scores are distributed based on:
    - **Mathematical Validity**: 100% verification accuracy required.
    - **Succinctness**: Bonus for high compression ratios.
    - **Recursion Depth**: Higher rewards for deeper, more complex aggregation chains.

---

## 🛠️ Installation

### Prerequisites
- Python 3.10+
- [Bittensor SDK](https://github.com/opentensor/bittensor)

### Install Dependencies
```bash
pip install -e .
```

---

## 🏃 Running the Subnet

### Register Subnet (Testnet)
```bash
btcli subnet create --network test --wallet.name <coldkey> --wallet.hotkey <hotkey>
```

### Run Miner
```bash
python neurons/miner.py --netuid <netuid> --wallet.name <coldkey> --wallet.hotkey <hotkey> --network test
```

### Run Validator
```bash
python neurons/validator.py --netuid <netuid> --wallet.name <coldkey> --wallet.hotkey <hotkey> --network test
```

---

## 📄 License
This project is licensed under the MIT License.
