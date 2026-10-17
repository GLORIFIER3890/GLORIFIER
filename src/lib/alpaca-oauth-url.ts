export function getTrustedAlpacaAuthorizationUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.origin !== 'https://app.alpaca.markets' ||
      url.pathname !== '/oauth/authorize' ||
      url.username ||
      url.password
    ) return null;
    return url.href;
  } catch {
    return null;
  }
}
