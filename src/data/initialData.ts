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
    description: 'URL browsing history, search intentions, topical clickstream, reading dwell times.',
    leakRiskScore: 68,
    samples: [
      { field: 'Search Query', rawValue: 'best low latency AI inference engine 2026', anonymizedValue: '[Tech / Machine Learning Infrastructure query]', noiseLevel: 'Laplacian ε=0.45' },
      { field: 'Domain Visited', rawValue: 'github.com/vllm-project/vllm', anonymizedValue: 'Top 500 Open-Source Repository', noiseLevel: 'Category Masking' },
      { field: 'Session IP / Geo', rawValue: '203.0.113.0 (Example Metro)', anonymizedValue: 'US West Coastal Metro (Radius > 45km)', noiseLevel: 'Coarse Truncation' },
      { field: 'Dwell Time', rawValue: '4m 32s on technical documentation', anonymizedValue: 'Medium Engagement [3m - 6m bucket]', noiseLevel: 'k=50 Binning' }
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
    description: 'Transaction frequency, category baskets, subscription cadence, price elasticity.',
    leakRiskScore: 74,
    samples: [
      { field: 'Item Purchased', rawValue: 'Sony WH-1000XM5 Noise Cancelling Headphones ($348)', anonymizedValue: 'ZK-Proof: Consumer Tech item > $250 purchased in Q1', noiseLevel: 'Zero-Knowledge Attestation' },
      { field: 'Grocery Intent', rawValue: 'Organic Almond Milk, Fair-trade Dark Roast Coffee', anonymizedValue: 'High-Affinity Organic Food Consumer cluster', noiseLevel: 'Differential ε=0.2' },
      { field: 'Delivery Address', rawValue: '[REDACTED DEMO ADDRESS]', anonymizedValue: 'ZIP3 Code Prefix: 941XX (San Francisco metro)', noiseLevel: 'k-Anonymity (k=100)' },
      { field: 'Payment Medium', rawValue: '[REDACTED DEMO PAYMENT TOKEN]', anonymizedValue: 'Tier-1 Credit Card Network', noiseLevel: 'Tokenized Redaction' }
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
    description: 'Language distributions, framework trends, debugging logs, commit cadence (NO proprietary code).',
    leakRiskScore: 35,
    samples: [
      { field: 'Primary Stack', rawValue: 'TypeScript, Rust, Python, PyTorch', anonymizedValue: 'Senior AI/Systems Engineering profile', noiseLevel: 'Synthetic Profiling' },
      { field: 'Commit Message', rawValue: 'Fix auth race condition in OAuth token refresh loop', anonymizedValue: '[Security / Authentication Refactoring]', noiseLevel: 'Vector Sanitization' },
      { field: 'IDE Usage', rawValue: 'VS Code with Cursor AI copilot extensions', anonymizedValue: 'Modern AI-Assisted Developer', noiseLevel: 'Feature Extraction' },
      { field: 'Build Output', rawValue: 'Container build in 42.1s on Ubuntu 24.04', anonymizedValue: 'Linux CI/CD Performance Metric', noiseLevel: 'Gaussian Perturbation' }
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
    description: 'Resting heart rate, sleep architecture, daily step cadence, cardio fitness trends.',
    leakRiskScore: 89,
    samples: [
      { field: 'Resting Heart Rate', rawValue: '[REDACTED DEMO HEALTH DATA]', anonymizedValue: 'Synthetic Twin: 57.8 ± 1.2 bpm distribution', noiseLevel: 'Generative Synthetic Twin' },
      { field: 'Sleep Metrics', rawValue: '[REDACTED DEMO HEALTH DATA]', anonymizedValue: 'Normal circadian restorative score (88/100)', noiseLevel: 'Differential ε=0.15' },
      { field: 'Activity Calorie', rawValue: '[REDACTED DEMO HEALTH DATA]', anonymizedValue: 'Cardio fitness group: Top 15th percentile', noiseLevel: 'Decile Cohort' },
      { field: 'Medical Conditions', rawValue: '[REDACTED DEMO HEALTH DATA]', anonymizedValue: 'ZK-Proof: Verified Clean Health Status for Research', noiseLevel: 'Cryptographic ZK Proof' }
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
    description: 'Video watch times, forum topics, upvoted engineering discussions, media consumption clusters.',
    leakRiskScore: 55,
    samples: [
      { field: 'Video Watch Trail', rawValue: '3Blue1Brown: Neural Networks from Scratch (28 mins)', anonymizedValue: 'STEM Educational Video (Tier 1 Engagement)', noiseLevel: 'k=200 Cluster' },
      { field: 'Subreddits', rawValue: 'r/LocalLLaMA, r/MachineLearning, r/sysadmin', anonymizedValue: 'Open Source AI & Tech Communities', noiseLevel: 'Broad Cohort' },
      { field: 'Sentiment Reaction', rawValue: 'Positive reaction to open-weights releases', anonymizedValue: 'Tech Optimist Sentiment Index: 0.82', noiseLevel: 'Scalar Normalization' }
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
    description: 'Precise GPS traces, commute patterns, visited merchants, airport check-ins.',
    leakRiskScore: 96,
    samples: [
      { field: 'Daily Commute', rawValue: 'Home -> Tech Campus (18.4 miles via US-101)', anonymizedValue: '[SHIELDED - NO ACCESS GRANTED]', noiseLevel: 'Complete Lockdown' },
      { field: 'Frequent Stops', rawValue: 'Coffee Shop, Rock Climbing Gym, Supermarket', anonymizedValue: '[SHIELDED - NO ACCESS GRANTED]', noiseLevel: 'Complete Lockdown' }
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
    description: 'Cashflow stability, discretionary vs essential ratio, recurring subscription load.',
    leakRiskScore: 92,
    samples: [
      { field: 'Monthly Net Savings', rawValue: '34% of net income allocated to index funds', anonymizedValue: '[SHIELDED - NO ACCESS GRANTED]', noiseLevel: 'Complete Lockdown' },
      { field: 'Recurring SaaS', rawValue: 'AWS ($42), GitHub Copilot ($20), Spotify ($11)', anonymizedValue: '[SHIELDED - NO ACCESS GRANTED]', noiseLevel: 'Complete Lockdown' }
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
    description: 'E-commerce receipts, flight itineraries, newsletter clusters, and consumer interest signals (No raw email bodies or names).',
    leakRiskScore: 82,
    samples: [
      { field: 'Commerce Order Confirmation', rawValue: 'Receipt for $142.50 at Electronics Store', anonymizedValue: 'ZK-Proof: Consumer Tech transaction bucketed in $100-$200 range', noiseLevel: 'Zero-Knowledge Proof' },
      { field: 'Travel Itinerary', rawValue: 'Flight SFO -> SEA departing in 14 days', anonymizedValue: 'Synthetic Twin: West Coast domestic corridor traveler', noiseLevel: 'Laplacian ε=0.25' },
      { field: 'Newsletter Digest', rawValue: 'Subscribed to 6 AI and Systems Engineering digests', anonymizedValue: 'Professional Technical Researcher cohort', noiseLevel: 'k-Anonymity (k=100)' },
      { field: 'Vendor Tracking Pixels', rawValue: '18 marketing trackers identified and blocked', anonymizedValue: 'AdTech Pixel Disarm: 100% neutralized', noiseLevel: 'Privacy Shield Lockdown' }
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
    description: 'Cloud documents, spreadsheets, presentations, and technical architecture schemas. Raw files remain shielded in your cloud enclave.',
    leakRiskScore: 68,
    samples: [
      { field: 'Financial Modeling Sheet', rawValue: 'Quarterly budget sheet with $18k operating expenses', anonymizedValue: 'DP-Laplace Vector: Enterprise SaaS operating cost distribution (±$2.5k noise)', noiseLevel: 'Laplacian ε=0.35' },
      { field: 'Architecture Technical Spec', rawValue: 'System design diagram for distributed microservices', anonymizedValue: 'Synthetic Twin: High-scale cloud infrastructure pattern', noiseLevel: 'ZK-Proof Synthesized' },
      { field: 'Public Shared Link', rawValue: 'Open public view link on product backlog document', anonymizedValue: 'Shadow Link Neutralizer: Access restricted to authorized domain', noiseLevel: 'Enclave Access Control' },
      { field: 'Contract / Legal Template', rawValue: 'Standard commercial consulting engagement agreement', anonymizedValue: '[ENCLAVE SHIELDED - ZERO RAW EXPOSURE]', noiseLevel: 'Strict Lockdown' }
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
