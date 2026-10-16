# Solana mainnet signature provenance review

**Review date:** 2026-10-14  
**Mint:** `7Mqd7dSqbE4pgQvozYdCQ1EMABj2ecTrUxLTHceBvkv9`  
**Current status:** `NOT VERIFIED` for cross-file mint-transaction provenance consistency.

## Observed repository values

The current `solana/canonical-mainnet-identity.json` records the mint transaction as:

`Ast4qmsxwCDcA5eLjrNJ4QH6q9H7GwdAi1CwFMDgCySVHChmY7MEdz8vdfpszFn3SqSyF95fejgLyzMeU9aswQa`

The current `solana/token.json` does not include a mint-transaction signature. The canonical deployment seed in `src/lib/asset-registry.ts` records:

`Ast4qmsxwCDcA5eLjrNJ4QH6q9H7GwdAi1CwFMDgCySVHChyV7MEdz8vdfpszFn3SqSyF95fejgLyzMeU9aswQa`

These strings differ (`HChmY7` versus `HChyV7`). Repository text alone cannot determine which value is correct. Do not silently choose one, infer a typo, or alter on-chain state.

## Acceptance gate

1. Query both signatures independently from a trusted Solana Mainnet RPC or explorer using finalized commitment.
2. Capture each signature's status, slot, transaction message, instructions, and relevant account/mint addresses. Record unavailable/not-found responses explicitly.
3. Compare the observed transaction with the finalized reconciliation artifact and immutable deployment provenance for the canonical mint.
4. Have a reviewer confirm which signature represents the mint transaction. If neither does, investigate the actual mint initialization history rather than inventing a replacement.
5. Reconcile `solana/canonical-mainnet-identity.json`, `solana/deployment-mainnet-provenance.json`, and `src/lib/asset-registry.ts` together in a dedicated reviewed change; keep the canonical transaction unset until evidence supports one value.
6. Add a regression test asserting all three values match before `FULLY_VERIFIED` publication; keep the release publication script fail-closed until that test and the independent evidence pass.
7. Rerun the Solana verifier tests, asset-registry tests, TypeScript lint, shell syntax checks, and required CI/security checks.

## Scope and safety

This finding concerns **repository provenance consistency**, not a claim that the mint itself is invalid. The existing reconciliation record and reported on-chain status are not superseded by this review. Until the acceptance gate passes, cross-file signature consistency remains `NOT VERIFIED`. No signing, transfer, redeployment, authority change, or other on-chain operation is authorized or needed for this review.


## Follow-up status update — 2026-10-16

The canonical identity file, runtime asset-registry seed, current registry documentation, and repository presentation metadata are being aligned to report `PARTIALLY_VERIFIED` while the two signatures remain unreconciled. The on-chain reconciliation evidence is preserved; no transaction signature is selected by inference, and no on-chain operation is needed for this status correction.
