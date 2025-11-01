Core Rules

1. ALWAYS use all 6 generic parameters in snapshot-related functions

2. NEVER omit any generic parameters — it breaks type inference

3. FOLLOW the established patterns for creating/extending snapshots

**Quick Start**
```typescript
// ✅ CORRECT - Follow the 6-parameter pattern
const myFunction = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  // Your implementation
};
```

**Extension Points**

# Create new snapshot types by extending BaseDataEntity

## Add metadata via DefaultMeta extensions

## Implement custom attachment handlers

```typescript
3. Provide Safe Extension Utilities
// Framework-provided extension helpers
export class SnapshotFramework {
  /**
   * SAFELY create new snapshot functions
   * Ensures all 6 parameters are included
   */
  static createSnapshotFunction<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    implementation: (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => void
  ) {
    return implementation;
  }

  /**
   * Template for new snapshot operations
   */
  static createSnapshotOperationTemplate = `
  const myNewOperation = async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    // YOUR IMPLEMENTATION HERE
    // Framework guarantees type safety
  };
  `;
}
```

**4. Validation & Linting Rules**
```typescript
// ESLint rule to enforce the 6-parameter pattern
export const snapshotGenericRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce 6 generic parameters in snapshot functions",
    },
  },
  create(context) {
    return {
      FunctionDeclaration(node) {
        if (
          node.id?.name.includes('Snapshot') ||
          node.params.some(
            (p) =>
              p.typeAnnotation?.typeAnnotation.typeName?.name === 'Snapshot'
          )
        ) {
          if (!node.typeParameters || node.typeParameters.params.length !== 6) {
            context.report({
              node,
              message: "Snapshot functions must use all 6 generic parameters",
            });
          }
        }
      },
    };
  },
};
```

```typescript
5. Developer-Friendly Error Messages
// Runtime validation for development
export function validateSnapshotFunction(fn: Function, functionName: string) {
  const source = fn.toString();
  const genericParams = (source.match(/<[^>]*>/)?.[0] || '').split(',').length;

  if (genericParams !== 6) {
    throw new Error(`
    🚨 SNAPSHOT FRAMEWORK ERROR in ${functionName}
    
    You must use ALL 6 generic parameters:
    <T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    
    Received: ${genericParams} parameters
    
    Fix: Add the missing generic parameters following the framework pattern.
    `);
  }
}
```