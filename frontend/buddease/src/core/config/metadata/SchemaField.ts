// SchemaField.ts

interface SchemaField {
    schemaType: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    required?: boolean;
    default?: any;
    schemaProperties?: Record<string, SchemaField>; // For nested objects
    items?: SchemaField[]; // For arrays
}



const schemaField: SchemaField = {
    schemaType:"string",
    required: true,
    default: "any",
    schemaProperties: {}, // For nested objects
    items: [] // For arrays
}


export type { SchemaField }