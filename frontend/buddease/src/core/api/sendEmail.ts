sendEmail.ts
// This is the utility function (no React)
export async function sendEmail(
  recipient: string,
  subject: string,
  message: string
): Promise<void> {
  // Example: call your backend API route
  const response = await fetch("/api/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient, subject, message }),
  });

  if (!response.ok) {
    throw new Error("Failed to send email");
  }
}
