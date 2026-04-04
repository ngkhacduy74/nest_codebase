import { BaseValueObject } from '@/shared/domain/base.value-object';
import { InvalidEmailError } from '@/shared/domain/errors/domain.error';

type EmailProps = {
  value: string;
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export class Email extends BaseValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
    this.validate(props);
  }

  static create(email: string): Email {
    return new Email({ value: email.toLowerCase().trim() });
  }

  protected validate(props: EmailProps): void {
    if (!props.value || !EMAIL_REGEX.test(props.value)) {
      throw new InvalidEmailError(props.value);
    }
    if (props.value.length > 255) {
      throw new InvalidEmailError(props.value);
    }
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
