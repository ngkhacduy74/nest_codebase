import { SetMetadata } from '@nestjs/common';

export const IS_OPTIONAL_KEY = 'isOptional';
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_KEY, true);
