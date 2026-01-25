// SecurityService.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';

class SecurityService<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
>{
  validateAccess(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): boolean {
    // Example logic: only allow if user is admin or owns snapshot
    return user.role === 'admin' || snapshot.data.id === user.id;
  }

  validateArchived(
    snapshot: ArchivedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): boolean {
    // Example: same logic but for archived snapshots
    return this.validateAccess(snapshot.snapshot, user);
  }
}