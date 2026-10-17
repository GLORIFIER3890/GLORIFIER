import { getPostgresPool } from './db/postgres';
import { newId } from './new-id';
import { aiOrchestrator } from './ai/orchestrator';
import { listInventions } from './invention-registry';

const query = (text: string, values?: unknown[]) => getPostgresPool().query(text, values);

export type IpResearchDisposition =
  | 'candidate'
  | 'needs-prior-art'
  | 'needs-human-counsel'
  | 'ready-for-counsel';

export interface IpResearchRun {
  id: string;
  inventionId: string;
  agentRole: string;
  disposition: IpResearchDisposition;
  humanInventorAnalysis: string;
  technicalProblem: string;
  technicalSolution: string;
  distinguishingFeatures: string[];
  priorArtQuestions: string[];
  patentabilityIssues: string[];
  evidencePlan: string[];
  draftOutline: string[];
  sources: string[];
  aiAssistanceRecord: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

let initialized = false;

export async function initializeIpResearchRegistry() {
  if (initialized) return;
  await query(`
    CREATE TABLE IF NOT EXISTS glorifier_ip_research_runs (
      id TEXT PRIMARY KEY,
      invention_id TEXT NOT NULL,
      agent_role TEXT NOT NULL,
      disposition TEXT NOT NULL,
      human_inventor_analysis TEXT NOT NULL,
      technical_problem TEXT NOT NULL,
      technical_solution TEXT NOT NULL,
      distinguishing_features JSONB NOT NULL DEFAULT '[]'::jsonb,
      prior_art_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
      patentability_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
      evidence_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
      draft_outline JSONB NOT NULL DEFAULT '[]'::jsonb,
      sources JSONB NOT NULL DEFAULT '[]'::jsonb,
      ai_assistance_record TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_glorifier_ip_research_invention ON glorifier_ip_research_runs(invention_id, created_at DESC)`);
  initialized = true;
}

function cleanArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function extractJson(text: string): Record<string, unknown> {
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\\{[\\s\\S]*\\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return {};
}

export async function runIpResearch(input: {
  inventionId: string;
  priorArt?: string[];
  technicalEvidence?: string[];
  humanContribution?: string[];
  actor?: string;
}) {
  const inventions = await listInventions();
  const invention = inventions.find((item: any) => item.id === input.inventionId);
  if (!invention) throw new Error('Invention not found');

  const priorArt = cleanArray(input.priorArt);
  const technicalEvidence = cleanArray(input.technicalEvidence);
  const humanContribution = cleanArray(input.humanContribution?.length ? input.humanContribution : invention.humanContributors);

  const systemInstruction = [
    'You are GLORIFIER AI Attorney/Scientist, an AI-assisted intellectual-property research agent.',
    'You are not a lawyer and must not provide a definitive legal opinion or guarantee patentability.',
    'Prepare an attorney-reviewable technical research dossier.',
    'Use only supplied facts and sources; do not invent patents, citations, inventors, filing status, or evidence.',
    'USPTO rule for this workflow: AI systems are tools; inventorship must be attributed to natural persons based on their contribution.',
    'Separate technical analysis from legal conclusions. Flag uncertainty explicitly.',
    'Do not claim that a patent should be filed; identify questions for qualified human counsel.',
    'Return JSON with keys: disposition, humanInventorAnalysis, technicalProblem, technicalSolution, distinguishingFeatures, priorArtQuestions, patentabilityIssues, evidencePlan, draftOutline, sources.'
  ].join('\\n');

  const prompt = [
    `Invention ID: ${invention.id}`,
    `Title: ${invention.title}`,
    `Summary: ${invention.summary}`,
    `Recorded human contributors: ${JSON.stringify(humanContribution)}`,
    `Recorded code references: ${JSON.stringify(invention.codeRefs)}`,
    `Recorded evidence references: ${JSON.stringify(invention.evidenceRefs)}`,
    `Prior-art references supplied by requester: ${JSON.stringify(priorArt)}`,
    `Technical evidence supplied by requester: ${JSON.stringify(technicalEvidence)}`,
    'Produce a conservative research dossier. Missing evidence must be described as missing, never as negative evidence.'
  ].join('\\n');

  const response = await aiOrchestrator.resilientGenerate({
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ],
    evaluate: true
  });

  const parsed = extractJson(response.text);
  const disposition = ['candidate','needs-prior-art','needs-human-counsel','ready-for-counsel'].includes(String(parsed.disposition))
    ? String(parsed.disposition) as IpResearchDisposition
    : 'needs-human-counsel';

  const runId = newId('ipr');
  const record = {
    id: runId,
    inventionId: invention.id,
    agentRole: 'uspto-ai-attorney-scientist',
    disposition,
    humanInventorAnalysis: String(parsed.humanInventorAnalysis || 'Human inventorship analysis requires documented human contribution and counsel review.'),
    technicalProblem: String(parsed.technicalProblem || invention.summary),
    technicalSolution: String(parsed.technicalSolution || 'Not established from supplied evidence.'),
    distinguishingFeatures: cleanArray(parsed.distinguishingFeatures),
    priorArtQuestions: cleanArray(parsed.priorArtQuestions),
    patentabilityIssues: cleanArray(parsed.patentabilityIssues),
    evidencePlan: cleanArray(parsed.evidencePlan),
    draftOutline: cleanArray(parsed.draftOutline),
    sources: cleanArray(parsed.sources),
    aiAssistanceRecord: `AI-assisted research generated by ${response.provider}:${response.model}; human review required; no USPTO filing or legal commitment executed.`,
    metadata: {
      actor: input.actor || 'human-owner',
      provider: response.provider,
      model: response.model,
      evaluation: response.evaluation || null,
      priorArtInputCount: priorArt.length,
      technicalEvidenceInputCount: technicalEvidence.length,
      humanContributionInputCount: humanContribution.length,
      policy: {
        aiIsNotInventor: true,
        humanInventorshipRequired: true,
        patentabilityNotGuaranteed: true,
        filingExecutionEnabled: false,
        paymentExecutionEnabled: false,
        humanCounselRequired: true
      }
    }
  };

  await query(
    `INSERT INTO glorifier_ip_research_runs
      (id,invention_id,agent_role,disposition,human_inventor_analysis,technical_problem,technical_solution,distinguishing_features,prior_art_questions,patentability_issues,evidence_plan,draft_outline,sources,ai_assistance_record,metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13::jsonb,$14,$15::jsonb)`,
    [
      record.id, record.inventionId, record.agentRole, record.disposition,
      record.humanInventorAnalysis, record.technicalProblem, record.technicalSolution,
      JSON.stringify(record.distinguishingFeatures), JSON.stringify(record.priorArtQuestions),
      JSON.stringify(record.patentabilityIssues), JSON.stringify(record.evidencePlan),
      JSON.stringify(record.draftOutline), JSON.stringify(record.sources),
      record.aiAssistanceRecord, JSON.stringify(record.metadata)
    ]
  );

  return record;
}

export async function listIpResearchRuns(inventionId?: string, limit = 50) {
  const result = inventionId
    ? await query(`SELECT id,invention_id AS "inventionId",agent_role AS "agentRole",disposition,human_inventor_analysis AS "humanInventorAnalysis",technical_problem AS "technicalProblem",technical_solution AS "technicalSolution",distinguishing_features AS "distinguishingFeatures",prior_art_questions AS "priorArtQuestions",patentability_issues AS "patentabilityIssues",evidence_plan AS "evidencePlan",draft_outline AS "draftOutline",sources,ai_assistance_record AS "aiAssistanceRecord",created_at AS "createdAt",metadata FROM glorifier_ip_research_runs WHERE invention_id=$1 ORDER BY created_at DESC LIMIT $2`, [inventionId, Math.max(1, Math.min(100, limit))])
    : await query(`SELECT id,invention_id AS "inventionId",agent_role AS "agentRole",disposition,human_inventor_analysis AS "humanInventorAnalysis",technical_problem AS "technicalProblem",technical_solution AS "technicalSolution",distinguishing_features AS "distinguishingFeatures",prior_art_questions AS "priorArtQuestions",patentability_issues AS "patentabilityIssues",evidence_plan AS "evidencePlan",draft_outline AS "draftOutline",sources,ai_assistance_record AS "aiAssistanceRecord",created_at AS "createdAt",metadata FROM glorifier_ip_research_runs ORDER BY created_at DESC LIMIT $1`, [Math.max(1, Math.min(100, limit))]);
  return result.rows;
}

export function getIpResearchPolicy() {
  return {
    agentRole: 'uspto-ai-attorney-scientist',
    purpose: 'AI-assisted IP research, invention provenance, prior-art questions and attorney-reviewable patent preparation.',
    aiIsNotInventor: true,
    humanInventorshipRequired: true,
    definitiveLegalAdvice: false,
    patentabilityGuarantee: false,
    filingExecutionEnabled: false,
    paymentExecutionEnabled: false,
    humanCounselRequired: true,
    evidenceRequired: true,
    missingEvidenceIsNotNegativeEvidence: true
  };
}
