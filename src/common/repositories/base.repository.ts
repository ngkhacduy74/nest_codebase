export interface QueryOptions<T = Record<string, unknown>> {
  include?: T;
  select?: T;
  where?: T;
  orderBy?: T;
}

export abstract class BaseRepository<T, TId = string> {
  abstract findById(id: TId): Promise<T | null>;
  abstract findMany(filter?: Record<string, unknown>): Promise<T[]>;
  abstract create(data: unknown): Promise<T>;
  abstract update(id: TId, data: Record<string, unknown>): Promise<T>;
  abstract delete(id: TId): Promise<void>;
}
