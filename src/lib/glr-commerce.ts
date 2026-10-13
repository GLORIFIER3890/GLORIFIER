/**
 * GLORIFIER paid AI service primitives.
 *
 * Quotes are informational. Service execution is gated on a persisted intent
 * whose settlement has already been independently verified by the server.
 */
export const GLR_AI_SUMMARY_SERVICE = {
  id: 'ai-summary',
  version: 'v1',
  taskRef: 'glr-service:ai-summary:v1',
  priceGLR: '1',
  maxPromptCharacters: 8000,
  maxOutputTokens: 1200,
} as const;

const DECIMAL_RE = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

function parseDecimal(value: string, label: string) {
  if (typeof value !== 'string' || !DECIMAL_RE.test(value)) {
    throw new Error(`${label} must be a non-negative decimal string`);
  }
  const [whole, fraction = ''] = value.split('.');
  return { units: BigInt(whole + fraction), scale: fraction.length };
}

function pow10(n: number): bigint {
  if (!Number.isInteger(n) || n < 0 || n > 100) throw new Error('Invalid decimal precision');
  return 10n ** BigInt(n);
}

function formatDecimal(units: bigint, scale: number): string {
  const digits = units.toString().padStart(scale + 1, '0');
  if (scale === 0) return digits;
  const whole = digits.slice(0, -scale);
  const fraction = digits.slice(-scale).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
}

/** Exact decimal division, rounded half-up at the requested precision. */
export function divideDecimal(numerator: string, denominator: string, precision = 9): string {
  const n = parseDecimal(numerator, 'Numerator');
  const d = parseDecimal(denominator, 'Denominator');
  if (d.units <= 0n) throw new Error('Denominator must be greater than zero');
  if (!Number.isInteger(precision) || precision < 0 || precision > 30) throw new Error('Invalid precision');
  const scaledNumerator = n.units * pow10(d.scale + precision);
  const scaledDenominator = d.units * pow10(n.scale);
  const rounded = (scaledNumerator + scaledDenominator / 2n) / scaledDenominator;
  return formatDecimal(rounded, precision);
}

export interface FiatRateEvidence {
  currency: string;
  ratePerUsd: string;
  source: string;
  observedAt: string;
  retrievedAt: string;
  maxAgeSeconds: number;
}

export interface GLRPriceEvidence {
  usdPerGlr: string;
  source: string;
  observedAt: string;
  maxAgeSeconds: number;
}

export interface GLRAIServiceQuote {
  service: typeof GLR_AI_SUMMARY_SERVICE.id;
  serviceVersion: typeof GLR_AI_SUMMARY_SERVICE.version;
  priceGLR: string;
  currency: string;
  fiatReferenceAmount: string | null;
  fiatRateSource: string | null;
  fiatRateObservedAt: string | null;
  glrUsdReferencePrice: string | null;
  glrPriceSource: string | null;
  glrPriceObservedAt: string | null;
  quoteStatus: 'INDICATIVE' | 'GLR_RATE_NOT_CONFIGURED' | 'STALE_FIAT_RATE' | 'STALE_GLR_RATE' | 'NO_RELIABLE_FIAT_RATE';
  executable: false;
  warnings: string[];
}

function isFresh(observedAt: string, retrievedAt: string, maxAgeSeconds: number, now: Date): boolean {
  const observed = Date.parse(observedAt);
  const retrieved = Date.parse(retrievedAt);
  if (!Number.isFinite(observed) || !Number.isFinite(retrieved) || !Number.isFinite(maxAgeSeconds) || maxAgeSeconds < 0) return false;
  const current = now.getTime();
  return observed <= current && retrieved <= current
    && (current - observed) / 1000 <= maxAgeSeconds
    && (current - retrieved) / 1000 <= maxAgeSeconds;
}

export function buildGLRAIServiceQuote(input: {
  currency: string;
  fiatRate?: FiatRateEvidence | null;
  glrPrice?: GLRPriceEvidence | null;
  now?: Date;
}): GLRAIServiceQuote {
  const now = input.now ?? new Date();
  const currency = input.currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Currency must be a three-letter ISO currency code');

  let fiatReferenceAmount: string | null = null;
  let fiatRateSource: string | null = null;
  let fiatRateObservedAt: string | null = null;
  let fiatStatus: GLRAIServiceQuote['quoteStatus'] = 'NO_RELIABLE_FIAT_RATE';

  if (currency === 'USD') {
    fiatReferenceAmount = '0.05';
    fiatRateSource = 'GLORIFIER service tariff (USD reference)';
    fiatRateObservedAt = now.toISOString();
    fiatStatus = 'INDICATIVE';
  } else if (input.fiatRate && input.fiatRate.currency.toUpperCase() === currency) {
    const rate = parseDecimal(input.fiatRate.ratePerUsd, 'Fiat rate');
    if (rate.units > 0n && isFresh(input.fiatRate.observedAt, input.fiatRate.retrievedAt, input.fiatRate.maxAgeSeconds, now)) {
      const scale = Math.min(6, Math.max(0, rate.scale));
      // ratePerUsd is foreign-currency units per 1 USD. The service tariff
      // is USD 0.05, so convert as 5 / 100 * rate, then round to the
      // display precision. Do not multiply by 10^scale twice.
      const amountUnits = 5n * rate.units;
      const divisor = pow10(rate.scale + 2);
      const rounded = (amountUnits + divisor / 2n) / divisor;
      fiatReferenceAmount = formatDecimal(rounded, scale);
      fiatRateSource = input.fiatRate.source;
      fiatRateObservedAt = input.fiatRate.observedAt;
      fiatStatus = 'INDICATIVE';
    } else {
      fiatStatus = 'STALE_FIAT_RATE';
      fiatRateSource = input.fiatRate.source || null;
      fiatRateObservedAt = input.fiatRate.observedAt || null;
    }
  }

  const glrPrice = input.glrPrice;
  let quoteStatus: GLRAIServiceQuote['quoteStatus'] = fiatStatus;
  if (glrPrice) {
    const price = parseDecimal(glrPrice.usdPerGlr, 'GLR USD price');
    if (price.units <= 0n) throw new Error('GLR USD price must be greater than zero');
    if (!isFresh(glrPrice.observedAt, now.toISOString(), glrPrice.maxAgeSeconds, now)) {
      quoteStatus = 'STALE_GLR_RATE';
    }
  } else if (fiatStatus === 'INDICATIVE') {
    quoteStatus = 'GLR_RATE_NOT_CONFIGURED';
  }

  return {
    service: GLR_AI_SUMMARY_SERVICE.id,
    serviceVersion: GLR_AI_SUMMARY_SERVICE.version,
    priceGLR: GLR_AI_SUMMARY_SERVICE.priceGLR,
    currency,
    fiatReferenceAmount,
    fiatRateSource,
    fiatRateObservedAt,
    glrUsdReferencePrice: glrPrice?.usdPerGlr ?? null,
    glrPriceSource: glrPrice?.source ?? null,
    glrPriceObservedAt: glrPrice?.observedAt ?? null,
    quoteStatus,
    executable: false,
    warnings: [
      'Indicative service-price reference only; not an exchange offer, peg, redemption promise, or payment instruction.',
      'The 1 GLR service tariff is not a market valuation of GLR.',
      ...(glrPrice ? ['The GLR/USD reference is operator-configured evidence and is not independently validated by this quote endpoint.'] : ['No GLR/USD price source is configured; a fiat value for GLR is not presented.']),
    ],
  };
}
