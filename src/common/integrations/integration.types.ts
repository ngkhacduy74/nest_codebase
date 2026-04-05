/**
 * Common types used across all integrations
 */

export interface BaseIntegrationResult {
  success: boolean;
  providerResponse?: Record<string, unknown>;
  error?: string;
}

export interface ProviderConfig {
  provider: string;
}

export type ProviderFactory<T> = () => Promise<T>;
