export type ScientistDomain = 
  | 'security_vulnerabilities'
  | 'performance_systems'
  | 'statutory_compliance'
  | 'api_interoperability'
  | 'monetization_arbitrage';

export interface ScientistAgent {
  id: string;
  name: string;
  codename: string;
  domain: ScientistDomain;
  title: string;
  bio: string;
  avatarGradient: string;
  activeModel: string;
  status: 'active_24_7' | 'investigating' | 'synthesizing_patch' | 'verifying' | 'standby';
  uptimeHours: number;
  targetEcosystems: string[];
  capabilities: string[];
  currentTask: {
    id: string;
    targetUrlOrRepo: string;
    issueType: string;
    status: 'analyzing' | 'remediating' | 'verifying' | 'monetizing';
    startedAt: string;
    progress: number;
  } | null;
  totalIssuesResolved: number;
  totalBountiesEarnedUsd: number;
  lastResolutionProof: string | null;
}

export interface InternetIssue {
  id: string;
  title: string;
  target: string;
  domain: ScientistDomain;
  assignedScientistId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'detected' | 'investigating' | 'patch_generated' | 'verified_resolved' | 'bounty_claimed';
  detectedAt: string;
  resolvedAt?: string;
  summary: string;
  diagnosticDetails: {
    cveOrCode?: string;
    affectedFilesOrEndpoints: string[];
    vulnerabilityType?: string;
    rootCause: string;
  };
  resolutionArtifact: {
    patchDiff: string;
    fixExplanation: string;
    verificationProofHash: string;
    modelUsed: string;
    auditTimestamp: string;
  } | null;
  monetization: {
    bountyRewardUsd: number;
    sourcePlatform: string;
    claimed: boolean;
    claimedAt?: string;
    txProof: string;
    requiresHumanApproval: boolean;
    approvedByHuman?: boolean;
  };
}

export interface ScientistMonetizationState {
  is247AutonomousRunning: boolean;
  lastHeartbeat: string;
  cycleCount: number;
  totalEarnedUsd: number;
  claimableYieldUsd: number;
  bountiesResolvedCount: number;
  averageBountyUsd: number;
  runRateDailyUsd: number;
  monetizationLedger: {
    id: string;
    timestamp: string;
    scientistCodename: string;
    issueTitle: string;
    targetPlatform: string;
    rewardUsd: number;
    txHash: string;
    status: 'settled' | 'pending_human_approval';
  }[];
}

// No fabricated agent activity, external findings, bounty claims, or payment evidence are seeded.
const initialFleet: ScientistAgent[] = [];
const seedIssues: InternetIssue[] = [];

// Persistent In-Memory State
let fleet: ScientistAgent[] = [...initialFleet];
let issues: InternetIssue[] = [...seedIssues];
let monetizationState: ScientistMonetizationState = {
  is247AutonomousRunning: false,
  lastHeartbeat: 'NOT VERIFIED — no daemon heartbeat evidence',
  cycleCount: 0,
  totalEarnedUsd: 0,
  claimableYieldUsd: 0,
  bountiesResolvedCount: 0,
  averageBountyUsd: 0,
  runRateDailyUsd: 0,
  monetizationLedger: []
};

// 24/7 Background autonomous tick
let autonomousInterval: NodeJS.Timeout | null = null;

export function getScientistFleet(): ScientistAgent[] {
  return fleet;
}

export function getInternetIssues(): InternetIssue[] {
  return issues;
}

export function getScientistMonetizationState(): ScientistMonetizationState {
  return monetizationState;
}

export function toggle247AutonomousRunning(_enabled?: boolean): boolean {
  // This simulator is intentionally disabled until real execution and evidence are implemented.
  monetizationState.is247AutonomousRunning = false;
  return false;
}

export function claimAccruedScientistYield(): { claimedUsd: number; newClaimable: number; txHash: string; status: 'unavailable'; reason: string } {
  return {
    claimedUsd: 0,
    newClaimable: 0,
    txHash: '',
    status: 'unavailable',
    reason: 'Payout execution and externally verifiable settlement evidence are not implemented.'
  };
}

// Autonomous Resolution Engine: Can be called on demand or during 24/7 loop
export async function resolveInternetIssue(issueId: string): Promise<InternetIssue> {
  const issue = issues.find((item) => item.id === issueId);
  if (!issue) throw new Error(`Issue ${issueId} not found in the live issue registry.`);
  // This path is intentionally non-mutating until an independent verifier can attest a result.
  throw new Error('Resolution is unavailable: no independent verification pipeline is configured. No issue status or bounty was changed.');
}

// Approve a high-value or consequential resolution
export function approveAndClaimIssueBounty(_issueId: string, _approver = 'human-owner'): InternetIssue {
  throw new Error('Bounty claiming is unavailable until a payment provider confirms settlement. No payout or ledger entry was created.');
}

// Target submissions are disabled until a real worker and verification pipeline are configured.
export function submitTargetToScientistFleet(_input: {
  target: string;
  domain: ScientistDomain;
  title: string;
  summary: string;
  bountyRewardUsd?: number;
}): InternetIssue {
  throw new Error('Scientist Fleet is not configured for live execution. No target was submitted and no bounty was created.');
}

// Deliberately disabled: a timer is not evidence of real autonomous work.
export function start247ScientistDaemon(
  _modelRunner?: (provider: 'gemini' | 'openai', prompt: string, opts?: any) => Promise<{ text: string; model: string } | null>
): void {
  monetizationState.is247AutonomousRunning = false;
}

export function stop247ScientistDaemon(): void {
  if (autonomousInterval) clearInterval(autonomousInterval);
  autonomousInterval = null;
}
