import assert from 'node:assert/strict';
import test from 'node:test';
import { getTrustedAlpacaAuthorizationUrl } from './alpaca-oauth-url';

test('accepts the official Alpaca HTTPS authorization endpoint', () => {
  assert.equal(
    getTrustedAlpacaAuthorizationUrl('https://app.alpaca.markets/oauth/authorize?client_id=example'),
    'https://app.alpaca.markets/oauth/authorize?client_id=example',
  );
});

test('rejects HTTP authorization URLs', () => {
  assert.equal(getTrustedAlpacaAuthorizationUrl('http://app.alpaca.markets/oauth/authorize'), null);
});

test('rejects lookalike and untrusted hosts', () => {
  assert.equal(getTrustedAlpacaAuthorizationUrl('https://app.alpaca.markets.attacker.example/oauth/authorize'), null);
  assert.equal(getTrustedAlpacaAuthorizationUrl('https://attacker.example/oauth/authorize'), null);
});

test('rejects URLs containing credentials', () => {
  assert.equal(getTrustedAlpacaAuthorizationUrl('https://user:pass@app.alpaca.markets/oauth/authorize'), null);
});

test('rejects non-authorization paths and non-string input', () => {
  assert.equal(getTrustedAlpacaAuthorizationUrl('https://app.alpaca.markets/redirect'), null);
  assert.equal(getTrustedAlpacaAuthorizationUrl({ url: 'https://app.alpaca.markets/oauth/authorize' }), null);
});
