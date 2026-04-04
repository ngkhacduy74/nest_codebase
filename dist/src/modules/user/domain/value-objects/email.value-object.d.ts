import { BaseValueObject } from '@/shared/domain/base.value-object';
type EmailProps = {
    value: string;
};
export declare class Email extends BaseValueObject<EmailProps> {
    private constructor();
    static create(email: string): Email;
    protected validate(props: EmailProps): void;
    get value(): string;
    toString(): string;
}
export {};
