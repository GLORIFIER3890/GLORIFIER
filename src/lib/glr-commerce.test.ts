import { buildGLRAIServiceQuote, divideDecimal } from './glr-commerce';

function expect(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

expect(divideDecimal('0.05', '0.01', 9) === '5', 'decimal division should be exact');
expect(divideDecimal('1', '3', 6) === '0.333333', 'decimal division should round half-up at target precision');
let rejected = false;
try { divideDecimal('1', '0'); } catch { rejected = true; }
expect(rejected, 'division by zero must be rejected');

const now = new Date('2026-10-13T07:00:00.000Z');
const usd = buildGLRAIServiceQuote({ currency: 'USD', now });
expect(usd.priceGLR === '1' && usd.fiatReferenceAmount === '0.05', 'USD service tariff should be explicit');
expect(usd.quoteStatus === 'GLR_RATE_NOT_CONFIGURED', 'missing GLR market rate must be disclosed');
expect(usd.executable === false, 'quotes must never execute a payment');

const lak = buildGLRAIServiceQuote({
  currency: 'LAK',
  fiatRate: {
    currency: 'LAK', ratePerUsd: '22000',
    source: 'test-fixture', observedAt: '2026-10-13T06:59:00.000Z',
    retrievedAt: '2026-10-13T06:59:30.000Z', maxAgeSeconds: 3600,
  },
  now,
});
expect(lak.fiatReferenceAmount === '1100', 'fiat quote should multiply the USD service tariff by the supplied FX rate');
expect(lak.quoteStatus === 'GLR_RATE_NOT_CONFIGURED', 'fiat conversion does not invent a GLR market rate');

const eur = buildGLRAIServiceQuote({
  currency: 'EUR',
  fiatRate: {
    currency: 'EUR', ratePerUsd: '0.92',
    source: 'test-fixture', observedAt: '2026-10-13T06:59:00.000Z',
    retrievedAt: '2026-10-13T06:59:30.000Z', maxAgeSeconds: 3600,
  },
  now,
});
expect(eur.fiatReferenceAmount === '0.05', 'fractional FX rates must convert USD 0.05 before currency precision rounding');
expect(eur.quoteStatus === 'GLR_RATE_NOT_CONFIGURED', 'fractional fiat conversion must not invent a GLR market rate');

const stale = buildGLRAIServiceQuote({
  currency: 'EUR',
  fiatRate: {
    currency: 'EUR', ratePerUsd: '0.92',
    source: 'test-fixture', observedAt: '2026-10-12T00:00:00.000Z',
    retrievedAt: '2026-10-12T00:00:00.000Z', maxAgeSeconds: 3600,
  },
  now,
});
expect(stale.fiatReferenceAmount === null && stale.quoteStatus === 'STALE_FIAT_RATE', 'stale FX evidence must not create a fiat amount');

console.log('GLR commerce quote tests passed.');
