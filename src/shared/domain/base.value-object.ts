export abstract class BaseValueObject<T extends Record<string, unknown>> {
  protected readonly props: Readonly<T>;

  protected constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  equals(other: BaseValueObject<T>): boolean {
    if (!(other instanceof BaseValueObject)) return false;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  protected abstract validate(props: T): void;
}
