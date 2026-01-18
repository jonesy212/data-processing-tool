// getDefaultValueForField.tsx

// Example function to get default values for new fields
function getDefaultValueForField(defaultType: string): any {
  switch (defaultType as 'string' | 'number' | 'boolean' | 'array' | 'object') {
    case 'string':
      return "defaultValue"; // Default string value
    case 'number':
      return 0; // Default numeric value
    case 'boolean':
      return false; // Default boolean value
    case 'array':
      return []; // Default empty array
    case 'object':
      return { key: 'defaultKey', value: 'defaultValue' }; // Default object
    default:
      return null; // Default for any other types
  }
}