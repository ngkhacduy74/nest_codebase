"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
function useI18nFactory(configService) {
    const env = configService.get('app.nodeEnv', { infer: true });
    const isLocal = env === 'local';
    const isDevelopment = env === 'development';
    return {
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
            infer: true,
        }),
        loaderOptions: {
            path: path_1.default.join(__dirname, './translations/'),
            watch: isLocal,
        },
        typesOutputPath: path_1.default.join(__dirname, '../../src/generated/i18n.generated.ts'),
        logging: isLocal || isDevelopment,
    };
}
exports.default = useI18nFactory;
//# sourceMappingURL=i18n.factory.js.map