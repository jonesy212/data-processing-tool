// generateSecretKey.ts

const crypto = require('crypto');

function generateSecretKey() {
    return crypto.randomBytes(32).toString('hex');
}

console.log(generateSecretKey());
