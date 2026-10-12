# GLORIFIER Token (GLR)

This directory contains the EVM ERC-20 contract foundation for GLORIFIER. It documents contract parameters, safe deployment configuration, and the evidence required to validate a deployment. This document does not itself prove that a deployment or explorer verification succeeded.

**Governance rule:** deployment is an explicit, authorized action. Keep private keys and RPC credentials in approved secret stores; do not commit them or paste them into issues, pull requests, logs, or chat.

## EVM contract parameters

## Parameters

- Name: GLORIFIER
- Symbol: GLR
- Decimals: 18
- Initial/max supply: 1,000,000,000 GLR
- Minting after deployment: disabled
- Upgradeability: none
- Transfer tax: 0%
- Blacklist: none
- Owner/admin: none

## Build

Install Foundry, then:

```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
forge test
```

## Testnet deployment

The repository includes an authorized GitHub Actions workflow at `.github/workflows/glorifier-testnet-deploy.yml`. It requires GitHub `testnet` environment secrets:

- `GLORIFIER_DEPLOYER_PRIVATE_KEY`
- `GLORIFIER_CHAINSTACK_SEPOLIA_RPC_URL` (primary)
- `GLORIFIER_ALCHEMY_SEPOLIA_RPC_URL` (fallback)
- `GLORIFIER_ALCHEMY_API_KEY` (fallback credential alternative)
- `GLORIFIER_TESTNET_RPC_URL` (Infura fallback)
- `GLORIFIER_INFURA_PROJECT_ID` (Infura credential alternative)
- `GLORIFIER_ETHERSCAN_API_KEY` (optional explorer source verification)

The Chainstack secret must contain the Ethereum Sepolia HTTPS JSON-RPC endpoint from your Chainstack endpoint configuration. Do not paste the endpoint or any credential into source control. The private key must belong to a wallet you control and must be funded with Sepolia ETH for gas. Never commit or paste the key into source control. The initial holder is supplied manually when dispatching the workflow; if omitted, the deployer address is used.

### RPC provider failover

The workflow validates providers by calling Ethereum JSON-RPC `eth_chainId` and requires Sepolia chain ID `11155111`. Provider selection order is:

1. Chainstack
2. Alchemy
3. Infura
4. PublicNode Sepolia

Only a healthy provider is selected. Credentials are never printed. If Chainstack is configured and healthy, it is the selected transport for the deployment and subsequent on-chain evidence checks.

### Correct RPC endpoint types

Chainstack:

```text
<your Chainstack Ethereum Sepolia HTTPS JSON-RPC endpoint>
```

Alchemy Sepolia JSON-RPC:

```text
https://eth-sepolia.g.alchemy.com/v2/<API_KEY>
```

Infura Sepolia JSON-RPC:

```text
https://sepolia.infura.io/v3/<PROJECT_ID>
```

PublicNode fallback:

```text
https://ethereum-sepolia-rpc.publicnode.com
```

Do **not** use an Infura Gas API endpoint such as `https://gas.api.infura.io/...`. Gas API and Ethereum JSON-RPC are separate services.

### Alchemy Agent Wallet

The Alchemy Agent Wallet dashboard is useful for authorized, session-based EVM actions. However, the current Foundry deployment workflow intentionally does **not** attempt to extract or use an Agent Wallet private key. Alchemy documents that Agent Wallet sessions do not expose the wallet private key to the agent and do not support direct raw EVM transaction signing. Therefore an Agent Wallet dashboard session cannot simply be substituted for `GLORIFIER_DEPLOYER_PRIVATE_KEY` in this Foundry workflow.

For GLORIFIER, keep the separation:

```text
Alchemy Agent Wallet = authorized/session-based agent actions
Chainstack/Alchemy/Infura = blockchain JSON-RPC transport
Foundry deployer key = explicit deployment signer
```

If an Agent Wallet deployment path is added later, it must use the provider's supported smart-wallet call model and produce the same independent on-chain evidence. It must not weaken the Human Authority, authorization, or evidence requirements.

## Manual deployment

For an explicitly authorized local deployment:

```bash
export PRIVATE_KEY=...
export GLORIFIER_INITIAL_HOLDER=0x...
export RPC_URL=<your Chainstack Ethereum Sepolia HTTPS JSON-RPC endpoint>

forge script script/DeployGLORIFIER.s.sol:DeployGLORIFIER \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --slow
```

For production, use a dedicated deployment wallet and move treasury/control assets to a multisig. The contract itself has no admin controls.

## Evidence required

A deployment is considered **VERIFIED** only when all of the following are confirmed on Ethereum Sepolia:

- chain ID = `11155111`
- successful deployment transaction receipt
- contract address
- transaction hash
- deployed bytecode is non-empty
- name = `GLORIFIER`
- symbol = `GLR`
- decimals = `18`
- total supply = `1,000,000,000 GLR`
- initial-holder balance equals total supply

Explorer source verification is a separate optional evidence layer. Repository code or a workflow configuration alone does not constitute an on-chain deployment.

## Verification

Optional Etherscan source verification is performed only when `GLORIFIER_ETHERSCAN_API_KEY` is configured in the `testnet` environment. Source verification is separate from on-chain deployment verification: the contract can be on-chain verified without explorer source verification.

Never commit API keys or private keys.

## Status and cross-chain scope

The parameters above describe the EVM ERC-20 contract only. They do not describe a Solana Token-2022 mint, whose mint address, decimals, authorities, metadata, and provenance must be checked independently. EVM contract verification, successful deployment, source verification, metadata availability, and canonical-registry reconciliation are separate evidence items.

Before publishing a status claim, verify the current workflow run, chain ID, deployed address, transaction receipt, bytecode, token fields, and canonical registry on the relevant network. Report missing or stale evidence as **NOT VERIFIED** or **NOT OBSERVABLE**; never infer success from source code or workflow configuration alone.

The workflow and manual commands below are examples for the authorized Ethereum Sepolia testnet path. They are not instructions to deploy to mainnet, and a deployment must not be initiated without explicit authorization and the required funding.
