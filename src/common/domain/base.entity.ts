export abstract class BaseEntity<TId = string> {
  protected readonly _id: TId;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  protected constructor(id: TId, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? new Date();
  }

  get id(): TId {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  equals(other: BaseEntity<TId>): boolean {
    if (!(other instanceof BaseEntity)) return false;
    return this._id === other._id;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }
}
