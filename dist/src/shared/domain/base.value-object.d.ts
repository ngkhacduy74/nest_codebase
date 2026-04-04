export declare abstract class BaseValueObject<T extends Record<string, unknown>> {
    protected readonly props: Readonly<T>;
    protected constructor(props: T);
    equals(other: BaseValueObject<T>): boolean;
    protected abstract validate(props: T): void;
}
