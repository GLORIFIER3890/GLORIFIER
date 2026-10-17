import { getPostgresPool } from './db/postgres';
import { newId } from './new-id';

const query = (text: string, values?: unknown[]) => getPostgresPool().query(text, values);

export type InventionStatus = 'candidate' | 'disclosure-draft' | 'counsel-review' | 'filed' | 'abandoned';
export type ConfidentialityStatus = 'internal' | 'confidential' | 'public';

export interface InventionRecord {
  id: string;
  title: string;
  summary: string;
  status: InventionStatus;
  confidentiality: ConfidentialityStatus;
  humanContributors: string[];
  codeRefs: string[];
  evidenceRefs: string[];
  priorArtStatus: 'not-reviewed' | 'reviewing' | 'reviewed';
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

let initialized = false;

export async function initializeInventionRegistry() {
  if (initialized) return;
  await query(`
    CREATE TABLE IF NOT EXISTS glorifier_invention_registry (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'candidate',
      confidentiality TEXT NOT NULL DEFAULT 'internal',
      human_contributors JSONB NOT NULL DEFAULT '[]'::jsonb,
      code_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
      evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
      prior_art_status TEXT NOT NULL DEFAULT 'not-reviewed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_glorifier_invention_status ON glorifier_invention_registry(status)`);
  initialized = true;
}

export async function registerInvention(input: Omit<InventionRecord, 'id'|'createdAt'|'updatedAt'>) {
  const id = newId('inv');
  const result = await query(
    `INSERT INTO glorifier_invention_registry
      (id,title,summary,status,confidentiality,human_contributors,code_refs,evidence_refs,prior_art_status,metadata)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb,$9,$10::jsonb)
     RETURNING id,title,summary,status,confidentiality,human_contributors AS "humanContributors",code_refs AS "codeRefs",evidence_refs AS "evidenceRefs",prior_art_status AS "priorArtStatus",created_at AS "createdAt",updated_at AS "updatedAt",metadata`,
    [id,input.title,input.summary,input.status,input.confidentiality,JSON.stringify(input.humanContributors),JSON.stringify(input.codeRefs),JSON.stringify(input.evidenceRefs),input.priorArtStatus,JSON.stringify(input.metadata || {})]
  );
  return result.rows[0];
}

export async function listInventions() {
  const result = await query(`SELECT id,title,summary,status,confidentiality,human_contributors AS "humanContributors",code_refs AS "codeRefs",evidence_refs AS "evidenceRefs",prior_art_status AS "priorArtStatus",created_at AS "createdAt",updated_at AS "updatedAt",metadata FROM glorifier_invention_registry ORDER BY updated_at DESC`);
  return result.rows;
}
