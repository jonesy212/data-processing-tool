import fs from 'fs';

// Step 1: Generate ABI contracts
const abiContracts = {
  contract1: 'ABI1',
  contract2: 'ABI2',
  // Add more contracts as needed
};

// Step 2: Encrypt the ABI contracts using AES encryption with a secret key
const secretKey = 'your-secret-key';
const algorithm = 'aes-256-cbc'; // Choose your preferred algorithm
const iv = (crypto as any).randomBytes(16); // Generate a random initialization vector

const cipher = (crypto as any).createCipheriv(algorithm, Buffer.from(secretKey), iv);

let encryptedAbiContracts = cipher.update(JSON.stringify(abiContracts), 'utf8', 'hex');
encryptedAbiContracts += cipher.final('hex');

// Step 3: Store the encrypted ABI contracts in the .env file
const envFilePath = '.env';
fs.writeFileSync(envFilePath, `ENCRYPTED_ABI_CONTRACTS=${encryptedAbiContracts}\nIV=${iv.toString('hex')}`);

console.log('ABI contracts securely stored in the .env file.');
