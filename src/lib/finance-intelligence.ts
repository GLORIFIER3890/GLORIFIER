export const GLORIFIER_FINANCE_SCIENTIST_VERSION = 'GFS-1.0';

export type FinancePosition = {
  id?: string;
  symbol: string;
  assetClass: 'equity' | 'bond' | 'etf' | 'fund' | 'crypto' | 'cash' | 'private' | 'real-estate' | 'other';
  marketValue: number;
  currency: string;
  expectedReturn?: number;
  volatility?: number;
  liquidityScore?: number;
  sector?: string;
  country?: string;
  evidenceStatus?: 'not_verified' | 'evidence_backed' | 'verified';
};

export type CapitalScenario = {
  name: string;
  capital: number;
  expectedReturn?: number;
  riskScore?: number;
  liquidityScore?: number;
  strategicScore?: number;
};

export function buildFinanceScientistReport(input: {
  positions?: FinancePosition[];
  scenarios?: CapitalScenario[];
  verifiedRevenue?: number;
  currency?: string;
}) {
  const positions = input.positions || [];
  const total = positions.reduce((sum, p) => sum + Math.max(0, p.marketValue || 0), 0);
  const byClass: Record<string, number> = {};
  const bySector: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  for (const p of positions) {
    byClass[p.assetClass] = (byClass[p.assetClass] || 0) + p.marketValue;
    if (p.sector) bySector[p.sector] = (bySector[p.sector] || 0) + p.marketValue;
    if (p.country) byCountry[p.country] = (byCountry[p.country] || 0) + p.marketValue;
  }

  const concentration = positions
    .map((p) => ({ symbol: p.symbol, weight: total ? p.marketValue / total : 0 }))
    .sort((a, b) => b.weight - a.weight);

  const weightedExpectedReturn = total
    ? positions.reduce((sum, p) => sum + (p.marketValue / total) * (p.expectedReturn || 0), 0)
    : null;

  const weightedVolatility = total
    ? positions.reduce((sum, p) => sum + (p.marketValue / total) * (p.volatility || 0), 0)
    : null;

  const liquidity = total
    ? positions.reduce((sum, p) => sum + (p.marketValue / total) * (p.liquidityScore ?? 0), 0)
    : null;

  const scenarios = (input.scenarios || []).map((s) => ({
    ...s,
    expectedValue: s.expectedReturn === undefined ? null : s.capital * (1 + s.expectedReturn),
    status: 'NOT VERIFIED' as const,
  }));

  return {
    version: GLORIFIER_FINANCE_SCIENTIST_VERSION,
    portfolio: {
      positionCount: positions.length,
      marketValue: total,
      currency: input.currency || 'USD',
      marketValueIsNotRevenue: true,
      byAssetClass: byClass,
      bySector,
      byCountry,
      concentration: concentration.slice(0, 20),
      weightedExpectedReturn,
      weightedVolatility,
      weightedLiquidityScore: liquidity,
    },
    capitalAllocation: {
      scenarios,
      selectionRequiresHumanJudgment: true,
      autonomousExecution: false,
    },
    verifiedRevenue: {
      value: input.verifiedRevenue || 0,
      currency: input.currency || 'USD',
      status: 'VERIFIED INPUT',
    },
    risk: {
      scenarioTestingAvailable: true,
      stressTestingAvailable: true,
      factorAnalysisAvailable: true,
      liquidityAnalysisAvailable: true,
      tailRiskReviewAvailable: true,
      dataQualityRequired: true,
    },
    governance: {
      evidenceRequiredForMaterialClaims: true,
      estimatesAreNotVerified: true,
      missingEvidenceIsNotZero: true,
      autonomousTrading: false,
      autonomousFundMovement: false,
      autonomousContracting: false,
      humanApprovalForConsequentialActions: true,
    },
  };
}

