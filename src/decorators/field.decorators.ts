import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsDateString,
  IsNumber,
  IsPositive,
  IsArray,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

// String Field Decorator
export function StringField(options?: {
  minLength?: number;
  maxLength?: number;
  description?: string;
  example?: string;
  required?: boolean;
  toLowerCase?: boolean;
}) {
  return function (target: any, propertyKey: string) {
    const isRequired = options?.required !== false;

    // Validation decorators
    if (isRequired) {
      IsNotEmpty()(target, propertyKey);
    }

    if (options?.minLength) {
      MinLength(options.minLength)(target, propertyKey);
    }

    if (options?.maxLength) {
      MaxLength(options.maxLength)(target, propertyKey);
    }

    // Transform decorators
    if (options?.toLowerCase) {
      Transform(({ value }) => value?.toLowerCase?.trim())(target, propertyKey);
    }

    // Swagger decorator
    const apiPropertyOptions = {
      description: options?.description || `${propertyKey} field`,
      example: options?.example,
      minLength: options?.minLength,
      maxLength: options?.maxLength,
      required: isRequired,
    };

    if (isRequired) {
      ApiProperty(apiPropertyOptions)(target, propertyKey);
    } else {
      ApiPropertyOptional(apiPropertyOptions)(target, propertyKey);
    }
  };
}

// Email Field Decorator
export function EmailField(options?: {
  description?: string;
  example?: string;
  required?: boolean;
}) {
  return function (target: any, propertyKey: string) {
    const isRequired = options?.required !== false;

    // Validation decorators
    if (isRequired) {
      IsNotEmpty()(target, propertyKey);
    }

    IsEmail()(target, propertyKey);

    // Transform decorators
    Transform(({ value }) => value?.toLowerCase?.trim())(target, propertyKey);

    // Swagger decorator
    const apiPropertyOptions = {
      description: options?.description || `${propertyKey} field`,
      example: options?.example || 'user@example.com',
      format: 'email',
      required: isRequired,
    };

    if (isRequired) {
      ApiProperty(apiPropertyOptions)(target, propertyKey);
    } else {
      ApiPropertyOptional(apiPropertyOptions)(target, propertyKey);
    }
  };
}

// Password Field Decorator
export function PasswordField(options?: {
  minLength?: number;
  maxLength?: number;
  description?: string;
  example?: string;
  required?: boolean;
}) {
  return function (target: any, propertyKey: string) {
    const isRequired = options?.required !== false;

    // Validation decorators
    if (isRequired) {
      IsNotEmpty()(target, propertyKey);
    }

    const minLength = options?.minLength || 8;
    MinLength(minLength)(target, propertyKey);

    if (options?.maxLength) {
      MaxLength(options.maxLength)(target, propertyKey);
    }

    // Password complexity pattern
    const pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    Matches(pattern)(target, propertyKey);

    // Swagger decorator
    const apiPropertyOptions = {
      description: options?.description || `${propertyKey} field`,
      example: options?.example || 'SecurePass123!',
      minLength,
      maxLength: options?.maxLength,
      format: 'password',
      required: isRequired,
    };

    if (isRequired) {
      ApiProperty(apiPropertyOptions)(target, propertyKey);
    } else {
      ApiPropertyOptional(apiPropertyOptions)(target, propertyKey);
    }
  };
}

// UUID Field Decorator
export function UUIDField(options?: {
  description?: string;
  example?: string;
  required?: boolean;
}) {
  return function (target: any, propertyKey: string) {
    const isRequired = options?.required !== false;

    // Validation decorators
    if (isRequired) {
      IsNotEmpty()(target, propertyKey);
    }

    IsUUID('4')(target, propertyKey);

    // Swagger decorator
    const apiPropertyOptions = {
      description: options?.description || `${propertyKey} field`,
      example: options?.example || '550e8400-e29b-41d4-a716-446655440000',
      format: 'uuid',
      required: isRequired,
    };

    if (isRequired) {
      ApiProperty(apiPropertyOptions)(target, propertyKey);
    } else {
      ApiPropertyOptional(apiPropertyOptions)(target, propertyKey);
    }
  };
}

// Number Field Decorator
export function NumberField(options?: {
  min?: number;
  max?: number;
  description?: string;
  example?: number;
  required?: boolean;
  positive?: boolean;
}) {
  return function (target: any, propertyKey: string) {
    const isRequired = options?.required !== false;

    // Validation decorators
    if (isRequired) {
      IsNotEmpty()(target, propertyKey);
    }

    IsNumber()(target, propertyKey);

    if (options?.min !== undefined) {
      Min(options.min)(target, propertyKey);
    }

    if (options?.max !== undefined) {
      Max(options.max)(target, propertyKey);
    }

    if (options?.positive) {
      IsPositive()(target, propertyKey);
    }

    // Transform decorator
    Transform(({ value }) => (value ? Number(value) : undefined))(
      target,
      propertyKey,
    );

    // Swagger decorator
    const apiPropertyOptions = {
      description: options?.description || `${propertyKey} field`,
      example: options?.example,
      minimum: options?.min,
      maximum: options?.max,
      required: isRequired,
    };

    if (isRequired) {
      ApiProperty(apiPropertyOptions)(target, propertyKey);
    } else {
      ApiPropertyOptional(apiPropertyOptions)(target, propertyKey);
    }
  };
}

// Decimal Field Decorator
export function DecimalField(options?: {
  description?: string;
  example?: number;
  required?: boolean;
  positive?: boolean;
}) {
  return function (target: any, propertyKey: string) {
    const isRequired = options?.required !== false;

    // Validation decorators
    if (isRequired) {
      IsNotEmpty()(target, propertyKey);
    }

    IsNumber()(target, propertyKey);

    if (options?.positive) {
      IsPositive()(target, propertyKey);
    }

    // Transform decorator
    Transform(({ value }) => (value ? Number(value) : undefined))(
      target,
      propertyKey,
    );

    // Swagger decorator
    const apiPropertyOptions = {
      description: options?.description || `${propertyKey} field`,
      example: options?.example,
      required: isRequired,
    };

    if (isRequired) {
      ApiProperty(apiPropertyOptions)(target, propertyKey);
    } else {
      ApiPropertyOptional(apiPropertyOptions)(target, propertyKey);
    }
  };
}

// Boolean Field Decorator
export function BooleanField(options?: {
  description?: string;
  example?: boolean;
  required?: boolean;
}) {
  return function (target: any, propertyKey: string) {
    const isRequired = options?.required !== false;

    // Validation decorators
    IsBoolean()(target, propertyKey);

    // Transform decorator
    Transform(({ value }) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    })(target, propertyKey);

    // Swagger decorator
    const apiPropertyOptions = {
      description: options?.description || `${propertyKey} field`,
      example: options?.example,
      required: isRequired,
    };

    if (isRequired) {
      ApiProperty(apiPropertyOptions)(target, propertyKey);
    } else {
      ApiPropertyOptional(apiPropertyOptions)(target, propertyKey);
    }
  };
}

// Enum Field Decorator
export function EnumField<T extends Record<string, any>>(
  enumType: T,
  options?: {
    description?: string;
    example?: string;
    required?: boolean;
    isArray?: boolean;
  },
) {
  return function (target: any, propertyKey: string) {
    const isRequired = options?.required !== false;

    // Validation decorators
    if (isRequired) {
      IsNotEmpty()(target, propertyKey);
    }

    IsEnum(enumType)(target, propertyKey);

    if (options?.isArray) {
      IsArray()(target, propertyKey);
      IsEnum(enumType, { each: true })(target, propertyKey);
    }

    // Swagger decorator
    const enumValues = Object.values(enumType);
    const apiPropertyOptions = {
      description: options?.description || `${propertyKey} field`,
      example: options?.example || enumValues[0],
      enum: enumValues,
      required: isRequired,
      isArray: options?.isArray,
    };

    if (isRequired) {
      ApiProperty(apiPropertyOptions)(target, propertyKey);
    } else {
      ApiPropertyOptional(apiPropertyOptions)(target, propertyKey);
    }
  };
}

// Date Field Decorator
export function DateField(options?: {
  description?: string;
  example?: string;
  required?: boolean;
}) {
  return function (target: any, propertyKey: string) {
    const isRequired = options?.required !== false;

    // Validation decorators
    if (isRequired) {
      IsNotEmpty()(target, propertyKey);
    }

    IsDateString()(target, propertyKey);

    // Transform decorator
    Transform(({ value }) => {
      if (!value) return undefined;
      return new Date(value);
    })(target, propertyKey);

    // Swagger decorator
    const apiPropertyOptions = {
      description: options?.description || `${propertyKey} field`,
      example: options?.example || '2023-01-01T00:00:00.000Z',
      format: 'date-time',
      required: isRequired,
    };

    if (isRequired) {
      ApiProperty(apiPropertyOptions)(target, propertyKey);
    } else {
      ApiPropertyOptional(apiPropertyOptions)(target, propertyKey);
    }
  };
}
