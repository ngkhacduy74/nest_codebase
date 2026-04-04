export declare abstract class BaseEntity<TId = string> {
    protected readonly _id: TId;
    protected readonly _createdAt: Date;
    protected _updatedAt: Date;
    protected constructor(id: TId, createdAt?: Date, updatedAt?: Date);
    get id(): TId;
    get createdAt(): Date;
    get updatedAt(): Date;
    equals(other: BaseEntity<TId>): boolean;
    protected touch(): void;
}
