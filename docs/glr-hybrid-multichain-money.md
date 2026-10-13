# GLORIFIER hybrid multichain money architecture

**Status: DESIGN / NOT YET IMPLEMENTED END-TO-END.** This document defines a safe target architecture. It does not claim that GLR is a stablecoin, legal tender, a bank deposit, redeemable for fiat, or transferable across chains today.

## Product goal

Build GLR into a **multichain utility and settlement asset** for governed AI-agent commerce, with user experience inspired by useful properties of crypto-assets and fiat payment systems. No coin can literally include every feature of every coin or every fiat currency: properties conflict, and some require issuers, reserves, liquidity, licensing, or external infrastructure.

The design principle is **one governed economic system, multiple chain-specific representations and adapters**. Existing chain deployments remain distinct identities until a reviewed bridge or interoperability protocol proves the linkage.

## Feature model

| Capability | Target behavior | Boundary / proof required |
|---|---|---|
| Digital bearer-style transfers | Wallet-to-wallet GLR transfers on supported networks | Network-specific token, wallet and transaction evidence |
| Smart-contract programmability | Pay for approved AI services and machine-to-machine jobs | Audited contracts, policy enforcement, tests |
| Multichain portability | Transfer or settle between supported chains | Independently reviewed bridge/message protocol, replay protection, rate limits, reconciliation; not implied by having tokens on several chains |
| Fiat-like quoting | Show service prices in a chosen fiat reference currency, then quote a GLR amount | Timestamped FX source, quote expiry, slippage disclosure; a quote is not a peg |
| Fiat on/off-ramp | Optional licensed provider converts fiat to/from crypto | Provider availability, KYC/AML and local-law requirements, fees and settlement evidence |
| Stable-value mode | Optional future fiat-backed stablecoin product, only if separately authorized | Legal issuer, reserve assets, segregation, attestations/audits, redemption terms, licensing and ongoing controls |
| Payments | Intent, quote, authorization, confirmation, receipt, refund/dispute lifecycle | Server-side independent verification; client claims never count as proof |
| Privacy | Minimize personal data and avoid putting sensitive data on-chain | Threat model, retention rules, lawful compliance and privacy review |
| Governance | Policy checks, spend limits, human approval for consequential actions | Versioned policies, approvals, immutable evidence and emergency pause procedures |
| Merchant/agent settlement | Pay only for defined service outcomes; support refunds and disputes | Idempotency, delivery evidence, settlement reconciliation, accounting records |
| Security and recovery | Multisig/timelock where applicable, key rotation plans, monitoring, circuit breakers | Audits, tested recovery, independent operators and incident response |
| Interoperability | APIs and adapters for EVM, Solana and future networks | Per-chain identity mapping, decimals-safe math, finality rules, conformance tests |

## Chain model

- **Ethereum:** existing ERC-20 GLR identity, using its own contract address and 18-decimal unit scale.
- **BNB Smart Chain:** existing ERC-20-compatible GLR identity, with its own contract address and 18-decimal unit scale.
- **Solana:** existing Token-2022 GLR identity, with its own mint and 9-decimal unit scale.
- **Canonical identity registry:** records network, chain ID/genesis identity, contract or mint, decimals, supply observations, authorities, explorer links, evidence timestamps and verification status.

Never compare raw integer token amounts across networks without converting using each asset's decimals. Never treat similarly named tokens as fungible solely because their name and symbol match.

## Architecture

1. **Asset registry:** a reviewed, versioned mapping of each supported network's canonical GLR identifier.
2. **Payment intent service:** binds a unique intent to service/version, payer, network, token contract or mint, recipient, exact amount, quote expiry and policy decision.
3. **Chain adapters:** read authoritative chain state and apply network-specific finality rules.
4. **Independent verifier:** checks network identity, exact asset, recipient, amount, successful transaction, finality, intent binding and replay status. A request body's `externallyVerified: true` field is never sufficient.
5. **Settlement ledger:** idempotent state transitions; append-only evidence references; explicit pending, committed, failed, refund-pending and refunded states.
6. **Governance engine:** policy, spend limits, sanctions/compliance integrations where required, approval gates and emergency stop.
7. **Quote and fiat integrations:** fetch timestamped exchange rates from a configured provider, calculate an indicative GLR amount, set expiry and disclose spread/fees. Never silently promise a fixed fiat value.
8. **Receipt and reconciliation:** issue machine-readable receipts and reconcile application records against chain observations and provider statements.
9. **Merchant/agent SDK:** standardize payment requests, callbacks, receipts, idempotency keys and error handling.

## Monetary and supply policy

- Do not mint additional GLR, change existing token authorities, deploy replacement tokens, bridge assets, or move funds as part of this design change.
- Do not advertise GLR as pegged to USD, LAK, or any fiat currency without an explicitly authorized and operational redemption/reserve mechanism.
- A displayed fiat conversion is an **indicative market quote**, not a redemption promise or guaranteed value.
- If a stablecoin is later desired, assess whether it should be a separate regulated product rather than changing GLR's identity. Define issuer, reserve and redemption obligations before implementation.
- Record total supply per chain and any bridge escrow/wrapped supply separately; define a formal cross-chain supply invariant before enabling bridging.
- Do not describe GLR as legal tender, insured, guaranteed, risk-free, or universally accepted.

## Security gates before real money

- Threat model and independent smart-contract/security review.
- Chain-specific verifier tests for wrong network, wrong token, wrong recipient, wrong amount, failed transaction, insufficient finality, replay, duplicate webhook and stale quote.
- Bridge design review covering message authentication, validator/guardian trust, rate limits, pause controls, mint/burn permissions, supply reconciliation and recovery.
- Secrets stored only in managed secret stores; privileged actions require least privilege and human approval.
- Testnet and adversarial testing first; no mainnet deployment or fund movement without explicit authorization and approved release evidence.
- Refund, dispute, outage, chain reorganization and provider-failure procedures.
- Public status labels must reflect evidence: NOT VERIFIED until independent checks pass.

## Delivery phases

1. **Specification and registry:** document canonical network identities and decimal-safe amounts.
2. **Quote-only prototype:** fiat reference pricing with quote timestamp, expiry and clear non-peg disclosure; no custody or transfer.
3. **Single-chain service pilot:** one AI service, payment intent, independent verification, receipt, refund path and reconciliation.
4. **Second/third chain adapters:** enable only after the same conformance suite passes independently for each network.
5. **Interoperability assessment:** compare audited protocol options; choose one only after a documented trust and supply model. No bespoke bridge by default.
6. **Optional fiat rails:** integrate a compliant provider where available and legally permitted.
7. **Optional stable-value product:** separate legal, reserve, audit, redemption and operational approval process.

## Launch acceptance criteria

- Every settlement is bound to a unique approved intent and verified from an authoritative source.
- Duplicate processing cannot create duplicate settlement.
- Chain, asset, recipient, amount, decimals and finality are checked independently.
- No unsupported fiat peg or bridge claim appears in product copy.
- Cross-chain supply and escrow are reconciled, or cross-chain transfer remains disabled.
- Receipts, refunds, failed payments and reconciliation are covered by automated tests.
- Production launch requires human approval and evidence of security review.

## References

- [Wormhole Wrapped Token Transfers overview](https://wormhole.com/docs/products/token-bridge/overview/) — illustrates lock-and-mint representations and cross-chain trust requirements.
- [Uniswap SuperchainERC20 deployment guide](https://developers.uniswap.org/docs/unichain/guides/deploy-a-superchain-erc20) — illustrates that interoperability is implemented through explicit token standards, not symbol matching.
- [Blockchain Security Standards Council](https://specs.blockchainssc.org/) — security, key management and token integration guidance.

These references are design inputs, not endorsements or proof that any bridge or integration is suitable for GLR.


## Implemented API prototype (behind merge and deployment gates)

- `GET /api/glr-commerce/quote?currency=USD` — returns the published 1 GLR service tariff and USD reference. Other three-letter currencies use the Open ER API USD reference feed, with the source observation timestamp and a 48-hour freshness window. Provider failure returns an error rather than inventing a rate.
- `GET /api/glr-commerce/quote?currency=LAK` — attempts the same USD-to-LAK reference conversion when the provider supplies a fresh LAK rate. This is not a bank FX offer.
- `POST /api/glr-commerce/ai-summary` — requires authentication and a payment intent owned by that payer, with the exact service tariff, payee, Ethereum mainnet rail, and a persisted `SETTLED / VERIFIED` state. It uses the configured live AI provider registry; if providers are unavailable, no successful output is fabricated.
- Redemption records are stored in PostgreSQL with a unique payment-intent key, prompt hash, and idempotent result cache to prevent one verified intent from paying for repeated or different requests.
- The endpoint intentionally rejects intents that have not already been independently verified. An Ethereum mainnet RPC verifier is implemented, but real settlement remains disabled until `GLR_ETHEREUM_PAYMENT_RECIPIENT` is configured and the authenticated payer has a server-controlled wallet-binding record created only after independent proof-of-control verification.

### Optional GLR/USD reference feed configuration

Set `GLR_USD_PRICE`, `GLR_USD_PRICE_SOURCE`, and `GLR_USD_PRICE_OBSERVED_AT` only when an operator has an actual rate observation from a documented source. Optionally set `GLR_USD_PRICE_MAX_AGE_SECONDS` (default 86400; capped at 604800). These environment values are operator-supplied evidence, not independently verified market data. If absent, the API shows no GLR fiat valuation.

The service tariff is currently **1 GLR per summary** and the USD tariff reference is **$0.05**. That is a service-pricing proposal, not a market valuation, redemption commitment, or peg. Do not launch a production paid-service promise until the server-side verifier and end-to-end tests are complete.


### Ethereum settlement enablement gate

The Ethereum verifier checks chain ID 1, successful mined receipt, the canonical GLR contract, exactly one Transfer event matching the exact intent amount, the configured recipient, the expected payer wallet, and at least 12 confirmations (configurable upward). Configure `GLR_ETHEREUM_PAYMENT_RECIPIENT`; optionally configure `GLR_ETHEREUM_RPC_URL` and `GLR_ETHEREUM_MIN_CONFIRMATIONS`. Verification remains disabled unless the recipient is configured.

The payer wallet must also have a server-controlled row in `glorifier_glr_wallet_bindings` tied to the authenticated user, with a non-empty `proof_ref` and `verified_at`. This repository does not yet expose a self-service wallet-binding endpoint: an operator must not insert that row until wallet control has been independently verified. A user-supplied wallet address or metadata flag is not proof of ownership. The unique settlement-transaction index prevents a transaction hash from paying multiple intents.
