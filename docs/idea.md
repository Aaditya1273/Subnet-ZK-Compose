Subnet Idea Submission: Subnet ZK-Compose – The Recursive ZK Aggregation & Composition Layer for Bittensor
Core Concept
Subnet ZK-Compose is a specialized meta-layer subnet dedicated to recursive zero-knowledge proof aggregation and composition. It enables verifiable, privacy-preserving multi-step AI workflows across the Bittensor ecosystem by taking existing ZK proofs (starting with those from Subnet 2 / DSperse) and composing them into single, succinct recursive proofs — without revealing intermediate data or models.
In 2026, as Bittensor's inference subnets explode (text, image, coding, bridges), the biggest bottleneck is scalability and privacy for complex pipelines. Single-proof zkML (e.g., proving one model inference) is solved by DSperse (SN2), but chaining multiple steps privately (e.g., text prompt → image generation → medical analysis → financial prediction) remains unsolved at scale. ZK-Compose fills this gap: it becomes the Privacy Backbone for compliant, multi-subnet AI chains, unlocking enterprise adoption under regulations like the EU AI Act (full enforcement wave in 2026).
This is complementary infrastructure, not competition: we explicitly build on DSperse/SN2 as the "base proving layer" and position ZK-Compose as its official scalability partner.
Why This Idea Wins 1st Place

Novelty & Impact: No existing subnet focuses on recursive composition or cross-subnet proof bridging. This directly addresses emerging 2026 bottlenecks (recursion for efficiency, aggregation for complex pipelines) and has high "potential impact on future subnet design."
Perfect Proof of Intelligence/Effort: Recursive proving requires deep mathematical optimization (folding, compression) — impossible to fake, with cryptographic guarantees.
Ecosystem Alignment: Enhances every inference subnet by adding verifiable privacy chains. Solves adversarial behavior completely (invalid recursion = invalid proof).
Revenue & Adoption Path: Enterprises (healthcare, finance) pay in TAO for composed proofs certifying full pipelines as "verifiable and private" for regulatory compliance.
Anti-Adversarial Strength: Pure math — no subjectivity in validation.
Round II Feasibility: Start with simple recursive demos (Nova/Halo2 libraries), then integrate real DSperse-style proofs.

Detailed Mechanics & Incentive Design
High-Level Algorithm

Task Assignment: Users/subnets submit multiple base proofs (e.g., from SN2, SN1, SN3) + a composition circuit spec.
Miner Submission: Miners generate a recursive/compressed proof.
Validator Scoring: Verify correctness + measure succinctness/recursion depth.
Reward Allocation: Emit based on weighted score (base + bonuses).

Miner Design (Provers/Composers)

Tasks: Take inputs (array of base ZK proofs + circuit description) and output a single recursive proof (using systems like Nova, Ivory, or Plonk recursion).
Input → Output: Input: List of proofs (e.g., SN2 inference proof + SN120 bridge proof). Output: One succinct recursive proof + metadata (compression ratio, depth).
Performance Dimensions: Recursion depth, proof size reduction (succinctness), generation time, correctness.
Expected Effort: Heavy optimization of folding circuits and witness generation — true "proof of intelligence."

Validator Design (Recursive Verifiers)

Scoring Methodology:
Primary: Mathematical validity (recursive verification in milliseconds).
Secondary: Succinctness ratio (final proof size / sum of inputs) + recursion depth bonus.
Challenge Mechanism: Validators periodically inject synthetic recursive tasks to test miner efficiency.

Evaluation Cadence: Per-task (on-demand) + periodic consensus rounds.
Incentive Alignment: Validators earn from correct verifications; slashed for missing invalid proofs. Maintain "Verifier Trust Score" based on historical accuracy.

Incentive & Mechanism Design

Emission Logic: Base reward = Circuit complexity / time taken (as in original).
Enhanced Bonuses (Key Fix):
Recursion Depth Multiplier: 1.5x–5x for depth >2 (encourages complex chains).
Succinctness Bonus: Extra for >50% compression.
Cross-Subnet Premium: 2x if proofs from ≥2 different subnets (bootstraps inter-subnet usage).

Anti-Low-Quality/Adversarial:
Slashing for invalid proofs (crypto-enforced).
No majority voting — pure recursive verification.
Sybil resistance via compute-proof stakes.

Proof of Intelligence Qualification: Recursion demands genuine optimization; faking breaks verifiability.

Business Logic & Market Rationale

Problem Solved: Bittensor lacks native privacy for multi-step AI (current: single inferences verifiable via SN2, but chains leak data). Enterprises need end-to-end verifiable pipelines for compliance.
Competing Solutions:
Within Bittensor: SN2 (DSperse) — excellent for base proving but no recursion/aggregation focus.
External: Centralized zkML (e.g., Modulus Labs, EZKL) — trusted parties; slower/expensive.

Why Suited to Bittensor: Decentralized recursion leverages global miner compute; incentives align optimization with emissions.
Path to Long-Term Adoption:
2026 Catalyst: EU AI Act mandates verifiable high-risk AI → demand explodes.
Sustainable Business: Charge micro-TAO fees for composed proofs; external revenue from healthcare (private diagnostics chains) and DeFi (verifiable multi-model oracles).


Go-To-Market Strategy

Initial Target Users & Use Cases:
Anchor Partner: DSperse/SN2 team (position as "official aggregator").
Early Adopters: Medical subnets (private multi-modal diagnosis), SN120 (verifiable cross-chain AI).
Pilot: Free composed proofs for first 100 SN2 integrations.

Distribution & Growth Channels:
Bittensor Discord/X announcements.
Partnerships via Opentensor workshops.
Integration docs for other subnet creators.

Bootstrapping Incentives (Key Fix):
Phase 1: Simple starter circuits (e.g., recursive hash chains) to attract miners quickly.
Phase 2: Subsidized rewards for first SN2 proof compositions.
Early Miner Airdrops: Partner with Basilica for compute credits to offset hardware needs.
Validator Bootstrapping: Low initial stake + bonus for early participation.


Round II Execution Blueprint (Testnet)

Demo Focus: Functional miner generating recursive proof from 2–3 real proofs; validator verifying + scoring bonuses.
Tools: Halo2/Nova libraries for quick prototyping.
Proof of Concept: Show consistency with proposal (recursion bonuses working) + real compute usage (eligible for Basilica credits).
No Polish Needed: Prioritize correctness and incentive flow.

This refined design directly addresses all gaps: differentiates via recursion/composition, complements SN2, strengthens incentives/bootstrapping, and ties to real 2026 regulations. It's positioned for maximum judge appeal — foundational, novel, and executable.
Good luck with the submission, Aaditya! This version has strong potential. 🚀