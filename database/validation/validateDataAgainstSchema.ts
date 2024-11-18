// validateDataAgainstSchema.ts
import { Data } from './../../components/models/data/Data';
import { SnapshotStoreConfig } from './../../frontend/buddease/src/app/components/snapshots/SnapshotStoreConfig';
import { SchemaField } from './../../database/SchemaField';

// Function to validate data against a schema

function validateDataAgainstSchema(data: any, schema: Record<string, SchemaField>): boolean {
    for (const key in schema) {
        const fieldSchema = schema[key];
        const value = data[key];
        
        // Check for required fields
        if (fieldSchema.required && value === undefined) {
            return false; // Required field is missing
        }

        // Validate type
        if (value !== undefined && typeof value !== fieldSchema.type) {
            return false; // Type mismatch
        }

        // Recursively validate nested objects
        if (fieldSchema.type === 'object' && fieldSchema.properties) {
            if (!validateDataAgainstSchema(value, fieldSchema.properties)) {
                return false;
            }
        }

        // Validate array items
        if (fieldSchema.type === 'array' && fieldSchema.items) {
            if (!Array.isArray(value)) {
                return false; // Not an array
            }
            for (const item of value) {
                if (!validateDataAgainstSchema(item, { item: fieldSchema.items })) {
                    return false; // Array item validation failed
                }
            }
        }
    }
    return true; // Data is valid
}

export { validateDataAgainstSchema }














// Example usage

// Example schema definition
const exampleSchema: Record<string, SchemaField> = {
    id: { type: 'string', required: true },
    category: { type: 'string' },
    timestamp: { type: 'date', required: true },
    data: {
        type: 'object',
        properties: {
            name: { type: 'string', required: true },
            value: { type: 'number' }
        }
    }
};

// Example SnapshotStoreConfig using the schema
const snapshotStoreConfig: SnapshotStoreConfig<Data, Data> = {
    name: 'exampleStore',
    version: "1",
    schema: exampleSchema,


    options: {
        id: 'exampleStoreId',
        storeId: 0,
        baseURL: 'https://example.com/api',
        enabled: true,
        // Add other required properties here
    }
};


const isValidSchema = validateDataAgainstSchema({
    id: '123',
    timestamp: new Date(),
    data: { name: 'example', value: 42 }
}, exampleSchema);

console.log(isValidSchema); // Output: true or false based on validation
