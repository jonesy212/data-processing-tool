// parseXML
import { parseString } from 'xml2js'; // Importing the xml2js library for XML parsing

// Define the function to parse XML content
export function parseXML(xmlContent: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Parse the XML content using xml2js
    parseString(xmlContent, (error, result) => {
      if (error) {
        // If there's an error parsing the XML, reject the promise with the error
        reject(error);
      } else {
        // If parsing is successful, resolve the promise with the parsed result
        resolve(result);
      }
    });
  });
}

// Usage example:
const xmlContent = '<document><title>Hello XML</title><content>This is XML content</content></document>';
parseXML(xmlContent)
  .then((parsedData) => {
    // Handle the parsed XML data
    console.log('Parsed XML:', parsedData);
  })
  .catch((error) => {
    // Handle parsing errors
    console.error('Error parsing XML:', error);
  });
