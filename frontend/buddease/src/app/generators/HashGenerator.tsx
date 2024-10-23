// HashGenerator.tsx
class HashGenerator {
  static generateHash(input: string, algorithm: string = "sha256"): string {
    const crypto = require("crypto");
    const hash = crypto.createHash(algorithm);
    hash.update(input);
    return hash.digest("hex");
  }

  static generateCryptographicHash(
    input: string,
    purpose: string = "general"
  ): string {
    switch (purpose) {
      case "wallet":
        return this.generateHash(input, "sha512"); // Example using SHA-512 for wallet hash
      case "communication":
        return this.generateHash(input, "md5"); // Example using MD5 for communication hash
      case "community":
        return this.generateHash(input, "sha256"); // Example using SHA-256 for community hash
      // Add more cases for other relevant purposes as needed
      default:
        return this.generateHash(input); // Default to SHA-256 for general purpose hash
    }
  }
}


export default HashGenerator
// Example usage:
const input = "exampleInput";
const hash = HashGenerator.generateHash(input);
console.log("Hash:", hash);

const cryptographicHash = HashGenerator.generateCryptographicHash(input);
console.log("Cryptographic Hash:", cryptographicHash);
