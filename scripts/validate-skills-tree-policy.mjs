import { readFile } from 'node:fs/promises';

const policyPath = new URL('../config/skills-tree-policy.json', import.meta.url);
const policy = JSON.parse(await readFile(policyPath, 'utf8'));
const failures = [];
const requireTrue = (value, label) => {
  if (value !== true) failures.push(label + ' must be true');
};

if (policy.schemaVersion !== '1.0.0') failures.push('unsupported schemaVersion');
if (policy.integration?.mode !== 'discovery-only') failures.push('integration must remain discovery-only');
if (policy.integration?.enabledForRuntimeExecution !== false) failures.push('runtime execution must remain disabled');
if (policy.integration?.registryUrl !== 'https://raw.githubusercontent.com/SamoTech/skills-tree/main/docs/api/skills.json') failures.push('unexpected registry URL');
if (!policy.integration?.sourceRepository?.startsWith('https://github.com/SamoTech/skills-tree')) failures.push('source repository must use the canonical HTTPS repository');
requireTrue(policy.trust?.registryIsUntrustedInput, 'registryIsUntrustedInput');
if (policy.trust?.skillTextMayOverrideGeasPolicy !== false) failures.push('discovered skill text must not override GEAS policy');
if (policy.trust?.installOrExecuteDiscoveredCodeAutomatically !== false) failures.push('automatic installation/execution must remain disabled');
if (policy.trust?.networkFetchDuringProductionRequests !== false) failures.push('production request path must not fetch the public registry');
if (policy.trust?.missingEvidenceState !== 'UNKNOWN') failures.push('missing evidence must remain UNKNOWN');
for (const key of ['canonicalSkillUrl', 'sourceRevisionOrContentHash', 'license', 'dependencies', 'permissions', 'failureModes', 'testEvidence', 'humanReviewer']) {
  if (!policy.trust?.requiredReviewFields?.includes(key)) failures.push('missing review field: ' + key);
}
for (const key of ['requirePinnedSourceRevision', 'requireSecurityReview', 'requireContractTests', 'requireLeastPrivilege', 'requireRollbackPlanForRuntimeChanges', 'humanApprovalForIrreversibleActions']) {
  requireTrue(policy.promotionGates?.[key], 'promotionGates.' + key);
}
const prohibited = ['deploy-production', 'merge-pull-request', 'transfer-assets', 'trade-assets', 'rotate-credentials', 'delete-production-data', 'change-dns', 'weaken-security-controls'];
for (const action of prohibited) {
  if (!policy.prohibitedAutonomousActions?.includes(action)) failures.push('missing prohibited autonomous action: ' + action);
}
if (!Array.isArray(policy.candidateDomains) || policy.candidateDomains.length === 0) failures.push('candidateDomains must be a non-empty array');

if (failures.length) {
  console.error(JSON.stringify({ valid: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  valid: true,
  schemaVersion: policy.schemaVersion,
  mode: policy.integration.mode,
  runtimeExecutionEnabled: policy.integration.enabledForRuntimeExecution,
  candidateDomains: policy.candidateDomains.length,
  prohibitedAutonomousActions: policy.prohibitedAutonomousActions.length
}, null, 2));
