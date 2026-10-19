import { isPotentialPaidWork } from './24x7-opportunity-discovery';

function assertEqual(actual: boolean, expected: boolean, message: string): void {
  if (actual !== expected) throw new Error(message + ': expected ' + expected + ', got ' + actual);
}

const finding = (overrides: Partial<{
  sourceId: string; title: string; url: string; description: string; category: string; observedAt: string;
}> = {}) => ({
  sourceId: 'github-bounties',
  title: 'Fix OAuth callback bug',
  url: 'https://github.com/example/project/issues/123',
  description: 'Paid bounty: $250 for implementing the fix.',
  category: 'bounties',
  observedAt: new Date(0).toISOString(),
  ...overrides,
});

assertEqual(isPotentialPaidWork(finding()), true, 'Explicit paid developer task should be a review candidate');
assertEqual(isPotentialPaidWork(finding({ description: 'Reward $250 to implement the OAuth fix.' })), true, 'Standalone dollar amount should be recognized');
assertEqual(isPotentialPaidWork(finding({ description: 'Please fix this issue; no reward mentioned.' })), false, 'Unpriced work must not qualify');
assertEqual(isPotentialPaidWork(finding({ title: 'In-game silver reward', description: 'Bounty reward: $250 for a game task.' })), false, 'Game reward findings must be excluded');
assertEqual(isPotentialPaidWork(finding({ title: 'Build bounty platform', description: 'Funded bounty program: $500 to build reward distribution.' })), false, 'Bounty-infrastructure meta-work must be excluded');
assertEqual(isPotentialPaidWork(finding({ url: 'https://huggingface.co/models/example' })), false, 'Non-GitHub source must not qualify under this first-pass policy');
assertEqual(isPotentialPaidWork(finding({ category: 'ai' })), false, 'Noncommercial category must not qualify');
assertEqual(isPotentialPaidWork(finding({ description: 'Task pays 100 USD to implement the fix.' })), true, 'Explicit USD work reward should qualify for review');
assertEqual(isPotentialPaidWork(finding({ description: 'Reward of stickers for implementing the fix.' })), false, 'Non-monetary rewards must not qualify');
console.log('Opportunity discovery qualification tests passed.');
