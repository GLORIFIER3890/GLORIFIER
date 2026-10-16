/**
 * Governance boundary for a future ASAP Protocol transport adapter.
 *
 * This module intentionally does not perform network I/O or claim wire-level
 * ASAP conformance. A concrete, version-pinned client must be added separately.
 */
export type AsapIntegrationStatus = 'NOT_VERIFIED' | 'DISABLED' | 'BLOCKED' | 'READY_FOR_TRANSPORT';

export interface AsapHandoffCandidate {
  taskId: string;
  correlationId: string;
  requesterAgentId: string;
  targetAgentId: string;
  capability: string;
  objective: string;
  payload?: unknown;
  risk?: 'low' | 'medium' | 'high' | 'irreversible';
}

export interface AsapHandoffAuthorization {
  featureEnabled: boolean;
  authenticated: boolean;
  geasAuthorized: boolean;
  humanApproved?: boolean;
}

export interface AsapHandoffIntent {
  protocol: 'ASAP';
  status: 'READY_FOR_TRANSPORT';
  taskId: string;
  correlationId: string;
  fromAgentId: string;
  toAgentId: string;
  capability: string;
  objective: string;
  payload: unknown;
  requiresHumanApproval: boolean;
  conformance: 'NOT_VERIFIED';
}

export interface AsapHandoffDecision {
  allowed: boolean;
  status: AsapIntegrationStatus;
  reason: string;
  intent?: AsapHandoffIntent;
}

const SENSITIVE_CAPABILITIES = new Set([
  'repository-merge',
  'production-deploy',
  'credential-rotation',
  'secret-access',
  'external-financial-action',
  'asset-transfer',
  'trading',
]);

const normalize = (value: string) => value.trim().toLowerCase();

export function isAsapIntegrationEnabled(value = process.env.GLORIFIER_ASAP_ENABLED): boolean {
  return String(value ?? '').trim().toLowerCase() === 'true';
}

export function prepareAsapHandoff(
  candidate: AsapHandoffCandidate,
  authorization: AsapHandoffAuthorization,
): AsapHandoffDecision {
  if (!authorization.featureEnabled) {
    return { allowed: false, status: 'DISABLED', reason: 'ASAP integration is disabled.' };
  }
  if (!isAsapIntegrationEnabled()) {
    return { allowed: false, status: 'DISABLED', reason: 'GLORIFIER_ASAP_ENABLED is not explicitly true.' };
  }

  const required = [
    candidate.taskId,
    candidate.correlationId,
    candidate.requesterAgentId,
    candidate.targetAgentId,
    candidate.capability,
    candidate.objective,
  ];
  if (required.some(value => typeof value !== 'string' || !value.trim())) {
    return { allowed: false, status: 'BLOCKED', reason: 'Required handoff identity and task fields are missing.' };
  }
  if (!authorization.authenticated) {
    return { allowed: false, status: 'BLOCKED', reason: 'Caller identity is not authenticated.' };
  }
  if (!authorization.geasAuthorized) {
    return { allowed: false, status: 'BLOCKED', reason: 'GEAS has not authorized this capability.' };
  }

  const capability = normalize(candidate.capability);
  const requiresHumanApproval =
    candidate.risk === 'high' ||
    candidate.risk === 'irreversible' ||
    SENSITIVE_CAPABILITIES.has(capability);

  if (requiresHumanApproval && authorization.humanApproved !== true) {
    return { allowed: false, status: 'BLOCKED', reason: 'Explicit human approval is required for this capability.' };
  }

  return {
    allowed: true,
    status: 'READY_FOR_TRANSPORT',
    reason: 'Local governance gates passed; remote transport and ASAP conformance remain unverified.',
    intent: {
      protocol: 'ASAP',
      status: 'READY_FOR_TRANSPORT',
      taskId: candidate.taskId.trim(),
      correlationId: candidate.correlationId.trim(),
      fromAgentId: candidate.requesterAgentId.trim(),
      toAgentId: candidate.targetAgentId.trim(),
      capability,
      objective: candidate.objective.trim(),
      payload: candidate.payload ?? null,
      requiresHumanApproval,
      conformance: 'NOT_VERIFIED',
    },
  };
}
