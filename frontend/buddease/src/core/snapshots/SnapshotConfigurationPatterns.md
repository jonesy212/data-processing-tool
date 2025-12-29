<!-- Snapshot Configuration Patterns Documentation -->
# Overview
This document outlines four patterns for handling snapshot configuration and update parameters in a type-safe TypeScript environment. The patterns demonstrate how to maintain consistency between configuration tuples and complex parameter interfaces.

# Pattern Options
Option 1: Consistent Generic Parameters
Maintain the same generic pattern across both type definitions.

```typescript

interface UpdateSnapshotParams<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  snapshotId: string | number | null;
  data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  timestamp: Date;
  payload: UpdateSnapshotPayload<T>;
  category?: Category;
  payloadData: T | K;
  mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  store: SnapshotStor K, Meta, AttachmentType, ExcludedFields IncludedFields>;
}
```
# Option 2: Utility Type Extraction
Create a utility type that extracts generics from configuration tuples.

typescript
type ExtractUpdateParamsFromConfig<Config extends SnapshotConfigParams> = 
  UpdateSnapshotParams<Config[0], Config[1], Config[2], Config[3]>;

// Usage example
type MyConfig = SnapshotConfigParams<UserEntity, AdminUser, CustomMeta, 'password'>;
type MyUpdateParams = ExtractUpdateParamsFromConfig<MyConfig>;
Option 3: Tuple Parameter Function
Use tuple parameters in functions while maintaining interface return types.

```typescript
function updateSnapshotWithConfig(
  ...[T, K, Meta, Excluded]: SnapshotConfigParams
): UpdateSnapshotParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Convert tuple to interface
  return {
    snapshotId: null,
    data: new Map(),
    // ... other properties based on T, K, Meta, Excluded
  };
}
```
# Option 4: Advanced Mapping Type
Create a complex mapping type for maximum flexibility.

``` typescript
type MapConfigToUpdateParams<Config> = Config extends SnapshotConfigParams<infer T, infer K, infer Meta, infer Excluded>
  ? UpdateSnapshotParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  : never;

// Usage
type MyUpdateParams = MapConfigToUpdateParams<SnapshotConfigParams<UserEntity, AdminUser>>;
Recommended Approach
typescript
// Keep SnapshotConfigParams as is for configuration
type SnapshotConfigParams<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  Extras extends unknown[] = []
> = [T, K, Meta, Excluded, ...Extras];
```
# 2. How this affects your interfaces

For example, your SimulatedDataSourceFromParams:

``` typescript
interface SimulatedDataSourceFromParams<
  Params extends SnapshotConfigParam any, any, any, any[]> = SnapshotConfigParams
> extends SnapshotInstanceProps<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]> {
  data: Data<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;
  fetchData: () => Promise<SnapshotStoreConfig<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>>;
}

```
# Notice we still only use Params[0]–Params[3].

Later, if an interface requires the 5th parameter, you just access Params[4].

No breaking changes for any existing snapshot code.

# 3. How this benefits your app

You’re building a large, modular snapshot system for crypto assets, dashboards, and project management.

Over time, you might need to track extra metadata, permissions, or user-specific configuration in snapshots.

Using a tuple with an extendable rest parameter lets you add that extra type safely.

All your old factories, createSnapshotOptions, and SimulatedDataSource implementations still work—no refactoring required.

``` typescript 
// Keep UpdateSnapshotParams as interface but use consistent generics
interface UpdateSnapshotParams<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  Excluded extends keyof T = DefaultExcludedFields<T>
> {
  // ... interface properties
}

```
# Benefits:

✅ Type safety with proper generics

✅ Clear separation of concerns (configuration vs operation parameters)

✅ Consistent naming patterns across your codebase

✅ Flexibility to use each type where it makes sense

Real-World Use Cases
Option 2: Configuration-Driven Analytics System
Use Case: Financial analytics platform with predefined report configurations.

``` typescript
// Financial Analyst creating different report types
type StockReportConfig = SnapshotConfigParams<StockEntity, TechStock, StockMeta, 'volatility'>;
type BondReportConfig = SnapshotConfigParams<BondEntity, CorporateBond, BondMeta, 'rating'>;

const selectedConfig: StockReportConfig = [
  stockEntityDefinition,
  techStockSubtype, 
  { analysisType: 'technical', timeFrame: '1y' },
  'volatility' as const
];

type ReportUpdateParams = ExtractUpdateParamsFromConfig<typeof selectedConfig>;

async function generateFinancialReport(config: SnapshotConfigParams) {
  const updateParams: ExtractUpdateParamsFromConfig<typeof config> = {
    snapshotId: `report-${Date.now()}`,
    data: await fetchMarketData(config[0]),
    snapshotManager: createAnalyticsManager(config[1]),
    events: getEconomicEvents(config[2]),
    snapshotStore: configureStore(config[3]),
    // ... other properties
  };
  return processFinancialSnapshot(updateParams);
}
Option 3: E-commerce Inventory Management
Use Case: E-commerce platform handling different product types with specific update rules.

typescript
// Inventory manager updating product snapshots
const electronicProductConfig: SnapshotConfigParams = [
  electronicProductSchema,
  smartphoneProductType,
  { supplier: 'Apple', warranty: '2 years' },
  'internalComponents' as const
];

async function updateInventorySnapshot(
  ...[productSchema, productType, meta, excludedField]: SnapshotConfigParams
) {
  const updateParams: UpdateSnapshotParams<typeof productSchema, typeof productType, typeof meta, typeof excludedField> = {
    snapshotId: `inv-${productType.id}-${Date.now()}`,
    data: await fetchInventoryData(productSchema),
    snapshotManager: inventoryManager,
    events: getInventoryEvents(meta),
    // ... other properties
  };
  return inventorySystem.updateSnapshot(updateParams);
}

// Update different product types
await updateInventorySnapshot(...electronicProductConfig);
```

# Benefits Summary
# Option 2 (ExtractUpdateParamsFromConfig):
✅ Configuration Presets: Standardized report configurations

✅ Type Safety: Prevents mixing incompatible parameters

✅ Consistency: Uniform structural patterns

✅ Easy Maintenance: Centralized configuration management

Option 3 (updateSnapshotWithConfig):
✅ Flexible Product Handling: Single function for multiple types

✅ Clean API: Intuitive tuple parameters

✅ Runtime Safety: Type conversion validation

✅ Dynamic Updates: Handles special configurations easily

# Conclusion
The tuple type (SnapshotConfigParams) is ideal for function parameters and configuration, while the interface (UpdateSnapshotParams) is better suited for complex objects with named properties. Choose the pattern that best fits your specific use case while maintaining type safety and consistency across your codebase.