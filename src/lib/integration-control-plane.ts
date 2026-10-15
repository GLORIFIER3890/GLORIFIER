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
let schemaReady: Promise<void> | null = null;

// Run schema setup once per process. The ALTER is idempotent for rolling upgrades,
// but is not executed on every snapshot read or reconciliation request.
const ensureTable = (): Promise<void> => {
  if (!schemaReady) {
    schemaReady = (async () => {
      await getPostgresPool().query(`
        CREATE TABLE IF NOT EXISTS integration_control_snapshots (
          id TEXT PRIMARY KEY,
          synchronized_at TIMESTAMPTZ NOT NULL,
          last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          snapshot JSONB NOT NULL,
          digest_sha256 TEXT NOT NULL
        );
        ALTER TABLE integration_control_snapshots
          ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
        CREATE INDEX IF NOT EXISTS idx_integration_control_snapshots_time
          ON integration_control_snapshots(synchronized_at DESC);
      `);
    })().catch(error => {
      // Permit a later request to retry schema setup after a transient DB failure.
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
};

const digest = (value: unknown) =>
  crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

const getAuthenticationSnapshot = () => ({
  firebaseBackendConfigured: Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  ),
  ownerBindingConfigured: Boolean(process.env.GLORIFIER_OWNER_UID || process.env.GLORIFIER_OWNER_EMAIL)
});

const getIntegrationInvariants = () => [
  'Authentication is required before state-changing API operations.',
  'Authorization is separate from authentication and scoped by identity, capability, tool, data scope, and risk.',
  'Provider registry is the only AI-provider execution boundary.',
  'Compute registry is the only independent-compute execution boundary.',
  'Connection registry is authoritative for integration authorization state.',
  'Synchronization records observed state; it never upgrades an unavailable or unverified resource to healthy.',
  'Estimated value never becomes verified revenue without qualifying external evidence.',
  'Human owner remains the final authority for irreversible external actions.'
];

const persistSnapshotIfChanged = async (
  snapshot: IntegrationControlSnapshot,
  digestSha256: string
): Promise<IntegrationControlSnapshot> => {
  let client: Awaited<ReturnType<ReturnType<typeof getPostgresPool>['connect']>> | null = null;
  try {
    await ensureTable();
    const pool = getPostgresPool();
    client = await pool.connect();
    await client.query('BEGIN');
    // Transaction-scoped advisory lock serializes comparison + insert across instances.
    await client.query("SELECT pg_advisory_xact_lock(hashtext('glorifier.integration_control_snapshots'))");
    const previous = await client.query(
      'SELECT id, digest_sha256, snapshot FROM integration_control_snapshots ORDER BY synchronized_at DESC LIMIT 1'
    );

    let effectiveSnapshot = snapshot;
    if (previous.rows[0]?.digest_sha256 !== digestSha256) {
      await client.query(
        'INSERT INTO integration_control_snapshots(id,synchronized_at,last_checked_at,snapshot,digest_sha256) VALUES($1,$2,NOW(),$3,$4)',
        [snapshot.id, snapshot.synchronizedAt, JSON.stringify(snapshot), digestSha256]
      );
    } else {
      await client.query(
        'UPDATE integration_control_snapshots SET last_checked_at = NOW() WHERE id = $1',
        [previous.rows[0].id]
      );
      if (previous.rows[0].snapshot) {
        effectiveSnapshot = previous.rows[0].snapshot as IntegrationControlSnapshot;
      }
    }

    await client.query('COMMIT');
    return effectiveSnapshot;
  } catch (error) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch { /* preserve original error */ }
    }
    console.warn('[IntegrationControlPlane] persistence deferred:', error instanceof Error ? error.message : error);
    return snapshot;
  } finally {
    client?.release();
  }
};

export const reconcileIntegrationControlPlane = async (actor = 'system') => {
  const synchronizedAt = new Date().toISOString();
  const [connections, agents] = await Promise.all([
    listConnections().catch(() => []),
    listRegisteredAgents().catch(() => [])
  ]);

  const snapshotBase = {
    synchronizedAt,
    authentication: getAuthenticationSnapshot(),
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
    invariants: getIntegrationInvariants()
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
  const digestSha256 = digest(digestPayload);
  const snapshot: IntegrationControlSnapshot = {
    id: `ics-${crypto.randomUUID()}`,
    ...snapshotBase,
    digestSha256
  };

  const effectiveSnapshot = await persistSnapshotIfChanged(snapshot, digestSha256);
  latestSnapshot = effectiveSnapshot;
  return { actor, snapshot: effectiveSnapshot };
};

export const getIntegrationControlSnapshot = async () => {
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
};
