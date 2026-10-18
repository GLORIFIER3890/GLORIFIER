#!/usr/bin/env bash
set -euo pipefail

IDENTITY_FILE="${1:-solana/canonical-devnet-identity.json}"
RECOVERY_FILE="${2:-solana/devnet-partial-mint-recovery.json}"

[[ -f "$IDENTITY_FILE" ]] || {
  echo "ERROR: Missing canonical Devnet identity: $IDENTITY_FILE" >&2
  exit 1
}
if [[ ! -f "$RECOVERY_FILE" ]]; then
  # A missing recovery record is acceptable only for a genuinely clean initial state.
  # The deployment workflow still applies its own replay lock before any mint operation.
  jq -e '
    .asset == "GLORIFIER"
    and .symbol == "GLR"
    and .network == "solana-devnet"
    and .token_standard == "Token-2022"
    and .program_id == "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
    and .status == "NOT VERIFIED"
    and .canonical_mint == null
    and .creation_transaction == null
    and .mint_transaction == null
    and .authority_revocation_transaction == null
  ' "$IDENTITY_FILE" >/dev/null || {
    echo "ERROR: Missing recovery record is permitted only for a clean NOT VERIFIED identity." >&2
    exit 1
  }
  echo "Solana Devnet identity preflight passed: clean initial state without a recovery record."
  exit 0
fi

jq -e --slurpfile recovery "$RECOVERY_FILE" '
  .asset == "GLORIFIER"
  and .symbol == "GLR"
  and .network == "solana-devnet"
  and .token_standard == "Token-2022"
  and .program_id == "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
  and (
    (
      .status == "NOT VERIFIED"
      and .canonical_mint == null
      and .creation_transaction == null
      and .mint_transaction == null
      and .authority_revocation_transaction == null
    )
    or
    (
      .status == "VERIFIED_ON_CHAIN"
      and .canonical_mint == $recovery[0].mint
      and $recovery[0].status == "DEPLOYED"
      and $recovery[0].network == "solana-devnet"
      and $recovery[0].programId == "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
      and (.canonical_mint | type == "string" and test("^[1-9A-HJ-NP-Za-km-z]{32,44}$"))
      and .transaction_semantics_verified == false
      and has("creation_transaction")
      and (.creation_transaction == null or .creation_transaction == "null")
      and has("mint_transaction")
      and (.mint_transaction == null or .mint_transaction == "null")
      and has("authority_revocation_transaction")
      and (.authority_revocation_transaction == null or .authority_revocation_transaction == "null")
      and (.verification_run_id | type == "string" and length > 0)
      and (.verification_run_url | type == "string" and length > 0)
      and .mainnet_status == "NOT VERIFIED"
    )
  )
' "$IDENTITY_FILE" >/dev/null || {
  echo "ERROR: Canonical Devnet identity is neither a clean first-deployment state nor a valid exact-mint recovery state." >&2
  exit 1
}

echo "Solana Devnet identity preflight passed: clean initial state or guarded exact-mint recovery."
