export declare const APP_CONFIG_KEY = "app";
export interface AppConfig {
    readonly nodeEnv: NodeEnv;
    readonly port: number;
    readonly name: string;
    readonly apiPrefix: string;
    readonly apiVersion: string;
    readonly debug: boolean;
    readonly shutdownTimeout: number;
    readonly fallbackLanguage: string;
}
export declare enum NodeEnv {
    Development = "development",
    Production = "production",
    Test = "test",
    Staging = "staging",
    Local = "local"
}
export declare const appConfig: (() => AppConfig) & import("@nestjs/config").ConfigFactoryKeyHost<AppConfig>;
