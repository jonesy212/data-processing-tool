// credentialConstants.ts

export const ISSUER_DID = 'did:example:issuer'; // Example issuer DID
export const SUBJECT_DID = 'did:example:subject'; // Example subject DID
export const CREDENTIAL_TYPE = 'VerifiableCredential'; // Example credential type
export const CREDENTIAL_CONTEXT = [
  'https://www.w3.org/2018/credentials/v1',
  'https://www.w3.org/2018/credentials/examples/v1'
]; // Example credential context
export const ISSUANCE_DATE = new Date().toISOString(); // Example issuance date (current date)
export const EXPIRATION_DATE = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // Example expiration date (1 year from issuance)
export const CREDENTIAL_SUBJECT = {
  id: SUBJECT_DID,
  name: 'John Doe',
  age: 30
}; // Example credential subject data
