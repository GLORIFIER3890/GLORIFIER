import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const identity = JSON.parse(readFileSync('solana/canonical-mainnet-identity.json', 'utf8')) as {
  status: string;
  mainnet_status: string;
  cross_file_provenance_status: string;
  mint_transaction: string | null;
  reported_mint_transaction_signatures: string[];
  canonical_mint: string;
};
const provenance = JSON.parse(readFileSync('solana/deployment-mainnet-provenance.json', 'utf8')) as {
  mintTransaction: string;
};
const disputedSignatures = [
  'Ast4qmsxwCDcA5eLjrNJ4QH6q9H7GwdAi1CwFMDgCySVHChmY7MEdz8vdfpszFn3SqSyF95fejgLyzMeU9aswQa',
  'Ast4qmsxwCDcA5eLjrNJ4QH6q9H7GwdAi1CwFMDgCySVHChyV7MEdz8vdfpszFn3SqSyF95fejgLyzMeU9aswQa',
];
const registrySource = readFileSync('src/lib/asset-registry.ts', 'utf8');
const runtimeMatch = registrySource.match(
  /deploymentId:\s*'glr-solana-mainnet-beta'[\s\S]*?deploymentTransaction:\s*(?:'([^']+)'|(null))/,
);
assert.ok(runtimeMatch, 'Solana runtime registry seed must declare its deployment transaction');
const runtimeMintTransaction = runtimeMatch[1] ?? null;
const runtimeStatusMatch = registrySource.match(
  /deploymentId:\s*'glr-solana-mainnet-beta'[\s\S]*?status:\s*'([^']+)'/,
);
assert.ok(runtimeStatusMatch, 'Solana runtime registry seed must declare a deployment status');
const runtimeStatus = runtimeStatusMatch[1];

if (identity.cross_file_provenance_status === 'VERIFIED') {
  assert.ok(identity.mint_transaction, 'verified provenance requires a canonical mint transaction');
  assert.equal(identity.status, 'VERIFIED_ON_CHAIN');
  assert.equal(identity.mainnet_status, 'FULLY_VERIFIED');
  assert.equal(runtimeStatus, 'fully_verified', 'runtime status must match verified canonical provenance');
  assert.equal(identity.mint_transaction, provenance.mintTransaction, 'identity and deployment provenance must match');
  assert.equal(identity.mint_transaction, runtimeMintTransaction, 'identity and runtime registry must match');
} else {
  assert.equal(
    identity.cross_file_provenance_status,
    'NOT_VERIFIED',
    'unknown or missing cross-file provenance status must not be treated as a valid partial state',
  );
  assert.equal(identity.status, 'PARTIALLY_VERIFIED', 'unreconciled provenance must not claim full verification');
  assert.equal(identity.mainnet_status, 'PARTIALLY_VERIFIED');
  assert.equal(runtimeStatus, 'partially_verified', 'runtime status must remain partial until provenance is reconciled');
  assert.equal(identity.mint_transaction, null, 'do not select a canonical signature before reconciliation');
  assert.equal(runtimeMintTransaction, null, 'runtime registry must not select a conflicting signature');
  assert.ok(
    identity.reported_mint_transaction_signatures.includes(provenance.mintTransaction),
    'the observed deployment-provenance signature must remain recorded for reconciliation',
  );
  for (const signature of disputedSignatures) {
    assert.ok(identity.reported_mint_transaction_signatures.includes(signature),
      'both disputed signature candidates must remain recorded until finalized RPC reconciliation');
  }
}

process.stdout.write('Solana GLR cross-file provenance gate passed\n');
