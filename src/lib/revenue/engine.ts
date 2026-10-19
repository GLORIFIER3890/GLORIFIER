import crypto from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { getPostgresPool } from '../db/postgres';

export type RevenueEvent = {
  eventId: string;
  provider: string;
  providerTransactionId?: string;
  customerReference?: string;
  userReference: string;
  currency: string;
  amountMinor: number;
  status: 'paid' | 'refunded' | 'disputed' | 'voided';
  occurredAt?: string;
  metadata?: Record<string, unknown>;
};

export async function initializeRevenueLedger(): Promise<void> {
  await getPostgresPool().query(`
    CREATE TABLE IF NOT EXISTS revenue_ledger (
      id BIGSERIAL PRIMARY KEY,
      event_id TEXT NOT NULL UNIQUE,
      provider TEXT NOT NULL,
      provider_transaction_id TEXT,
      customer_reference TEXT,
      user_reference TEXT NOT NULL,
      currency CHAR(3) NOT NULL,
      amount_minor BIGINT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('paid','refunded','disputed','voided')),
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS revenue_ledger_occurred_at_idx ON revenue_ledger (occurred_at DESC);
    CREATE INDEX IF NOT EXISTS revenue_ledger_provider_tx_idx ON revenue_ledger (provider, provider_transaction_id);
  `);
}

export async function recordRevenueEvent(event: RevenueEvent, db: Pool | PoolClient = getPostgresPool()): Promise<{ inserted: boolean; id?: number }> {
  if (!event.eventId || !event.provider || !event.userReference || !event.currency || !Number.isSafeInteger(event.amountMinor)) {
    throw new Error('Invalid revenue event');
  }
  if (event.amountMinor < 0) throw new Error('Revenue amount cannot be negative');
  if (!/^[A-Z]{3}$/.test(event.currency)) throw new Error('Currency must be an ISO 4217 uppercase code');

  const result = await db.query(
    `INSERT INTO revenue_ledger
      (event_id, provider, provider_transaction_id, customer_reference, user_reference, currency, amount_minor, status, occurred_at, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,NOW()),$10)
     ON CONFLICT (event_id) DO NOTHING
     RETURNING id`,
    [
      event.eventId,
      event.provider,
      event.providerTransactionId ?? null,
      event.customerReference ?? null,
      event.userReference,
      event.currency,
      event.amountMinor,
      event.status,
      event.occurredAt ?? null,
      JSON.stringify(event.metadata ?? {}),
    ],
  );
  return { inserted: result.rowCount === 1, id: result.rows[0]?.id };
}

export async function getRevenueSummary() {
  const result = await getPostgresPool().query(`
    SELECT currency,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_minor ELSE 0 END), 0)::bigint AS paid_minor,
      COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount_minor ELSE 0 END), 0)::bigint AS refunded_minor,
      COALESCE(SUM(CASE WHEN status = 'disputed' THEN amount_minor ELSE 0 END), 0)::bigint AS disputed_minor,
      COUNT(*)::bigint AS event_count
    FROM revenue_ledger GROUP BY currency ORDER BY currency
  `);
  return result.rows.map((row) => ({
    currency: row.currency,
    paidMinor: Number(row.paid_minor),
    refundedMinor: Number(row.refunded_minor),
    disputedMinor: Number(row.disputed_minor),
    netMinor: Number(row.paid_minor) - Number(row.refunded_minor) - Number(row.disputed_minor),
    eventCount: Number(row.event_count),
  }));
}

export async function listRevenueEvents(limit = 100) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const result = await getPostgresPool().query(
    `SELECT id, event_id, provider, provider_transaction_id, customer_reference, user_reference,
            currency, amount_minor, status, occurred_at, received_at, metadata
       FROM revenue_ledger
      WHERE status = 'paid'
      ORDER BY occurred_at DESC
      LIMIT $1`,
    [safeLimit],
  );
  return result.rows.map((row) => ({
    id: row.id, event_id: row.event_id, provider: row.provider,
    provider_transaction_id: row.provider_transaction_id, customer_reference: row.customer_reference,
    user_reference: row.user_reference, currency: row.currency,
    amount_minor: Number(row.amount_minor), status: row.status,
    created_at: row.occurred_at, received_at: row.received_at, metadata: row.metadata,
  }));
}

export function verifyRevenueWebhook(rawBody: string, signature: string | undefined): boolean {
  const secret = process.env.REVENUE_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const supplied = signature.replace(/^sha256=/, '');
  return supplied.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}
