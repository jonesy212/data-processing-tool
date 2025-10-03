<!-- ExampleCalendarEvents.md -->
# Metadata Hook Usage Documentation
useMetadata Hook Implementation
Scenario 1: Basic App-Level Type Usage
Description: Initialize the metadata hook with application-wide type parameters for consistent type safety

Steps:

Import all necessary type definitions

Specify all six type parameters matching your App types

Call the hook with the target area identifier

Implementation:

typescript
const metadata = useMetadata<
  AppEntity, 
  AppK, 
  AppMeta, 
  AppAttachment, 
  AppExcludedFields, 
  AppIncludedFields
>('notification-area');
Assertions:

TypeScript should compile without type errors

Returned metadata should have full App-level type safety

All six type parameters should satisfy their constraints

### Scenario 2: Calendar-Specific Type Configuration
Description: Configure specialized type safety for calendar events with domain-specific parameters

Steps:

Define calendar-specific type parameters

Use calendar entity types instead of generic App types

Specify calendar area identifier

Implementation:

```typescript
const calendarMetadata = useMetadata<
  CalendarEventBase,
  CalendarEventBase,
  CalendarEventMeta,
  CalendarAttachment,
  CalendarExcludedFields,
  CalendarIncludedFields
>('calendar-area');
```
# Assertions:

Calendar-specific validation rules should be enforced

Specialized attachment types should be type-safe

Date range validation should work correctly

Scenario 3: Mixed Type Configuration
Description: Combine generic App types with calendar-specific overrides

Steps:

Use App entity types as base

Override specific parameters with calendar types

Maintain App-level consistency where needed

Implementation:


```typescript
const mixedMetadata = useMetadata<
  AppEntity,
  AppK,
  CalendarEventMeta,
  AppAttachment,
  AppExcludedFields,
  'title' | 'startDate' | 'endDate' | 'location'
>('calendar-area');
```
# Assertions:

App-level security rules should apply

Calendar-specific metadata should be handled correctly

Only specified calendar fields should be included

### Scenario 4: Minimal Type Configuration
Description: Use the hook with minimal type parameters relying on defaults

**Steps:**

Specify only required entity types

Allow default parameters for other type arguments

Use for simple implementations

Implementation:

```typescript
const minimalMetadata = useMetadata<AppEntity, AppK>('general-area');
```

**Assertions:**

Default type parameters should be inferred correctly

Basic type safety should still be maintained

Hook should function with minimal configuration

Type Safety Verification
### Scenario 5: Compile-Time Type Validation
Description: Verify that type parameters satisfy generic constraints at compile time

## Steps:

Attempt to use invalid type parameters

Check for TypeScript compilation errors

Verify constraint violations are caught

Assertions:

Invalid type parameters should cause compilation failures

Type constraints should be properly enforced

Error messages should be clear and actionable

### Scenario 6: Runtime Type Consistency
Description: Ensure returned metadata matches the specified type structure at runtime

Steps:

Use the hook with specific type parameters

Validate returned object structure

Check for type mismatches

Assertions:

Returned metadata should match the expected type

Runtime validation should pass

Type guards should work correctly

Best Practices Implementation
Scenario 7: When to Use App-Level Types
Description: Apply App-level types for consistent application-wide behavior

Use Cases:

✅ Consistent behavior across the application is required

✅ Quick prototyping is needed

✅ Calendar events are secondary features

✅ Same security rules apply to all entities

Assertions:

Type configuration should be reusable across components

Security rules should be consistently applied

Development velocity should improve

### Scenario 8: When to Use Calendar-Specific Types
Description: Implement calendar-specific types for specialized functionality

Use Cases:

✅ Calendar functionality is core to your application

✅ Specialized validation rules are needed (date ranges, recurrence)

✅ Unique security requirements exist

✅ Complex business logic requires strict type safety

Assertions:

Calendar-specific validation should be enforceable

Specialized attachments should be handled correctly

Complex business logic should be type-safe

### Scenario 9: Type Parameter Order Importance
Description: Understand the significance of type parameter ordering

Parameter Hierarchy:

Entity Type (T): Defines the base data structure

Extended Type (K): Specifies entity extensions

Metadata Config (Meta): Controls metadata behavior

Attachment Type: Defines file attachment handling

Excluded Fields: Security and serialization control

Included Fields: Performance and data scope management

**Assertions:**

Parameter order should follow dependency requirements

Type inference should work correctly through the hierarchy

Default parameters should be sensible for each position

This documentation now follows your exact pattern with bold scenario titles, proper code blocks with 

```typescript, and consistent bullet point structure for steps and assertions.