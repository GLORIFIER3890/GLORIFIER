import { 
  DataFootprintSource, 
  BuyerOffer, 
  MonetizationPolicy, 
  CompensationTransaction, 
  DataBrokerExposure, 
  SovereignStats 
} from '../types';

export const initialStats: SovereignStats = {
  totalEarnedUsd: 1482.40,
  pendingSettlementUsd: 138.75,
  activeDataStreamsCount: 5,
  monthlyPacingUsd: 215.30,
  totalDataPointsGoverned: 384500,
  privacyShieldIndex: 94,
  brokerBidsProcessedToday: 47,
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

export const initialBuyerOffers: BuyerOffer[] = [
  {
    id: 'offer-deepreason',
    buyerName: 'Frontier AI Research Consortium',
    buyerCategory: 'AI Research Lab',
    buyerVerified: true,
    reputationScore: 98,
    dataCategoriesNeeded: ['developer', 'browsing'],
    offeredCompUsd: 68.00,
    pricingCadence: 'monthly',
    requiredPrivacyTier: 'differential-privacy',
    maxEpsilonAllowed: 0.5,
    retentionWindowDays: 60,
    purposeSummary: 'Pre-training next-generation reasoning code models and developer tool interaction patterns.',
    prohibitedPurposes: ['No re-identification', 'No individual ad profiling', 'No reselling to 3rd parties'],
    aiBrokerScore: 95,
    aiVerdict: 'RECOMMEND',
    aiBrokerReasoning: 'Top-tier academic AI lab with audited cryptographic differential privacy guarantees. High compensation rate ($68/mo) with strict 60-day auto-purge clause.',
    status: 'ACCEPTED',
    timestamp: 'Today at 08:24 AM'
  },
  {
    id: 'offer-stanford-med',
    buyerName: 'BioHealth Genomic & Sleep Study',
    buyerCategory: 'Academic Medicine',
    buyerVerified: true,
    reputationScore: 99,
    dataCategoriesNeeded: ['health'],
    offeredCompUsd: 75.00,
    pricingCadence: 'monthly',
    requiredPrivacyTier: 'synthetic-twin',
    maxEpsilonAllowed: 0.2,
    retentionWindowDays: 90,
    purposeSummary: 'Non-profit academic study on circadian rhythm stability and cardiovascular longevity markers.',
    prohibitedPurposes: ['No commercial drug marketing', 'No insurance risk sharing', 'Zero PII ingestion'],
    aiBrokerScore: 97,
    aiVerdict: 'RECOMMEND',
    aiBrokerReasoning: 'Pure non-profit biomedical research. Utilizes your synthetic twin model so zero raw biometrics are ever transferred. Premium ethical compensation.',
    status: 'ACCEPTED',
    timestamp: 'Yesterday at 04:15 PM'
  },
  {
    id: 'offer-retailpulse',
    buyerName: 'OmniConsumer Macro Analytics',
    buyerCategory: 'Consumer Trends',
    buyerVerified: true,
    reputationScore: 91,
    dataCategoriesNeeded: ['ecommerce', 'browsing'],
    offeredCompUsd: 54.00,
    pricingCadence: 'monthly',
    requiredPrivacyTier: 'zero-knowledge',
    maxEpsilonAllowed: 0.3,
    retentionWindowDays: 30,
    purposeSummary: 'Aggregated macro inflation benchmarks and consumer hardware upgrade cycles across North America.',
    prohibitedPurposes: ['No personalized ad bidding', 'No credit decisioning'],
    aiBrokerScore: 89,
    aiVerdict: 'RECOMMEND',
    aiBrokerReasoning: 'Clean macro analytics firm. Verified zero-knowledge attestation protocol. Short 30-day retention window with verifiable hash receipts.',
    status: 'PENDING',
    timestamp: '2 hours ago'
  },
  {
    id: 'offer-adtech-global',
    buyerName: 'HyperTarget RealTime DSP',
    buyerCategory: 'Consumer Trends',
    buyerVerified: false,
    reputationScore: 42,
    dataCategoriesNeeded: ['browsing', 'location', 'social'],
    offeredCompUsd: 110.00,
    pricingCadence: 'monthly',
    requiredPrivacyTier: 'k-anonymity',
    maxEpsilonAllowed: 1.8,
    retentionWindowDays: 365,
    purposeSummary: 'Real-time programmatic ad bidstream enrichment and behavioral cross-device retargeting.',
    prohibitedPurposes: [],
    aiBrokerScore: 18,
    aiVerdict: 'REJECT',
    aiBrokerReasoning: 'HIGH PRIVACY HAZARD: Buyer requests high epsilon (1.8) and 365-day retention without cryptographic erasure verification. Likely attempts cross-device fingerprinting. AI Broker strongly advises rejecting.',
    status: 'REJECTED',
    timestamp: '4 hours ago'
  },
  {
    id: 'offer-mobility-lab',
    buyerName: 'Urban Transit & Smart City Project',
    buyerCategory: 'Autonomous Systems',
    buyerVerified: true,
    reputationScore: 94,
    dataCategoriesNeeded: ['location'],
    offeredCompUsd: 48.00,
    pricingCadence: 'monthly',
    requiredPrivacyTier: 'differential-privacy',
    maxEpsilonAllowed: 0.25,
    retentionWindowDays: 45,
    purposeSummary: 'Public transit congestion forecasting and bicycle/micro-mobility route optimization.',
    prohibitedPurposes: ['No real-time tracking', 'No insurance telematics', 'Locations binned to >500m geohash'],
    aiBrokerScore: 78,
    aiVerdict: 'CAUTION',
    aiBrokerReasoning: 'Legitimate public interest research, but requires opening your currently Shielded Location Stream. Recommend only if you enable Geohash-6 binning and accept with a minimum counter of $55/mo.',
    status: 'PENDING',
    timestamp: '5 hours ago'
  }
];

export const initialBrokerExposures: DataBrokerExposure[] = [
  {
    id: 'exp-acxiom',
    brokerName: 'Acxiom Corporation',
    brokerType: 'People Search Data Mill',
    estimatedRecordsHeld: 480,
    exposureSeverity: 'CRITICAL',
    monetizedWithoutConsent: 84.00,
    status: 'clawback_sent',
    complianceStatute: 'CCPA § 1798.105 & GDPR Art. 17',
    actionTimestamp: 'Clawback dispatched 3 days ago'
  },
  {
    id: 'exp-experian',
    brokerName: 'Experian Marketing Services',
    brokerType: 'Risk Profiler',
    estimatedRecordsHeld: 610,
    exposureSeverity: 'CRITICAL',
    monetizedWithoutConsent: 112.50,
    status: 'detected',
    complianceStatute: 'FCRA & CCPA/CPRA Statutory Opt-Out'
  },
  {
    id: 'exp-oracle',
    brokerName: 'Oracle BlueKai / Data Cloud',
    brokerType: 'AdTech Aggregator',
    estimatedRecordsHeld: 920,
    exposureSeverity: 'HIGH',
    monetizedWithoutConsent: 65.00,
    status: 'purged',
    complianceStatute: 'GDPR Right to Erasure Confirmed',
    actionTimestamp: 'Purge verified via Cryptographic Receipt #88219'
  },
  {
    id: 'exp-criteo',
    brokerName: 'Criteo Retargeting Network',
    brokerType: 'Shadow Tracker',
    estimatedRecordsHeld: 340,
    exposureSeverity: 'MODERATE',
    monetizedWithoutConsent: 42.00,
    status: 'detected',
    complianceStatute: 'Global Privacy Control (GPC) Broadcast'
  },
  {
    id: 'exp-lexisnexis',
    brokerName: 'LexisNexis Risk Solutions',
    brokerType: 'Risk Profiler',
    estimatedRecordsHeld: 215,
    exposureSeverity: 'HIGH',
    monetizedWithoutConsent: 58.00,
    status: 'detected',
    complianceStatute: 'Statutory Do-Not-Sell Enforcement'
  }
];

export const initialTransactions: CompensationTransaction[] = [
  {
    id: 'tx-8041',
    timestamp: 'Today, 06:45 AM',
    buyerName: 'Frontier AI Research Consortium',
    category: 'developer',
    amountUsd: 14.20,
    privacyTier: 'differential-privacy',
    txHash: '0x8f2d...c301',
    status: 'settled'
  },
  {
    id: 'tx-8040',
    timestamp: 'Today, 04:12 AM',
    buyerName: 'BioHealth Genomic & Sleep Study',
    category: 'health',
    amountUsd: 18.75,
    privacyTier: 'synthetic-twin',
    txHash: '0x3a9e...77bf',
    status: 'settled'
  },
  {
    id: 'tx-8039',
    timestamp: 'Yesterday, 11:30 PM',
    buyerName: 'Frontier AI Research Consortium',
    category: 'browsing',
    amountUsd: 12.50,
    privacyTier: 'differential-privacy',
    txHash: '0x49a1...10e2',
    status: 'settled'
  },
  {
    id: 'tx-8038',
    timestamp: 'Yesterday, 02:18 PM',
    buyerName: 'OmniConsumer Macro Analytics',
    category: 'ecommerce',
    amountUsd: 9.80,
    privacyTier: 'zero-knowledge',
    txHash: '0x61bc...94fa',
    status: 'settled'
  },
  {
    id: 'tx-8037',
    timestamp: 'Sep 17, 2026',
    buyerName: 'BioHealth Genomic & Sleep Study',
    category: 'health',
    amountUsd: 25.00,
    privacyTier: 'synthetic-twin',
    txHash: '0x7e02...d431',
    status: 'settled'
  }
];

export const defaultPolicy: MonetizationPolicy = {
  brokerMode: 'balanced-protective',
  minimumMonthlyFloorUsd: 35.00,
  allowAiModelPretraining: true,
  allowAdTargeting: false,
  allowAcademicResearch: true,
  allowInsuranceRiskProfiling: false,
  globalEpsilon: 0.35,
  autoNegotiateHighBids: true,
  payoutMethod: 'binance_auto',
  walletAddress: 'DEMO_WALLET_NOT_CONNECTED',
  binanceConfig: {
    enabled: true,
    binancePayIdOrEmail: 'demo@example.invalid',
    defaultAsset: 'USDT',
    network: 'Binance_Pay_Direct',
    autoSweepThresholdUsd: 25.00,
    sweepFrequency: 'instant',
    isAttested: true
  },
  gcashConfig: {
    enabled: true,
    mobileNumber: '09000000000',
    accountName: 'DEMO ACCOUNT',
    autoCashOut: true,
    cadence: 'instant',
    minimumThresholdUsd: 10.00,
    phpUsdRate: 58.75,
    isVerifiedInstapay: true
  },
  aiModel: 'gpt-4o'
};

export const initialInternetAccounts: import('../types').InternetAccount[] = [
  {
    id: 'acc-google',
    provider: 'Google Workspace & Cloud',
    category: 'google',
    accountIdentifier: 'johnpaularlos28@gmail.com',
    connected: true,
    status: 'authenticated',
    authMethod: 'OAuth2_PKCE',
    lastSync: '2 mins ago',
    dataItemsGoverned: 142300,
    monthlyEstValueUsd: 84.50,
    isApprovalGatekeeper: true,
    approvalWeight: 5,
    governedDataTypes: ['Gmail Metadata', 'Drive Governance', 'YouTube Intent', 'Chrome Browsing Centroids'],
    privacyShieldActive: true,
    autoSyncEnabled: true,
    apiHealth: 'optimal'
  },
  {
    id: 'acc-github',
    provider: 'GitHub Enterprise & Code Graph',
    category: 'developer',
    accountIdentifier: 'johnpaularlos',
    connected: true,
    status: 'authenticated',
    authMethod: 'Crypto_Sign',
    lastSync: '5 mins ago',
    dataItemsGoverned: 68400,
    monthlyEstValueUsd: 62.00,
    isApprovalGatekeeper: true,
    approvalWeight: 4,
    governedDataTypes: ['Commit Signatures', 'PR Review Telemetry', 'Repo Syntax Patterns', 'Copilot Interaction Logs'],
    privacyShieldActive: true,
    autoSyncEnabled: true,
    apiHealth: 'optimal'
  },
  {
    id: 'acc-binance',
    provider: 'Binance Pay & BEP-20',
    category: 'financial',
    accountIdentifier: 'johnpaularlos28@gmail.com (Pay ID: 35527353)',
    connected: true,
    status: 'authenticated',
    authMethod: 'Crypto_Sign',
    lastSync: 'Just now',
    dataItemsGoverned: 15400,
    monthlyEstValueUsd: 48.00,
    isApprovalGatekeeper: true,
    approvalWeight: 5,
    governedDataTypes: ['Direct USDT Settlement', 'Auto-Sweep Proofs', 'Cryptographic Nonces'],
    privacyShieldActive: true,
    autoSyncEnabled: true,
    apiHealth: 'optimal'
  },
  {
    id: 'acc-gcash',
    provider: 'GCash Philippines Mobile Money',
    category: 'financial',
    accountIdentifier: '09289723845 (JOHN PAUL ARLOS)',
    connected: true,
    status: 'authenticated',
    authMethod: 'Mobile_OTP',
    lastSync: '8 mins ago',
    dataItemsGoverned: 8900,
    monthlyEstValueUsd: 32.50,
    isApprovalGatekeeper: true,
    approvalWeight: 4,
    governedDataTypes: ['Direct PHP Cashout', 'InstaPay Attestation', 'Merchant QR Pay Hash'],
    privacyShieldActive: true,
    autoSyncEnabled: true,
    apiHealth: 'optimal'
  },
  {
    id: 'acc-x',
    provider: 'X / Twitter Public Discourse',
    category: 'social',
    accountIdentifier: '@johnpaularlos',
    connected: true,
    status: 'authenticated',
    authMethod: 'OAuth2_PKCE',
    lastSync: '14 mins ago',
    dataItemsGoverned: 45200,
    monthlyEstValueUsd: 28.00,
    isApprovalGatekeeper: false,
    approvalWeight: 2,
    governedDataTypes: ['Topic Engagement', 'Sentiment Vectors', 'Public Bookmarks'],
    privacyShieldActive: true,
    autoSyncEnabled: true,
    apiHealth: 'optimal'
  },
  {
    id: 'acc-meta',
    provider: 'Meta & Instagram Social Graph',
    category: 'social',
    accountIdentifier: 'john.paul.arlos',
    connected: true,
    status: 'authenticated',
    authMethod: 'OAuth2_PKCE',
    lastSync: '22 mins ago',
    dataItemsGoverned: 72100,
    monthlyEstValueUsd: 38.00,
    isApprovalGatekeeper: false,
    approvalWeight: 2,
    governedDataTypes: ['Social Graph Connections', 'Creator Engagements', 'Content Preferences'],
    privacyShieldActive: true,
    autoSyncEnabled: true,
    apiHealth: 'optimal'
  },
  {
    id: 'acc-msft',
    provider: 'Microsoft 365 & LinkedIn',
    category: 'developer',
    accountIdentifier: 'johnpaularlos@live.com',
    connected: true,
    status: 'authenticated',
    authMethod: 'Passkey_FIDO2',
    lastSync: '40 mins ago',
    dataItemsGoverned: 31000,
    monthlyEstValueUsd: 42.00,
    isApprovalGatekeeper: true,
    approvalWeight: 3,
    governedDataTypes: ['Professional Graph', 'Skill Endorsements', 'Outlook Calendar Busy Telemetry'],
    privacyShieldActive: true,
    autoSyncEnabled: true,
    apiHealth: 'optimal'
  },
  {
    id: 'acc-apple',
    provider: 'Apple ID & Secure Enclave',
    category: 'cloud',
    accountIdentifier: 'johnpaularlos@icloud.com',
    connected: true,
    status: 'authenticated',
    authMethod: 'Passkey_FIDO2',
    lastSync: '12 mins ago',
    dataItemsGoverned: 58000,
    monthlyEstValueUsd: 55.00,
    isApprovalGatekeeper: true,
    approvalWeight: 5,
    governedDataTypes: ['Biometric Attestation', 'Health Activity Summaries', 'Screen Time Buckets'],
    privacyShieldActive: true,
    autoSyncEnabled: true,
    apiHealth: 'optimal'
  },
  {
    id: 'acc-amazon',
    provider: 'Amazon Prime & Retail Graph',
    category: 'commerce',
    accountIdentifier: 'johnpaularlos28@gmail.com',
    connected: true,
    status: 'authenticated',
    authMethod: 'Passkey_FIDO2',
    lastSync: '1 hour ago',
    dataItemsGoverned: 22400,
    monthlyEstValueUsd: 35.00,
    isApprovalGatekeeper: false,
    approvalWeight: 2,
    governedDataTypes: ['Order Frequency Category', 'Search Baskets', 'Delivery Geo Coarse Centroids'],
    privacyShieldActive: true,
    autoSyncEnabled: true,
    apiHealth: 'optimal'
  },
  {
    id: 'acc-discord',
    provider: 'Discord Developer Guilds',
    category: 'social',
    accountIdentifier: 'jparlos#8421',
    connected: true,
    status: 'authenticated',
    authMethod: 'OAuth2_PKCE',
    lastSync: '30 mins ago',
    dataItemsGoverned: 19800,
    monthlyEstValueUsd: 18.50,
    isApprovalGatekeeper: true,
    approvalWeight: 3,
    governedDataTypes: ['Developer Guild Roles', 'Voice Dwell Telemetry', 'AI Prompt Feedback Channels'],
    privacyShieldActive: true,
    autoSyncEnabled: true,
    apiHealth: 'optimal'
  }
];

export const initialSentinelErrors: import('../types').CodeSentinelError[] = [
  {
    id: 'err-503-gemini',
    code: 'ERR_503_GEMINI_HIGH_DEMAND',
    message: 'Gemini call [model=gemini-3.8-flash] returned 503 UNAVAILABLE: Model currently experiencing high demand',
    source: 'server.ts:callGeminiSafe',
    severity: 'high',
    status: 'patch_ready',
    timestamp: 'Just now',
    occurrences: 2,
    rootCause: 'Upstream Google DeepMind traffic spike on gemini-3.8-flash preview endpoint during peak hours.',
    gptAnalysis: 'OpenAI GPT-4o analysis: Gemini is returning HTTP 503 with status UNAVAILABLE. The current retry logic sleeps 800ms and retries the exact same model. We should immediately short-circuit to OpenAI GPT-4o or gemini-3.1-flash-lite instead of blocking the user pipeline.',
    geminiAnalysis: 'Google Gemini 3.8 Flash analysis: Concur with GPT-4o. Rate-limit backoff on 503 is insufficient when traffic spikes occur. Dynamic failover to gemini-3.1-flash-lite (high rate-limit headroom) and concurrent GPT-4o synthesis ensures 99.99% uptime.',
    collaborativeFixProposal: 'Implement dynamic Multi-Model Circuit Breaker: On HTTP 503, immediately divert inference payload to GPT-4o or gemini-3.1-flash-lite without re-triggering quota burn.',
    patchDiff: `// Auto-generated collaborative patch by GPT-4o & Gemini 3.8 Flash
- if (isUnavailable && attempt === 0) { await sleep(800); continue; }
+ if (isUnavailable) {
+   console.info('[Sentinel-Bot] Diverting 503 spike to OpenAI GPT-4o & Flash-Lite');
+   return await runModelExecution({ model: 'gpt-4o', ...params });
+ }`,
    canAutoFix: true,
    assignedBot: 'Dual-Consensus-Healer'
  },
  {
    id: 'err-429-quota',
    code: 'ERR_QUOTA_429_RATE_LIMIT',
    message: 'Quota exceeded for generativelanguage.googleapis.com tokens per user',
    source: 'server.ts:runModelExecution',
    severity: 'medium',
    status: 'resolved',
    timestamp: '15 mins ago',
    occurrences: 4,
    rootCause: 'High burst of concurrent Council debate prompts exceeded tier 1 token velocity.',
    gptAnalysis: 'Token velocity exceeded window limit. Enforce client-side request debouncing and stream caching.',
    geminiAnalysis: 'Resolved via fast-bailout bypass and local differential privacy enclave fallback.',
    collaborativeFixProposal: 'Added 400ms request coalescence and instant switchover to local differential privacy synthesis.',
    patchDiff: `// Resolved patch verified by Council
const cacheKey = hashPrompt(userPrompt);
if (promptCache.has(cacheKey)) return promptCache.get(cacheKey);`,
    canAutoFix: true,
    autoFixedAt: '12 mins ago',
    assignedBot: 'GPT-Sentinel'
  },
  {
    id: 'err-diff-privacy',
    code: 'ERR_DP_EPSILON_BUDGET_WARN',
    message: 'Differential Privacy daily epsilon consumption reached 82% of threshold (ε=0.28 / 0.35)',
    source: 'src/lib/differentialPrivacy.ts:verifyLaplacianBudget',
    severity: 'low',
    status: 'active',
    timestamp: '28 mins ago',
    occurrences: 1,
    rootCause: 'High-frequency buyer querying on ecommerce and developer browsing footprints.',
    gptAnalysis: 'Increase buyer price per query by 30% when epsilon budget exceeds 80% to deter over-polling and compensate user for privacy exhaustion.',
    geminiAnalysis: 'Enforce Gaussian perturbation with tighter composition theorem (Renyi DP) to compress privacy loss parameter.',
    collaborativeFixProposal: 'Apply dynamic privacy surge-pricing: charge $0.12/query (up from $0.057) and switch to advanced composition theorem.',
    patchDiff: `// Dynamic privacy budget surge
if (currentEpsilon > targetEpsilon * 0.8) {
  queryFeeUsd *= 1.30;
  noiseMultiplier = computeRenyiLaplaceScale(0.35);
}`,
    canAutoFix: true,
    assignedBot: 'Gemini-Inspector'
  }
];

export const initialSentinelState: import('../types').SentinelBotState = {
  isMonitoring24x7: true,
  healthScore: 97,
  autoHealEnabled: true,
  activeErrorsCount: 2,
  resolvedTotalCount: 38,
  lastScanTimestamp: 'Just now (continuous 24/7 stream)',
  collaboratingModels: ['OpenAI GPT-4o', 'Google Gemini 3.8 Flash', 'Meta LLaMA 3.3', 'Sovereign Enclave Core'],
  scanFrequencySeconds: 5,
  sentinelLogs: [
    {
      id: 'log-1',
      timestamp: 'Just now',
      action: 'SCAN',
      details: '24/7 Health probe completed across all 10 Internet Accounts & API endpoints. Zero fatal crashes.',
      model: 'Dual-Consensus-Healer'
    },
    {
      id: 'log-2',
      timestamp: '1 min ago',
      action: 'GPT_COLLABORATE',
      details: 'OpenAI GPT-4o & Gemini 3.8 Flash formulated collaborative hot-patch for ERR_503_GEMINI_HIGH_DEMAND.',
      errorId: 'err-503-gemini',
      model: 'OpenAI GPT-4o'
    },
    {
      id: 'log-3',
      timestamp: '12 mins ago',
      action: 'AUTO_FIX',
      details: 'Auto-healed ERR_QUOTA_429_RATE_LIMIT with request coalescence and differential privacy cache.',
      errorId: 'err-429-quota',
      model: 'GPT-Sentinel'
    },
    {
      id: 'log-4',
      timestamp: '25 mins ago',
      action: 'DETECT',
      details: 'Monitored telemetry consumption: Epsilon budget tracking at 82% threshold.',
      errorId: 'err-diff-privacy',
      model: 'Gemini-Inspector'
    }
  ]
};

