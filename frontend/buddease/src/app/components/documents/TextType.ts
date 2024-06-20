import { TextProps } from "@/app/libraries/animations/DraggableAnimation/useText";
import crypto from "crypto";
import * as ApiDataAnalysis from "../../api/ApiDataAnalysis";
import generateSecretKey from "../../utils/generateSecretKey";

class TextType {
  private text: string;
  private secretKey: string | undefined;
  onTextDragEnd: (dragX: number, dragY: number) => Promise<void>;

  constructor(props: TextProps) {
    this.text = props.text;
      this.secretKey = generateSecretKey();
      this.onTextDragEnd = props.onTextDragEnd;
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
    this.text = this.text.replace(new RegExp(oldWord, "g"), newWord);
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
    return ApiDataAnalysis.fetchSentimentAnalysisResults(this.text)
      .then((result: any) => result.sentiment)
      .catch((error: any) => {
        console.error("Error performing sentiment analysis:", error);
        return "Unknown"; // Return 'Unknown' sentiment in case of error
      });
  }

  // Method to generate a summary of the text content
  generateSummary(): string {
    // Assuming a simplistic summary logic for demonstration
    const maxLength = 100; // Maximum length of the summary
    if (this.text.length <= maxLength) {
      return this.text; // Return the entire text if it's shorter than or equal to maxLength
    } else {
      return this.text.substring(0, maxLength) + "..."; // Otherwise, truncate and add ellipsis
    }
  }

  async updateText(newText: string): Promise<void> {
    // Example async operation to update text content
    this.text = newText;
    console.log(`Updated text: ${this.text}`);

    // Example of calling onTextDragEnd after updating the text
    try {
      await this.onTextDragEnd(0, 0);
      console.log("Text update complete.");
    } catch (error) {
      console.error("Error updating text:", error);
    }
  }
}
const text = new TextType({
  text: "Welcome to our project management app!",
  onDragStart: () => {},
  onDragMove: (dragX: number, dragY: number) => {},
  onDragEnd: () => {},
  onTextDragStart: () => {},
  onTextDragMove: (drawingId: string, dragX: number, dragY: number) => {},
  onTextDragEnd: (dragX: number, dragY: number) => Promise.resolve(),

  TextType: "Plain Text",
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


const textInstance = new TextType({
  text: "Welcome to our project management app! This is a demonstration of generating a summary.",
  onDragStart: () => {},
  onDragMove: (dragX, dragY) => {},
  onDragEnd: () => {},
  TextType: "Plain Text",
  onTextDragStart: () => {},
  onTextDragMove: (drawingId, dragX, dragY) => {},
  onTextDragEnd: async (dragX, dragY) => {
    // Simulate saving to backend with a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`Text drag ended at (${dragX}, ${dragY})`);
  },
});


const summary = textInstance.generateSummary();
console.log(summary); 

export default TextType;
