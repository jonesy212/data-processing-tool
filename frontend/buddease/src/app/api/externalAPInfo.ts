// externalAPInfo.ts
import { externalAPIs } from "./externalAPIs";

// Accessing information about the Wix API
const wixAPI = externalAPIs.wix;
console.log('Name:', wixAPI.name);
console.log('Description:', wixAPI.description);
console.log('Documentation:', wixAPI.documentation);

// Accessing information about the Zapier API
const zapierAPI = externalAPIs.zapier;
console.log('Name:', zapierAPI.name);
console.log('Description:', zapierAPI.description);
console.log('Documentation:', zapierAPI.documentation);


// Accessing information about other APIs
const googleAPI = externalAPIs.google;
console.log('Name:', googleAPI.name);
console.log('Description:', googleAPI.description);
console.log('Documentation:', googleAPI.documentation);

const facebookAPI = externalAPIs.facebook;
console.log('Name:', facebookAPI.name);
console.log('Description:', facebookAPI.description);
console.log('Documentation:', facebookAPI.documentation);
