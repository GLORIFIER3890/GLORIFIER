import crypto from 'node:crypto';
import { getPostgresPool } from './db/postgres';
import { getAvailablePayoutBalance, createPayoutRequest } from './payouts';

export const GLORIFIER_AUTONOMOUS_GROWTH_VERSION = 'GAG-1.0';

function boolEnv(name: string, fallback: boolean) {
  const raw = process.env[name];
  if (raw == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.trim().toLowerCase());
}
function numEnv(name: string, fallback: number) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
function textEnv(name: string) {
  return String(process.env[name] || '').trim();
}

export function getAutonomousGrowthPolicy() {
  return {
    version: GLORIFIER_AUTONOMOUS_GROWTH_VERSION,
    objective: 'EARN → VERIFY → PAYOUT → REINVEST → GROW → MEASURE → IMPROVE → REPEAT',
    autonomousRoutineWork: true,
    autoPayoutRequest: boolEnv('GLORIFIER_AUTO_PAYOUT_ENABLED', false),
    autoReinvestmentPlanning: boolEnv('GLORIFIER_AUTO_REINVEST_ENABLED', true),
    payoutMinUsd: numEnv('GLORIFIER_AUTO_PAYOUT_MIN_USD', 1),
    reinvestRatePct: Math.min(100, numEnv('GLORIFIER_AUTO_REINVEST_RATE_PCT', 20)),
    externalTransferExecution: false,
    economicTruth: 'Only verified settled revenue can enter the payout/reinvestment calculation.',
    authorityBoundary: 'AI CEO may route routine reversible work and create evidence-backed payout requests; provider-side irreversible fund movement remains provider-controlled.'
  };
}

export async function initializeAutonomousGrowth() {
  await getPostgresPool().query(`
    CREATE TABLE IF NOT EXISTS glorifier_growth_actions (
      id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL,
      status TEXT NOT NULL,
      user_reference TEXT NOT NULL,
      amount_minor BIGINT NOT NULL DEFAULT 0,
      currency CHAR(3) NOT NULL DEFAULT 'USD',
      source_ref TEXT,
      external_reference TEXT,
      evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS glorifier_growth_actions_created_idx
      ON glorifier_growth_actions(created_at DESC);
    CREATE INDEX IF NOT EXISTS glorifier_growth_actions_type_status_idx
      ON glorifier_growth_actions(action_type, status, created_at DESC);
  `);
}

export async function runAutonomousGrowthCycle(userReference = String(process.env.PAYOUT_OWNER_USER_REFERENCE || 'anonymous')) {
  await initializeAutonomousGrowth();
  const safeReference = String(userReference || 'anonymous').trim().slice(0, 200);
  const policy = getAutonomousGrowthPolicy();
  const balance = await getAvailablePayoutBalance(safeReference);
  const db = getPostgresPool();
  const actions: any[] = [];

  if (policy.autoPayoutRequest && balance.availableUsd >= policy.payoutMinUsd) {
    const method = textEnv('GLORIFIER_AUTO_PAYOUT_METHOD').toLowerCase();
    const destination = textEnv('GLORIFIER_AUTO_PAYOUT_DESTINATION');
    if (method && destination) {
      try {
        const payout = await createPayoutRequest({
          userReference: safeReference,
          amountUsd: balance.availableUsd,
          method,
          destination,
          actor: 'ai-ceo-autonomous'
        });
        actions.push({ type: 'payout_request', status: 'created', payout });
      } catch (error: any) {
        actions.push({ type: 'payout_request', status: 'blocked', reason: error?.message || 'automatic payout request failed' });
      }
    } else {
      actions.push({ type: 'payout_request', status: 'awaiting-provider-config', reason: 'GLORIFIER_AUTO_PAYOUT_METHOD and GLORIFIER_AUTO_PAYOUT_DESTINATION are not configured.' });
    }
  }

  if (policy.autoReinvestmentPlanning && balance.availableUsd > 0) {
    const amountUsd = Math.round(balance.availableUsd * (policy.reinvestRatePct / 100) * 100) / 100;
    if (amountUsd > 0) {
      const recent = await db.query(
        `SELECT id FROM glorifier_growth_actions
         WHERE action_type='reinvestment_plan' AND user_reference=$1
           AND created_at > NOW() - INTERVAL '1 hour'
         LIMIT 1`,
        [safeReference]
      );
      if (!recent.rowCount) {
        const id = `growth-${crypto.randomUUID()}`;
        await db.query(
          `INSERT INTO glorifier_growth_actions
            (id,action_type,status,user_reference,amount_minor,currency,source_ref,evidence)
           VALUES ($1,'reinvestment_plan','planned',$2,$3,'USD',$4,$5::jsonb)`,
          [
            id,
            safeReference,
            Math.round(amountUsd * 100),
            'neon:verified-available-balance',
            JSON.stringify({
              policyVersion: policy.version,
              ratePct: policy.reinvestRatePct,
              verifiedAvailableUsd: balance.availableUsd,
              externalExecution: false
            })
          ]
        );
        actions.push({ type: 'reinvestment_plan', status: 'planned', amountUsd, id });
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    policy,
    balance,
    actions
  };
}

export async function getAutonomousGrowthStatus(userReference = String(process.env.PAYOUT_OWNER_USER_REFERENCE || 'anonymous')) {
  await initializeAutonomousGrowth();
  const result = await getPostgresPool().query(
    `SELECT id,action_type,status,user_reference,amount_minor,currency,source_ref,external_reference,created_at,updated_at
     FROM glorifier_growth_actions WHERE user_reference=$1 ORDER BY created_at DESC LIMIT 100`,
    [String(userReference || 'anonymous').trim().slice(0, 200)]
  );
  return result.rows.map((x: any) => ({
    id: x.id,
    actionType: x.action_type,
    status: x.status,
    userReference: x.user_reference,
    amountUsd: Number(x.amount_minor) / 100,
    currency: x.currency,
    sourceRef: x.source_ref,
    externalReference: x.external_reference,
    createdAt: x.created_at,
    updatedAt: x.updated_at
  }));
}
