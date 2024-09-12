// SchemaField.ts
export interface SchemaField {
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    required?: boolean;
    default?: any;
    properties?: Record<string, SchemaField>; // For nested objects
    items?: SchemaField[]; // For arrays
}




const schemaField: SchemaField = {
    type:"",
    required: true,
    default: "any",
    properties: {}, // For nested objects
    items: [] // For arrays
}