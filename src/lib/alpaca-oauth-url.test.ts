import assert from 'node:assert/strict';
import { getTrustedAlpacaAuthorizationUrl } from './alpaca-oauth-url';

assert.equal(
  getTrustedAlpacaAuthorizationUrl('https://app.alpaca.markets/oauth/authorize?client_id=example'),
  'https://app.alpaca.markets/oauth/authorize?client_id=example',
  'official HTTPS Alpaca authorization URLs should be accepted',
);
assert.equal(
  getTrustedAlpacaAuthorizationUrl('http://app.alpaca.markets/oauth/authorize'),
  null,
  'HTTP authorization URLs must be rejected',
);
assert.equal(
  getTrustedAlpacaAuthorizationUrl('https://app.alpaca.markets.attacker.example/oauth/authorize'),
  null,
  'lookalike hostnames must be rejected',
);
assert.equal(
  getTrustedAlpacaAuthorizationUrl('https://attacker.example/oauth/authorize'),
  null,
  'external redirect hosts must be rejected',
);
assert.equal(
  getTrustedAlpacaAuthorizationUrl('https://user:pass@app.alpaca.markets/oauth/authorize'),
  null,
  'URLs containing credentials must be rejected',
);
assert.equal(
  getTrustedAlpacaAuthorizationUrl('https://app.alpaca.markets/redirect'),
  null,
  'non-authorization paths must be rejected',
);
assert.equal(getTrustedAlpacaAuthorizationUrl({ url: 'https://app.alpaca.markets/oauth/authorize' }), null);
console.log('Alpaca OAuth redirect validation tests passed');
