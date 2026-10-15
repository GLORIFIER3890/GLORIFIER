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

export const initialFootprints: DataFootprintSource[] = [
  {
    id: 'fp-browsing',
    name: 'Search & Web Telemetry',
    category: 'browsing',
    platform: 'Chromium & Search Engines',
    iconName: 'Globe',
    dataPointsMonthly: 124000,
    marketMonthlyValueUsd: 74.50,
    userMonthlyCompUsd: 58.20,
    isMonetized: false,
    privacyTier: 'differential-privacy',
    privacyEpsilon: 0.45,
    status: 'configured-not-verified',
    lastSync: 'NOT VERIFIED',
    description: 'Illustrative sample record only. No live account connection, privacy transformation, external license, or revenue is verified.',
    leakRiskScore: 68,
    samples: [
      { field: 'Search Query', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Domain Visited', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Session IP / Geo', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Dwell Time', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' }
    ]
  },
  {
    id: 'fp-ecommerce',
    name: 'Purchase & Commerce Graph',
    category: 'ecommerce',
    platform: 'Amazon & Merchant Checkouts',
    iconName: 'ShoppingBag',
    dataPointsMonthly: 38200,
    marketMonthlyValueUsd: 62.00,
    userMonthlyCompUsd: 49.50,
    isMonetized: false,
    privacyTier: 'zero-knowledge',
    privacyEpsilon: 0.20,
    status: 'configured-not-verified',
    lastSync: 'NOT VERIFIED',
    description: 'Illustrative sample record only. No live account connection, privacy transformation, external license, or revenue is verified.',
    leakRiskScore: 74,
    samples: [
      { field: 'Item Purchased', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Grocery Intent', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Delivery Address', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Payment Medium', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' }
    ]
  },
  {
    id: 'fp-developer',
    name: 'Developer & Code Telemetry',
    category: 'developer',
    platform: 'GitHub, VS Code & Terminal',
    iconName: 'Code',
    dataPointsMonthly: 89000,
    marketMonthlyValueUsd: 85.00,
    userMonthlyCompUsd: 72.00,
    isMonetized: false,
    privacyTier: 'differential-privacy',
    privacyEpsilon: 0.35,
    status: 'configured-not-verified',
    lastSync: 'NOT VERIFIED',
    description: 'Illustrative sample record only. No live account connection, privacy transformation, external license, or revenue is verified.',
    leakRiskScore: 35,
    samples: [
      { field: 'Primary Stack', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Commit Message', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'IDE Usage', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Build Output', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' }
    ]
  },
  {
    id: 'fp-health',
    name: 'Health & Biometric Telemetry',
    category: 'health',
    platform: 'Apple Health & Smart Watch',
    iconName: 'HeartPulse',
    dataPointsMonthly: 64000,
    marketMonthlyValueUsd: 95.00,
    userMonthlyCompUsd: 78.00,
    isMonetized: false,
    privacyTier: 'synthetic-twin',
    privacyEpsilon: 0.15,
    status: 'configured-not-verified',
    lastSync: 'NOT VERIFIED',
    description: 'Illustrative sample record only. No live account connection, privacy transformation, external license, or revenue is verified.',
    leakRiskScore: 89,
    samples: [
      { field: 'Resting Heart Rate', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Sleep Metrics', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Activity Calorie', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Medical Conditions', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' }
    ]
  },
  {
    id: 'fp-social',
    name: 'Attention & Content Affinity',
    category: 'social',
    platform: 'X (Twitter), Reddit & YouTube',
    iconName: 'Share2',
    dataPointsMonthly: 41000,
    marketMonthlyValueUsd: 38.00,
    userMonthlyCompUsd: 28.50,
    isMonetized: false,
    privacyTier: 'k-anonymity',
    privacyEpsilon: 0.60,
    status: 'configured-not-verified',
    lastSync: 'NOT VERIFIED',
    description: 'Illustrative sample record only. No live account connection, privacy transformation, external license, or revenue is verified.',
    leakRiskScore: 55,
    samples: [
      { field: 'Video Watch Trail', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Subreddits', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Sentiment Reaction', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' }
    ]
  },
  {
    id: 'fp-location',
    name: 'Spatial Mobility & Transit',
    category: 'location',
    platform: 'Smartphone GPS & Transit Cards',
    iconName: 'MapPin',
    dataPointsMonthly: 28300,
    marketMonthlyValueUsd: 45.00,
    userMonthlyCompUsd: 0.00,
    isMonetized: false,
    privacyTier: 'zero-knowledge',
    privacyEpsilon: 0.10,
    status: 'configured-not-verified',
    lastSync: 'NOT VERIFIED',
    description: 'Illustrative sample record only. No live account connection, privacy transformation, external license, or revenue is verified.',
    leakRiskScore: 96,
    samples: [
      { field: 'Daily Commute', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Frequent Stops', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' }
    ]
  },
  {
    id: 'fp-financial',
    name: 'Macro Financial Behavioral Signals',
    category: 'financial',
    platform: 'Open Banking / Plaid Feed',
    iconName: 'Landmark',
    dataPointsMonthly: 5000,
    marketMonthlyValueUsd: 55.00,
    userMonthlyCompUsd: 0.00,
    isMonetized: false,
    privacyTier: 'zero-knowledge',
    privacyEpsilon: 0.10,
    status: 'configured-not-verified',
    lastSync: 'NOT VERIFIED',
    description: 'Illustrative sample record only. No live account connection, privacy transformation, external license, or revenue is verified.',
    leakRiskScore: 92,
    samples: [
      { field: 'Monthly Net Savings', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Recurring SaaS', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' }
    ]
  },
  {
    id: 'fp-gmail',
    name: 'Gmail Workspace & Communications',
    category: 'email',
    platform: 'Google Workspace / Gmail API',
    iconName: 'Mail',
    dataPointsMonthly: 18500,
    marketMonthlyValueUsd: 58.00,
    userMonthlyCompUsd: 46.40,
    isMonetized: false,
    privacyTier: 'differential-privacy',
    privacyEpsilon: 0.25,
    status: 'configured-not-verified',
    lastSync: 'NOT VERIFIED',
    description: 'Illustrative sample record only. No live account connection, privacy transformation, external license, or revenue is verified.',
    leakRiskScore: 82,
    samples: [
      { field: 'Commerce Order Confirmation', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Travel Itinerary', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Newsletter Digest', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Vendor Tracking Pixels', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' }
    ]
  },
  {
    id: 'fp-drive',
    name: 'Google Drive Cloud Storage',
    category: 'drive',
    platform: 'Google Workspace / Drive v3 API',
    iconName: 'HardDrive',
    dataPointsMonthly: 14200,
    marketMonthlyValueUsd: 74.00,
    userMonthlyCompUsd: 59.20,
    isMonetized: false,
    privacyTier: 'differential-privacy',
    privacyEpsilon: 0.35,
    status: 'configured-not-verified',
    lastSync: 'NOT VERIFIED',
    description: 'Illustrative sample record only. No live account connection, privacy transformation, external license, or revenue is verified.',
    leakRiskScore: 68,
    samples: [
      { field: 'Financial Modeling Sheet', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Architecture Technical Spec', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Public Shared Link', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' },
      { field: 'Contract / Legal Template', rawValue: '[ILLUSTRATIVE PLACEHOLDER — NO REAL SOURCE DATA]', anonymizedValue: 'NOT VERIFIED — no privacy transformation has been demonstrated', noiseLevel: 'NOT VERIFIED' }
    ]
  }
];

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
