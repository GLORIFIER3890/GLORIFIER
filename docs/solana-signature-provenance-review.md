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
5. Update the canonical identity and registry seed together in a dedicated change, add a regression test asserting equality, and preserve the evidence URLs/artifact hashes.
6. Rerun the Solana verifier tests, asset-registry tests, TypeScript lint, and required CI/security checks.

## Scope and safety

This finding concerns **repository provenance consistency**, not a claim that the mint itself is invalid. The existing reconciliation record and reported on-chain status are not superseded by this review. Until the acceptance gate passes, cross-file signature consistency remains `NOT VERIFIED`. No signing, transfer, redeployment, authority change, or other on-chain operation is authorized or needed for this review.
