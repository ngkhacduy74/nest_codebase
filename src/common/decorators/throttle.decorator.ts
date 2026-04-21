import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const THROTTLE_KEY = 'throttle:limit';
export const SKIP_THROTTLE_KEY = 'throttle:skip';

export interface ThrottleOption {
  limit: number;
  ttl: number; // milliseconds
}

export const Throttle = (option: ThrottleOption): CustomDecorator<string> =>
  SetMetadata(THROTTLE_KEY, option);

export const SkipThrottle = (): CustomDecorator<string> => SetMetadata(SKIP_THROTTLE_KEY, true);
