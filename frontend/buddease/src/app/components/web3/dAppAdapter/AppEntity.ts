// AppEntity.ts
type AppEntity = BaseDataEntity;
type AppK = AppEntity;
type AppMeta = DefaultMeta<AppEntity, AppK>;
type AppExcludedFields = DefaultExcludedFields<AppEntity>;
type AppIncludedFields = keyof AppEntity; // defaults to everything

// Utility to pick or omit fields dynamically
type ApplyFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends keyof T = keyof T
> = Pick<Omit<T, Excluded>, Included>;

type PublicUser = ApplyFieldFilters<UserEntity, "password" | "secret", "id" | "name" | "email">;
