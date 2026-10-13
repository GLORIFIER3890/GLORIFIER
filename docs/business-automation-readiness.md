# GLORIFIER Business Automation Readiness

## Purpose

This document separates automated checks from proven production outcomes. Passing CI is evidence that code checks passed; it is not proof that the deployed application is healthy, a customer has paid, an AI response was delivered, or revenue was received.

## Automation status and acceptance gates

| Capability | Evidence required before calling it operational |
| --- | --- |
| Daily reliability monitoring | A scheduled workflow completes, records a timestamped result, alerts an owner on failure, and checks both code and a configured live health endpoint. |
| AI summary service | A production-like request produces a real summary from an available provider, records request/result metadata, and handles provider quota/outage without claiming success. |
| Verified GLR payment and delivery | A server-bound payment intent identifies the authorized payer, exact tariff, recipient and network; independent on-chain verification passes; duplicate payment proofs are rejected; service delivery is idempotent and tied to the verified intent. |
| Customer acquisition | A documented public demo/API, clear terms and contact path exist; prospects and consented follow-ups are tracked. Discovery automation must not send unsolicited bulk messages or fabricate leads. |
| Customer onboarding | The customer explicitly accepts terms, receives API instructions, configures their own credentials, and passes a test-mode walkthrough before any live payment. |
| Verified revenue | A reconciled ledger record is backed by a verified settlement and service outcome. Forecasts, quotes, token balances, offers and test transactions are not revenue. |
| Production autonomy | Agents may perform bounded, reversible, non-financial tasks under least privilege. Production releases, credential changes, external commitments, wallet signing, transfers, payouts, supply/authority changes and other irreversible financial/blockchain actions require explicit owner authorization. |

## Daily workflow

`.github/workflows/business-reliability.yml` runs every day and on manual dispatch. It type-checks the repository and runs GLR commerce and Ethereum, BNB and Solana verifier tests. It deliberately does not make a live payment or change production infrastructure.

A green workflow is a software-regression signal only. A live application health URL and deployment credentials have not been assumed; add a separately configured, read-only health probe once the production endpoint and expected response contract are verified.

## Paid AI summary acceptance test

Before launch, demonstrate all of the following in a controlled environment:

1. A customer creates a quote/payment intent for the published tariff.
2. The server binds the intent to the authenticated customer and payer wallet; the customer cannot choose another recipient or change the price after authorization.
3. A real transaction on the selected supported mainnet is independently verified against the canonical token/mint, chain, exact amount, payer, configured recipient and required finality.
4. The same transaction or intent cannot be replayed to obtain multiple summaries.
5. Only after verification does the service call an available AI provider and return the summary.
6. The request, payment evidence, provider result, delivery status and revenue-ledger entry can be reconciled using a stable request/intent ID.
7. Failure at any step leaves the request unpaid/unfulfilled or explicitly pending; it must never manufacture payment or delivery evidence.

The proposed tariff is **1 GLR per summary**. Any **$0.05 USD** figure is a service-price reference only, not a GLR exchange rate, stablecoin peg, reserve, or redemption promise.

## Customer acquisition and onboarding

Start with one narrowly defined summary use case and a public demo. Invite a small number of relevant developers or businesses to test it, explain that live payments are not proven until the acceptance test passes, and collect consented feedback. Track lead source, consent, demo completion, trial status, onboarding status, support issue, and verified paid conversion. Do not label a lead or quote as a customer or revenue.

## Human authority and safety boundaries

Automation may gather evidence, run tests, draft changes, open a pull request, and recommend reversible repairs. It must not bypass branch protection or required checks. Keep production deployments behind repository/environment controls. Keep wallet private keys and provider credentials out of source code and logs. Do not permit an AI agent to autonomously sign transactions, transfer funds, issue payouts, trade assets, alter token supply/authorities, or make legal/financial commitments.

## Remaining proof

- [ ] Daily workflow has completed successfully on the default branch.
- [ ] Production frontend and backend health are checked through a verified, read-only endpoint.
- [ ] A real AI summary is returned from a configured provider without quota/error fallback being mislabeled as success.
- [ ] One controlled end-to-end payment-to-summary test passes on a supported network.
- [ ] Duplicate/replay and mismatched payer/recipient/amount cases are rejected.
- [ ] Revenue ledger reconciles to settlement evidence and delivered work.
- [ ] At least one pilot customer has completed onboarding and explicitly accepted the terms.
- [ ] Owner-approved release and rollback controls are documented and tested.
