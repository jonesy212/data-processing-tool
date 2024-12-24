/**
 * Function to validate if a given metadata object is valid.
 * @param {Object} meta - The metadata object to validate.
 * @param {Object} [schema] - Optional schema to validate the metadata against.
 * @returns {boolean} - Returns true if the metadata is valid, otherwise false.
 */
function isValidMeta(meta, schema = {}) {
  // Check if meta is an object and not null
  if (typeof meta !== 'object' || meta === null) {
    return false;
  }

  // Check if meta has the required properties specified in the schema
  for (const [key, valueType] of Object.entries(schema)) {
    if (!(key in meta)) {
      console.warn(`Missing required property: ${key}`);
      return false;
    }

    const value = meta[key];
    const expectedType = typeof valueType === 'string' ? valueType : 'any';
    
    if (expectedType !== 'any' && typeof value !== expectedType) {
      console.warn(`Type mismatch for property '${key}': expected '${expectedType}', got '${typeof value}'`);
      return false;
    }
  }

  // Optionally, check for extra properties not in the schema
  for (const key of Object.keys(meta)) {
    if (!(key in schema)) {
      console.warn(`Unexpected property '${key}' in metadata.`);
    }
  }

  return true;
}


export { isValidMeta };

// Example usage
const exampleMeta = {
  title: "Example Title",
  description: "A brief description of the content.",
  version: 1
};

const schema = {
  title: 'string',
  description: 'string',
  version: 'number'
};

console.log(isValidMeta(exampleMeta, schema)); // true or false based on the validation
