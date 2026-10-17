# GLORIFIER GLR — Solana Mainnet Release Gate

## Production rule

GLR Mainnet is a real production asset. Solana documents Mainnet as the live production environment and recommends dedicated/private RPC infrastructure for production rather than the shared public endpoint.

The release path used for the original deployment was:

1. Authorized Solana Devnet deployment.
2. Independent Devnet reconciliation.
3. `solana/canonical-devnet-identity.json` becomes `VERIFIED_ON_CHAIN`.
4. Human-approved `glorifier-solana-mainnet` GitHub Environment.
5. Mainnet Token-2022 deployment.
6. Mainnet deployment artifact and provenance validation.
7. Independent read-only Mainnet reconciliation.
8. Independent transaction confirmation.
9. Publish `solana/canonical-mainnet-identity.json` as `FULLY_VERIFIED` only after the preceding evidence is available.

No step treats code presence as on-chain proof.

## Required GitHub Environment

Create a protected environment named `glorifier-solana-mainnet` with required reviewers.

Environment secrets:

- `SOLANA_MAINNET_RPC_URL` — dedicated/private production Solana RPC.
- `GLORIFIER_SOLANA_MAINNET_KEYPAIR_JSON` — production deployment signer.

Never put the production keypair in repository files, frontend code, or ordinary repository variables.

## Token contract

- Name: GLORIFIER
- Symbol: GLR
- Standard: Token-2022
- Canonical mint: `7Mqd7dSqbE4pgQvozYdCQ1EMABj2ecTrUxLTHceBvkv9`
- Decimals: 9
- Fixed supply: 1,000,000,000 GLR
- Transfer fee: 0
- Permanent delegate: none
- Mint authority: revoked; mint authority is absent on-chain
- Freeze authority: absent at initialization; no freeze-authority revocation transaction is expected
- Metadata pointer/update authority: disabled; the on-chain metadata URI is immutable
- On-chain metadata URI: `https://raw.githubusercontent.com/GLORIFIER7/GLORIFIER/d0d5c16fc4a74099c125c8aac594352d53675177/solana/token.json`
- Repository presentation metadata: `https://raw.githubusercontent.com/GLORIFIER7/GLORIFIER/main/solana/token.json` (supplemental; does not replace the immutable on-chain URI)

## Safety boundaries

- Mainnet workflow is manual-only.
- Exact authorization string is required.
- Mainnet requires human approval through the protected environment.
- Devnet verification is a hard prerequisite for a new deployment.
- Public Mainnet RPC is rejected.
- A replay lock blocks creation of a second mint when prior mainnet deployment evidence exists.
- Deployment provenance, artifact digest, mint identity, transaction signatures, and independent on-chain confirmation are required for verification.
- No automatic trading, transfers, treasury movement, bridge operation, or exchange listing is performed.

## Current status — reconciled record

**Current canonical status: `PARTIALLY_VERIFIED` for repository provenance consistency.** Finalized read-only reconciliation supports the mint's on-chain identity, but `docs/solana-signature-provenance-review.md` identifies conflicting mint transaction signatures in the canonical identity and runtime registry seed (`HChmY7` versus `HChyV7`). Keep the on-chain identity record separate from this unresolved cross-file provenance claim; do not infer the correct signature or redeploy.

- Verification workflow run: [37886411021](https://github.com/GLORIFIER7/GLORIFIER/actions/runs/37886411021)
- Reconciliation run number reported by the registry: 87
- Verified at: 2026-10-09T05:03:36Z
- Evidence artifact review: completed 2026-10-09

The published reconciliation evidence remains relevant to on-chain identity, but it does not resolve the later-discovered cross-file signature discrepancy. Resolve the signature using independent finalized RPC transaction data and reviewer confirmation before restoring `FULLY_VERIFIED` provenance status. Do not redeploy or create a second mint to resolve this documentation mismatch.

### Authority evidence interpretation

An empty `freeze_authority_revocation_transaction` is intentional here: the freeze authority was already absent at initialization, as recorded by the deployment provenance and reconciliation evidence. It must not be described as a missing revocation transaction. The mint authority, by contrast, was revoked and has a recorded transaction signature. Empty metadata authority-revocation transaction fields likewise do not imply missing transactions when the corresponding authorities were initially absent or disabled, as evidenced by the reconciled mint state.

Solana's authority model treats setting an authority to `None` as permanent removal; an authority that was absent from initialization has no revocation transaction to report. See the [official Set Authority documentation](https://solana.com/docs/tokens/basics/set-authority).

The `solana/mainnet-recovery.json` record is retained for the release workflow's explicit recovery gate and records the historical interrupted deployment attempt. Do not change its gate status casually: update it only together with the workflow logic and tests that consume it.
