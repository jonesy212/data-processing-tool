import { BaseData } from '@/app/models/data/Data';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import Version from '@/versions/Version';

// ChangeLogEntry Interface
interface ChangeLogEntry<
  T extends BaseData<any, any, StructuredMetadata<any, any>> = BaseData<any, any>,
  K extends T = T
> {
  id: string;
  timestamp: Date;
  author: string;
  changeType: 'created' | 'updated' | 'deleted' | 'versioned';
  changes: Partial<T>;
  previousState?: Partial<T>;
  version?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  metadata?: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Functional: Create Change Log Entry
function createChangeLogEntry<T extends BaseData<any, any>, K extends T = T>(
  author: string,
  changeType: ChangeLogEntry<T, K>['changeType'],
  changes: Partial<T>,
  previousState?: Partial<T>,
  version?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  metadata?: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): ChangeLogEntry<T, K> {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    author,
    changeType,
    changes,
    previousState,
    version,
    metadata,
  };
}

// Class-based ChangeLogManager
class ChangeLogManager<T extends BaseData<any, any, StructuredMetadata<any, any>>, K extends T = T> {
  private logs: ChangeLogEntry<T, K>[] = [];

  constructor(private entityName: string) {}

  addEntry(
    author: string,
    changeType: ChangeLogEntry<T, K>['changeType'],
    changes: Partial<T>,
    previousState?: Partial<T>,
    version?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadata?: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    const entry = createChangeLogEntry(author, changeType, changes, previousState, version, metadata);
    this.logs.push(entry);
  }

  getChangeLog(): ChangeLogEntry<T, K>[] {
    return this.logs;
  }

  getChangesByAuthor(author: string): ChangeLogEntry<T, K>[] {
    return this.logs.filter(log => log.author === author);
  }
}


export { ChangeLogManager }