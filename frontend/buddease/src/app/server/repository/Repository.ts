// Repository.ts
interface Repository<T extends BaseDataEntity> {
  getById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
  list(filter?: Partial<T>): Promise<T[]>;
}
