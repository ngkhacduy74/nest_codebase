export declare const LOGGER_CONFIG_KEY = "logger";
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogProvider = 'console' | 'cloudwatch' | 'datadog' | 'stackdriver';
export interface LoggerConfig {
    readonly level: LogLevel;
    readonly provider: LogProvider;
    readonly prettyPrint: boolean;
    readonly redactPaths: string[];
    readonly correlationIdHeader: string;
}
export declare const loggerConfig: (() => LoggerConfig) & import("@nestjs/config").ConfigFactoryKeyHost<LoggerConfig>;
