import { ActiveDataGrant, UsageTelemetryEvent } from '../types';

// No sample grants or usage events: only provider-backed, persisted records should appear as real activity.
export const initialActiveGrants: ActiveDataGrant[] = [];
export const initialUsageTelemetry: UsageTelemetryEvent[] = [];
