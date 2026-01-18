// DataPrivacyRule.ts
// Define the DataPrivacyRule class
class DataPrivacyRule {
  private id: string;
  private name: string;
  private description: string;
  private enabled: boolean;

  constructor(id: string, name: string, description: string, enabled: boolean) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.enabled = enabled;
  }

  // Getter methods
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Setter method to update the rule's enabled status
  setEnabled(isEnabled: boolean): void {
    this.enabled = isEnabled;
  }
}

// Example usage
const dataPrivacyRule = new DataPrivacyRule(
  "1",
  "Anonymize Personal Data",
  "Anonymizes personal data to protect user privacy.",
  true
);

// Get data privacy rule properties
console.log("Rule Name:", dataPrivacyRule.getName());
console.log("Rule Description:", dataPrivacyRule.getDescription());
console.log("Is Rule Enabled?", dataPrivacyRule.isEnabled());

// Update the rule's enabled status
dataPrivacyRule.setEnabled(false);
console.log("Is Rule Enabled Now?", dataPrivacyRule.isEnabled());

