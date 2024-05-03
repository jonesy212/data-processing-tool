import crypto from 'crypto';
import * as ApiDataAnalysis from '../../api/ApiDataAnalysis';
import generateSecretKey from '../../utils/generateSecretKey';
import { TextProps } from '@/app/libraries/animations/DraggableAnimation/useText';





class TextType {
    private text: string;
    private secretKey: string | undefined;

    constructor(props: TextProps) {
        this.text = props.text;
        this.secretKey = generateSecretKey();
    }

    getText(): string {
        return this.text;
    }

    setText(text: string): void {
        this.text = text;
    }

    appendText(textToAppend: string): void {
        this.text += textToAppend;
    }

    prependText(textToPrepend: string): void {
        this.text = textToPrepend + this.text;
    }

    clearText(): void {
        this.text = "";
    }

    countWords(): number {
        const words = this.text.split(/\s+/);
        return words.length;
    }

    containsWord(word: string): boolean {
        const words = this.text.split(/\s+/);
        return words.includes(word);
    }

    replaceWord(oldWord: string, newWord: string): void {
        this.text = this.text.replace(new RegExp(oldWord, 'g'), newWord);
    }



    getSecretKey(): string | undefined {
        return this.secretKey;
    }

    setSecretKey(secretKey: string): void {
        this.secretKey = secretKey;
    }


    generateSecretKey(): void {
        // Generate a new secret key
        this.secretKey = generateSecretKey();
    }
    // Additional enterprise-level functionality
    
  encryptText(): void {
    // Check if a secret key exists
    if (!this.secretKey) {
      // Generate a new secret key
      this.generateSecretKey();
      // Notify that a new secret key has been generated
      console.log("A new encryption key has been generated.");
    }

    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);

    // Create a cipher object using AES algorithm and secret key
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(this.secretKey!),
      iv
    );

    // Encrypt the input text
    let encryptedText = cipher.update(this.text, "utf-8", "hex");
    encryptedText += cipher.final("hex");

    // Concatenate the IV and encrypted text for storage or transmission
    this.text = iv.toString("hex") + encryptedText;
  }

  decryptText(): void {
    // Extract the IV from the encrypted text (first 32 characters)
    const ivHex = this.text.substring(0, 32);
    const iv = Buffer.from(ivHex, "hex");

    // Extract the encrypted data (from the 33rd character onwards)
    const encryptedText = this.text.substr(32);

    // Create a decipher object with the same algorithm, key, and IV used for encryption
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(this.secretKey!),
      iv
    );

    // Decrypt the encrypted text
    let decryptedText = decipher.update(encryptedText, "hex", "utf-8");
    decryptedText += decipher.final("utf-8");

    // Update the text with the decrypted content
    this.text = decryptedText;
  }

    analyzeSentiment(): Promise<string> {
        // Call the sentiment analysis API to analyze the sentiment of the text
        return ApiDataAnalysis.fetchSentimentAnalysis(this.text)
            .then((result: any) => result.sentiment)
            .catch((error: any) => {
                console.error('Error performing sentiment analysis:', error);
                return 'Unknown'; // Return 'Unknown' sentiment in case of error
            });
    }

    generateSummary(): string {
        // Logic to generate a summary of the text content
        return "Summary of the text content"; // Placeholder for summary generation logic
    }
}


export default TextType;
// Example usage:
const text = new TextType({
    text: "Welcome to our project management app!",
    onDragStart: () => {},
    onDragMove: (dragX: number, dragY: number) => {},
    onDragEnd: () => { },
    "TextType": "Plain Text"
});
console.log("Original Text:", text.getText());

text.appendText(" Our platform offers a comprehensive suite of tools.");
console.log("Appended Text:", text.getText());

console.log("Word Count:", text.countWords());

console.log("Contains 'project'?", text.containsWord("project"));

text.replaceWord("management", "collaboration");
console.log("Replaced Text:", text.getText());

text.encryptText();
console.log("Encrypted Text:", text.getText());

text.decryptText();
console.log("Decrypted Text:", text.getText());

console.log("Sentiment Analysis:", text.analyzeSentiment());

console.log("Summary:", text.generateSummary());
