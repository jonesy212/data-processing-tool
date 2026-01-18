// sendSMS.ts
// Utility function to send SMS (no React imports here)
export async function sendSMS(phoneNumber: string, message: string): Promise<void> {
  // Replace this with your actual logic for sending SMS
  // Example: call an API route
  const response = await fetch("/api/sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, message }),
  });

  if (!response.ok) {
    throw new Error("Failed to send SMS");
  }
}
