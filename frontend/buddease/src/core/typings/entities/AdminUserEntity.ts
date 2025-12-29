// AdminUserEntity.ts
// Create AdminUser type aliases (add to your UserEntity.ts)
type AdminUserEntity = AdminUser<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>;
type AdminUserK = AdminUserEntity;
type AdminUserMeta = DefaultMeta<AdminUserEntity, AdminUserK>;
type AdminUserAttachment = UserAttachment;
type AdminUserExcludedFields = DefaultExcludedFields<AdminUserEntity>;
type AdminUserIncludedFields = keyof AdminUserEntity;

type AdminUserBaseParams = {
  T: AdminUserEntity;
  K: AdminUserK;
  Meta: AdminUserMeta;
  AttachmentType: AdminUserAttachment;
  ExcludedFields: AdminUserExcludedFields;
  IncludedFields: AdminUserIncludedFields;
};

export { AdminUserEntity, AdminUserK, AdminUserMeta, AdminUserAttachment, AdminUserExcludedFields, AdminUserIncludedFields, AdminUserBaseParams }