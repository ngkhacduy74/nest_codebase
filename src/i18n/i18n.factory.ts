import { GlobalConfig } from '@/config/config.type';
import { ConfigService } from '@nestjs/config';
import { I18nOptionsWithoutResolvers } from 'nestjs-i18n';
import path from 'path';

function useI18nFactory(
  configService: ConfigService<GlobalConfig>,
): I18nOptionsWithoutResolvers {
  const env = configService.get('app.nodeEnv', { infer: true });
  const isLocal = env === 'local';
  const isDevelopment = env === 'development';
  return {
    fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
      infer: true,
    }),
    loaderOptions: {
      path: path.join(__dirname, './translations/'),
      watch: isLocal,
    },
    typesOutputPath: path.join(
      __dirname,
      '../../src/generated/i18n.generated.ts',
    ),
    logging: isLocal || isDevelopment,
  };
}

export default useI18nFactory;
