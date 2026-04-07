import { Injectable, Logger } from '@nestjs/common';

/**
 * Base provider class that all integration providers should extend
 * Provides common functionality for logging and configuration validation
 */
@Injectable()
export abstract class BaseProvider {
  protected readonly logger: Logger;

  constructor(providerName: string) {
    this.logger = new Logger(providerName);
  }

  /**
   * Get provider name for logging/monitoring
   */
  abstract getProviderName(): string;

  /**
   * Validate provider configuration
   */
  abstract validateConfig(): Promise<boolean>;

  /**
   * Log provider operation
   */
  protected logOperation(
    operation: string,
    details?: Record<string, unknown>,
  ): void {
    const message = details
      ? `${this.getProviderName()} ${operation}: ${JSON.stringify(details)}`
      : `${this.getProviderName()} ${operation}`;

    this.logger.log(message);
  }

  /**
   * Log provider error
   */
  protected logError(operation: string, error: unknown): void {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    this.logger.error(
      `${this.getProviderName()} ${operation}: ${errorMessage}`,
      error,
    );
  }

  /**
   * Create standardized error result
   */
  protected createErrorResult(
    error: unknown,
    operation: string,
  ): { success: false; error: string } {
    const errorMessage =
      error instanceof Error ? error.message : `Unknown ${operation} error`;
    this.logError(operation, error);
    return { success: false, error: errorMessage };
  }
}
