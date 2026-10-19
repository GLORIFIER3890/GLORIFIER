import { 
  DataFootprintSource, 
  BuyerOffer, 
  MonetizationPolicy, 
  CompensationTransaction, 
  DataBrokerExposure, 
  SovereignStats 
} from '../types';

// These are empty starting values, not evidence of live accounts, revenue, privacy enforcement, or activity.
export const initialStats: SovereignStats = {
  totalEarnedUsd: 0,
  pendingSettlementUsd: 0,
  activeDataStreamsCount: 0,
  monthlyPacingUsd: 0,
  totalDataPointsGoverned: 0,
  privacyShieldIndex: 0,
  brokerBidsProcessedToday: 0,
};

// Do not seed fictitious user data sources or estimated account values.
export const initialFootprints: DataFootprintSource[] = [];

export const initialBuyerOffers: BuyerOffer[] = [];

export const initialBrokerExposures: DataBrokerExposure[] = [];

export const initialTransactions: CompensationTransaction[] = [];

export const defaultPolicy: MonetizationPolicy = {
  brokerMode: 'balanced-protective',
  minimumMonthlyFloorUsd: 0,
  allowAiModelPretraining: false,
  allowAdTargeting: false,
  allowAcademicResearch: false,
  allowInsuranceRiskProfiling: false,
  globalEpsilon: 0.35,
  autoNegotiateHighBids: false,
  payoutMethod: 'binance_auto',
  walletAddress: '',
  binanceConfig: {
    enabled: false,
    binancePayIdOrEmail: '',
    defaultAsset: 'USDT',
    network: 'Binance_Pay_Direct',
    autoSweepThresholdUsd: 25.00,
    sweepFrequency: 'instant',
    isAttested: false
  },
  gcashConfig: {
    enabled: false,
    mobileNumber: '',
    accountName: '',
    autoCashOut: false,
    cadence: 'instant',
    minimumThresholdUsd: 10.00,
    phpUsdRate: 58.75,
    isVerifiedInstapay: false
  },
  aiModel: 'gpt-4o'
};

export const initialInternetAccounts: import('../types').InternetAccount[] = [];

export const initialSentinelErrors: import('../types').CodeSentinelError[] = [];

export const initialSentinelState: import('../types').SentinelBotState = {
  isMonitoring24x7: false,
  healthScore: 0,
  autoHealEnabled: false,
  activeErrorsCount: 0,
  resolvedTotalCount: 0,
  lastScanTimestamp: 'NOT VERIFIED — no scan evidence recorded',
  collaboratingModels: [],
  scanFrequencySeconds: 0,
  sentinelLogs: []
};
