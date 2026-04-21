import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const IS_OPTIONAL_KEY = 'isOptional';

export const OptionalAuth = (): CustomDecorator<string> => SetMetadata(IS_OPTIONAL_KEY, true);
