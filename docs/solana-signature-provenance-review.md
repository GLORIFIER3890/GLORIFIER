# Solana mainnet signature provenance review

**Review date:** 2026-10-14  
**Mint:** `7Mqd7dSqbE4pgQvozYdCQ1EMABj2ecTrUxLTHceBvkv9`  
**Current status:** `NOT VERIFIED` for cross-file mint-transaction provenance consistency.

## Observed repository values

The historical canonical identity and the deployment provenance record reported this signature:

`Ast4qmsxwCDcA5eLjrNJ4QH6q9H7GwdAi1CwFMDgCySVHChmY7MEdz8vdfpszFn3SqSyF95fejgLyzMeU9aswQa`

The canonical deployment seed in `src/lib/asset-registry.ts` reported a different signature:

`Ast4qmsxwCDcA5eLjrNJ4QH6q9H7GwdAi1CwFMDgCySVHChyV7MEdz8vdfpszFn3SqSyF95fejgLyzMeU9aswQa`

These strings differ (`HChmY7` versus `HChyV7`). A finalized mainnet-beta RPC response supports `HChmY7` as the successful mint transaction, while a second provider returned null for that candidate. The canonical identity and runtime registry record `HChmY7` as the evidence-supported candidate, while retaining both reported signatures and keeping overall provenance `PARTIALLY_VERIFIED` pending independent review. Do not upgrade the status to fully verified based on repository text alone or alter on-chain state.

## Acceptance gate

1. Query both signatures independently from a trusted Solana Mainnet RPC using finalized commitment. Explorer results are corroborating evidence only and cannot satisfy this RPC gate on their own.
2. Capture each signature's status, slot, transaction message, instructions, and relevant account/mint addresses. Record unavailable/not-found responses explicitly.
3. Compare the observed transaction with the finalized reconciliation artifact and immutable deployment provenance for the canonical mint.
4. Have a reviewer confirm which signature represents the mint transaction. If neither does, investigate the actual mint initialization history rather than inventing a replacement.
5. Independently review the finalized-RPC evidence and verify that `solana/canonical-mainnet-identity.json`, `solana/deployment-mainnet-provenance.json`, and `src/lib/asset-registry.ts` consistently record the evidence-supported `HChmY7` candidate. Keep overall status `PARTIALLY_VERIFIED` until that review and the provenance CI gate pass.
6. Add a regression test asserting all three values match before `FULLY_VERIFIED` publication; keep the release publication script fail-closed until that test and the independent evidence pass.
7. Rerun the Solana verifier tests, asset-registry tests, TypeScript lint, shell syntax checks, and required CI/security checks.

## Scope and safety

This finding concerns **repository provenance consistency**, not a claim that the mint itself is invalid. The existing reconciliation record and reported on-chain status are not superseded by this review. Until the acceptance gate passes, cross-file signature consistency remains `NOT VERIFIED`. No signing, transfer, redeployment, authority change, or other on-chain operation is authorized or needed for this review.


## Follow-up status update — 2026-10-16

The canonical identity file, runtime asset-registry seed, current registry documentation, and repository presentation metadata record `HChmY7` as the finalized-RPC-supported candidate while preserving the competing historical signature. Overall status remains `PARTIALLY_VERIFIED` because independent provider evidence and reviewer confirmation are incomplete. No on-chain operation is needed for this status correction.

## Explorer cross-check — 2026-10-16

A public Solscan lookup now returns the `HChmY7` signature as a successful, finalized transaction minting 1,000,000,000 GLR to the canonical mint account: [Solscan transaction](https://solscan.io/tx/Ast4qmsxwCDcA5eLjrNJ4QH6q9H7GwdAi1CwFMDgCySVHChmY7MEdz8vdfpszFn3SqSyF95fejgLyzMeU9aswQa). The `HChyV7` candidate returns “unable to locate this tx hash”: [Solscan lookup](https://solscan.io/tx/Ast4qmsxwCDcA5eLjrNJ4QH6q9H7GwdAi1CwFMDgCySVHChyV7MEdz8vdfpszFn3SqSyF95fejgLyzMeU9aswQa).

This is useful corroborating explorer evidence, but it is not yet the direct finalized Solana RPC reconciliation required by the acceptance gate. Keep overall status `PARTIALLY_VERIFIED` until an independent reviewer confirms the finalized-RPC evidence and the registry files are reconciled. The current files record `HChmY7` as the evidence-supported candidate; do not claim full verification yet.


## Direct finalized RPC reconciliation — 2026-10-17

A read-only JSON-RPC `getTransaction` request to `https://api.mainnet-beta.solana.com` with `commitment: finalized`, `maxSupportedTransactionVersion: 0`, and `encoding: jsonParsed` returned the HChmY7 candidate at slot `454519862`, block time `1791455822`, `meta.err: null`, and fee `5000` lamports. The parsed instruction is Token-2022 `mintToChecked`, targeting canonical mint `7Mqd7dSqbE4pgQvozYdCQ1EMABj2ecTrUxLTHceBvkv9`, amount `1000000000000000000` base units (1,000,000,000 GLR), decimals `9`. The same endpoint returned `result: null` for the HChyV7 candidate.

A second public RPC endpoint (`https://solana-rpc.publicnode.com`) returned `result: null` for HChmY7, which may reflect provider retention/indexing and is not treated as proof that the transaction did not exist. The successful finalized response on the first endpoint supports HChmY7 as the canonical mint transaction; keep overall status `PARTIALLY_VERIFIED` until an independent reviewer and the provenance CI gate confirm the cross-file reconciliation. No transaction was submitted and no on-chain state was changed.
