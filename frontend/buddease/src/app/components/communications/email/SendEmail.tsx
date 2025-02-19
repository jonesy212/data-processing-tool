import { useState } from 'react';
import React from "react";



export const sendEmail = (recipient: string, subject: string, message: string) => {
  // Replace this with your actual logic for sending emails
  alert(`Email sent to ${recipient} with subject: "${subject}"`);
  // Additional logic such as API calls can be added here
};
// Send Email Component
const SendEmail = () => {
  // State to track email details
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Function to send the email
  const handleSendEmail = () => {
    // Call the globally defined sendEmail function
    sendEmail(recipient, subject, message);
  };


  return (
    <div>
      <h3>Send Email</h3>
      <p>Compose and send an email to a recipient.</p>

      {/* Recipient Input */}
      <label>
        Recipient:
        <input type="email" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
      </label>

      {/* Subject Input */}
      <label>
        Subject:
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </label>

      {/* Message Textarea */}
      <label>
        Message:
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>

      {/* Send Button */}
      <button onClick={handleSendEmail}>Send Email</button>
    </div>
  );
};



export default SendEmail;
