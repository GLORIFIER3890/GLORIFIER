import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const identity = JSON.parse(readFileSync('solana/canonical-mainnet-identity.json', 'utf8')) as {
  status: string;
  mainnet_status: string;
  cross_file_provenance_status: string;
  mint_transaction: string | null;
  reported_mint_transaction_signatures: string[];
};
const provenance = JSON.parse(readFileSync('solana/deployment-mainnet-provenance.json', 'utf8')) as {
  mintTransaction: string;
};
const registrySource = readFileSync('src/lib/asset-registry.ts', 'utf8');
const runtimeMatch = registrySource.match(
  /deploymentId:\s*'glr-solana-mainnet-beta'[\s\S]*?deploymentTransaction:\s*(?:'([^']+)'|(null))/,
);
assert.ok(runtimeMatch, 'Solana runtime registry seed must declare its deployment transaction');
const runtimeMintTransaction = runtimeMatch[1] ?? null;

if (identity.cross_file_provenance_status === 'VERIFIED') {
  assert.ok(identity.mint_transaction, 'verified provenance requires a canonical mint transaction');
  assert.equal(identity.status, 'VERIFIED_ON_CHAIN');
  assert.equal(identity.mainnet_status, 'FULLY_VERIFIED');
  assert.equal(identity.mint_transaction, provenance.mintTransaction, 'identity and deployment provenance must match');
  assert.equal(identity.mint_transaction, runtimeMintTransaction, 'identity and runtime registry must match');
} else {
  assert.equal(identity.status, 'PARTIALLY_VERIFIED', 'unreconciled provenance must not claim full verification');
  assert.equal(identity.mainnet_status, 'PARTIALLY_VERIFIED');
  assert.equal(identity.mint_transaction, null, 'do not select a canonical signature before reconciliation');
  assert.equal(runtimeMintTransaction, null, 'runtime registry must not select a conflicting signature');
  assert.ok(
    identity.reported_mint_transaction_signatures.includes(provenance.mintTransaction),
    'the observed deployment-provenance signature must remain recorded for reconciliation',
  );
}

console.log('Solana GLR cross-file provenance gate passed');
