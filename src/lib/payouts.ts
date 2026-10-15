import crypto from 'node:crypto';
import { getPostgresPool } from './db/postgres';
import { governRevenueAction } from './revenue-control-plane';
import { initializeRevenueLedger } from './revenue/engine';

export type PayoutRequest = {
  userReference: string;
  amountUsd: number;
  method: string;
  destination: string;
  actor?: string;
};

function safeUser(value: string | undefined) {
  return String(value || 'anonymous').slice(0, 200);
}

export async function initializePayoutRegistry() {
  await getPostgresPool().query(`
    CREATE TABLE IF NOT EXISTS payout_requests (
      id TEXT PRIMARY KEY,
      user_reference TEXT NOT NULL,
      amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
      currency CHAR(3) NOT NULL DEFAULT 'USD',
      method TEXT NOT NULL,
      destination TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending','processing','paid','failed','cancelled')),
      governance_event_id TEXT,
      external_reference TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS payout_requests_user_created_idx
      ON payout_requests(user_reference, created_at DESC);
  `);
}

export async function createPayoutRequest(input: PayoutRequest) {
  const userReference = safeUser(input.userReference);
  const amountMinor = Math.round(Number(input.amountUsd) * 100);
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new Error('Payout amount must be greater than zero.');
  if (!input.method || !input.destination) throw new Error('Payout method and destination are required.');

  await initializePayoutRegistry();

  const db = getPostgresPool();
  const balance = await db.query(`
    SELECT
      COALESCE(SUM(CASE WHEN status='paid' THEN amount_minor ELSE 0 END),0)::bigint AS paid_minor,
      COALESCE(SUM(CASE WHEN status='refunded' THEN amount_minor ELSE 0 END),0)::bigint AS refunded_minor,
      COALESCE(SUM(CASE WHEN status='disputed' THEN amount_minor ELSE 0 END),0)::bigint AS disputed_minor
    FROM revenue_ledger
    WHERE user_reference=$1 AND currency='USD'
  `, [userReference]);

  const reserved = await db.query(`
    SELECT COALESCE(SUM(amount_minor),0)::bigint AS reserved_minor
    FROM payout_requests
    WHERE user_reference=$1 AND currency='USD' AND status IN ('pending','processing','paid')
  `, [userReference]);

  const availableMinor = Math.max(
    0,
    Number(balance.rows[0]?.paid_minor || 0) -
      Number(balance.rows[0]?.refunded_minor || 0) -
      Number(balance.rows[0]?.disputed_minor || 0) -
      Number(reserved.rows[0]?.reserved_minor || 0)
  );

  if (amountMinor > availableMinor) {
    throw new Error(`Insufficient verified USD earnings. Available: $${(availableMinor / 100).toFixed(2)}.`);
  }

  const autonomous = input.actor === 'ai-ceo-autonomous';
  const governance = await governRevenueAction({
    machine: 'other',
    actionType: 'propose',
    objective: `Request disbursement of verified USD earnings through ${input.method}.`,
    capability: 'move.funds',
    evidenceRefs: ['neon:verified-revenue-ledger', 'neon:verified-available-balance'],
    reversible: false,
    amount: amountMinor / 100,
    currency: 'USD',
    actor: input.actor || 'human-owner'
  });

  if (governance.status === 'blocked') throw new Error('Payout request was blocked by governance; no funds were reserved.');

  const id = `payout-${crypto.randomUUID()}`;
  await db.query(
    `INSERT INTO payout_requests
      (id,user_reference,amount_minor,currency,method,destination,status,governance_event_id)
     VALUES ($1,$2,$3,'USD',$4,$5,$6,$7)`,
    [
      id,
      userReference,
      amountMinor,
      input.method,
      input.destination,
      'pending',
      governance.id
    ]
  );

  return {
    payoutRequestId: id,
    status: 'pending',
    amountUsd: amountMinor / 100,
    currency: 'USD',
    method: input.method,
    governanceEventId: governance.id,
    humanApprovalRequired: true,
    executionEnabled: false,
    autonomousRequest: autonomous,
    verifiedRevenue: true,
    economicTruth: 'REQUESTED — NOT SETTLED',
    note: 'Request recorded and funds reserved. No external transfer was executed; human approval and provider settlement evidence are required.'
  };
}



export type PayoutBalance = {
  userReference: string;
  currency: 'USD';
  verifiedPaidMinor: number;
  refundsMinor: number;
  disputesMinor: number;
  pendingPayoutMinor: number;
  processingPayoutMinor: number;
  paidPayoutMinor: number;
  availableMinor: number;
  availableUsd: number;
  economicTruth: 'VERIFIED AVAILABLE' | 'NO VERIFIED FUNDS AVAILABLE';
};

export async function getAvailablePayoutBalance(userReference?: string): Promise<PayoutBalance> {
  const safeReference = safeUser(userReference);
  await initializeRevenueLedger();
  await initializePayoutRegistry();
  const db = getPostgresPool();
  const [revenue, payouts] = await Promise.all([
    db.query(
      `SELECT
        COALESCE(SUM(CASE WHEN status='paid' THEN amount_minor ELSE 0 END),0)::bigint AS verified_paid_minor,
        COALESCE(SUM(CASE WHEN status='refunded' THEN amount_minor ELSE 0 END),0)::bigint AS refunds_minor,
        COALESCE(SUM(CASE WHEN status='disputed' THEN amount_minor ELSE 0 END),0)::bigint AS disputes_minor
       FROM revenue_ledger
       WHERE user_reference=$1 AND currency='USD'`,
      [safeReference]
    ),
    db.query(
      `SELECT
        COALESCE(SUM(CASE WHEN status='pending' THEN amount_minor ELSE 0 END),0)::bigint AS pending_minor,
        COALESCE(SUM(CASE WHEN status='processing' THEN amount_minor ELSE 0 END),0)::bigint AS processing_minor,
        COALESCE(SUM(CASE WHEN status='paid' THEN amount_minor ELSE 0 END),0)::bigint AS paid_payout_minor
       FROM payout_requests
       WHERE user_reference=$1 AND currency='USD'`,
      [safeReference]
    )
  ]);

  const verifiedPaidMinor = Number(revenue.rows[0]?.verified_paid_minor || 0);
  const refundsMinor = Number(revenue.rows[0]?.refunds_minor || 0);
  const disputesMinor = Number(revenue.rows[0]?.disputes_minor || 0);
  const pendingPayoutMinor = Number(payouts.rows[0]?.pending_minor || 0);
  const processingPayoutMinor = Number(payouts.rows[0]?.processing_minor || 0);
  const paidPayoutMinor = Number(payouts.rows[0]?.paid_payout_minor || 0);
  const availableMinor = Math.max(0, verifiedPaidMinor - refundsMinor - disputesMinor - pendingPayoutMinor - processingPayoutMinor - paidPayoutMinor);

  return {
    userReference: safeReference,
    currency: 'USD',
    verifiedPaidMinor,
    refundsMinor,
    disputesMinor,
    pendingPayoutMinor,
    processingPayoutMinor,
    paidPayoutMinor,
    availableMinor,
    availableUsd: availableMinor / 100,
    economicTruth: availableMinor > 0 ? 'VERIFIED AVAILABLE' : 'NO VERIFIED FUNDS AVAILABLE'
  };
}

export async function listPayoutRequests(userReference?: string) {
  await initializePayoutRegistry();
  const result = await getPostgresPool().query(
    'SELECT id,amount_minor,currency,method,destination,status,governance_event_id,external_reference,created_at,updated_at FROM payout_requests WHERE user_reference=$1 ORDER BY created_at DESC LIMIT 100',
    [safeUser(userReference)]
  );
  return result.rows.map((row: any) => ({
    payoutRequestId: row.id,
    amountUsd: Number(row.amount_minor) / 100,
    currency: row.currency,
    method: row.method,
    destination: row.destination,
    status: row.status,
    governanceEventId: row.governance_event_id,
    externalReference: row.external_reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}
