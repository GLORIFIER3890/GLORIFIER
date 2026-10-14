import crypto from 'node:crypto';
import { getPostgresPool } from './db/postgres';
import { listConnections } from './connection-registry';
import { listRegisteredAgents } from './agent-registry';
import { listProviders } from './ai/registry';
import { listComputeResources } from './compute/registry';

export interface IntegrationControlSnapshot {
  id: string;
  synchronizedAt: string;
  authentication: {
    firebaseBackendConfigured: boolean;
    ownerBindingConfigured: boolean;
  };
  connections: Array<{
    id: string;
    provider: string;
    status: string;
    risk: string;
    scopes: string[];
    lastVerifiedAt?: string | null;
  }>;
  agents: Array<{
    id: string;
    provider: string;
    status: string;
    connectionId: string | null;
    scopes: string[];
  }>;
  providers: ReturnType<typeof listProviders>;
  compute: ReturnType<typeof listComputeResources>;
  invariants: string[];
  digestSha256: string;
}

let latestSnapshot: IntegrationControlSnapshot | null = null;

async function ensureTable() {
  await getPostgresPool().query(`
    CREATE TABLE IF NOT EXISTS integration_control_snapshots (
      id TEXT PRIMARY KEY,
      synchronized_at TIMESTAMPTZ NOT NULL,
      snapshot JSONB NOT NULL,
      digest_sha256 TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_integration_control_snapshots_time
      ON integration_control_snapshots(synchronized_at DESC);
    ALTER TABLE integration_control_snapshots
      ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `);
}

async function digest(value: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export async function reconcileIntegrationControlPlane(actor = 'system') {
  const synchronizedAt = new Date().toISOString();
  const [connections, agents] = await Promise.all([
    listConnections().catch(() => []),
    listRegisteredAgents().catch(() => [])
  ]);

  const snapshotBase = {
    synchronizedAt,
    authentication: {
      firebaseBackendConfigured: Boolean(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
        (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS
      ),
      ownerBindingConfigured: Boolean(process.env.GLORIFIER_OWNER_UID || process.env.GLORIFIER_OWNER_EMAIL)
    },
    connections: connections.map(c => ({
      id: c.id, provider: c.provider, status: c.status, risk: c.risk,
      scopes: c.scopes, lastVerifiedAt: c.lastVerifiedAt
    })),
    agents: agents.map(a => ({
      id: a.id, provider: a.provider, status: a.status,
      connectionId: a.connectionId, scopes: a.scopes
    })),
    providers: listProviders(),
    compute: listComputeResources(),
    invariants: [
      'Authentication is required before state-changing API operations.',
      'Authorization is separate from authentication and scoped by identity, capability, tool, data scope, and risk.',
      'Provider registry is the only AI-provider execution boundary.',
      'Compute registry is the only independent-compute execution boundary.',
      'Connection registry is authoritative for integration authorization state.',
      'Synchronization records observed state; it never upgrades an unavailable or unverified resource to healthy.',
      'Estimated value never becomes verified revenue without qualifying external evidence.',
      'Human owner remains the final authority for irreversible external actions.'
    ]
  };

  // A synchronization timestamp is operational metadata, not snapshot content.
  // Excluding it lets identical state reconcile without inserting another large JSONB row.
  const digestPayload = {
    authentication: snapshotBase.authentication,
    connections: snapshotBase.connections,
    agents: snapshotBase.agents,
    providers: snapshotBase.providers,
    compute: snapshotBase.compute,
    invariants: snapshotBase.invariants
  };
  const digestSha256 = await digest(digestPayload);
  const snapshot: IntegrationControlSnapshot = {
    id: `ics-${crypto.randomUUID()}`,
    ...snapshotBase,
    digestSha256
  };

  latestSnapshot = snapshot;
  try {
    await ensureTable();
    const db = getPostgresPool();
    const previous = await db.query(
      'SELECT id, digest_sha256 FROM integration_control_snapshots ORDER BY synchronized_at DESC LIMIT 1'
    );
    if (previous.rows[0]?.digest_sha256 === digestSha256) {
      // Preserve the last material state snapshot and record that reconciliation ran.
      await db.query(
        'UPDATE integration_control_snapshots SET last_checked_at = NOW() WHERE id = $1',
        [previous.rows[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO integration_control_snapshots(id,synchronized_at,last_checked_at,snapshot,digest_sha256) VALUES($1,$2,NOW(),$3,$4)',
        [snapshot.id, snapshot.synchronizedAt, JSON.stringify(snapshot), digestSha256]
      );
    }
  } catch (error) {
    console.warn('[IntegrationControlPlane] persistence deferred:', error instanceof Error ? error.message : error);
  }

  return { actor, snapshot };
}

export async function getIntegrationControlSnapshot() {
  if (latestSnapshot) return latestSnapshot;
  try {
    await ensureTable();
    const result = await getPostgresPool().query(
      'SELECT snapshot FROM integration_control_snapshots ORDER BY synchronized_at DESC LIMIT 1'
    );
    if (result.rows[0]?.snapshot) {
      latestSnapshot = result.rows[0].snapshot as IntegrationControlSnapshot;
      return latestSnapshot;
    }
  } catch {
    // Database may be unavailable during boot; a live reconciliation can retry.
  }
  return reconcileIntegrationControlPlane('snapshot-read').then(result => result.snapshot);
}
